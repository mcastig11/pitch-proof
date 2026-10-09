'use strict';

const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const test = require('node:test');
const { withServerFixture } = require('./support/server-fixture.cjs');
const { createCaptureEmail: fixtureCapture } = require('./support/capture-email.cjs');

const apiKey = 're_test_secret_never_send';
const from = 'Pitch Proof <accounts@example.test>';
const recipient = 'singer@example.test';
const link = 'https://pitch.example.test/api/auth/verify-email?token=private-token&callbackURL=%2F';
const password = 'Vocal-practice-strong-password-42!';

async function adapters() {
  // RED exercises the missing send behavior instead of crashing on an import.
  if (!existsSync('server/email.mjs')) {
    return { createResendEmail: () => ({ async send() {} }), createCaptureEmail: fixtureCapture };
  }
  return import('../server/email.mjs');
}

function sanitized(error) {
  assert.equal(error.code, 'EMAIL_DELIVERY_FAILED');
  assert.equal(error.message, 'Account email could not be delivered. Please try again.');
  assert.equal(error.cause, undefined);
  assert.doesNotMatch(JSON.stringify(error) + String(error), /re_test_secret|private-token|singer@example/);
  return true;
}

test('Resend adapter sends exactly one authenticated HTTPS account email', async () => {
  const { createResendEmail } = await adapters();
  const calls = [];
  const transport = createResendEmail({ apiKey, from, fetchImpl: async (...args) => {
    calls.push(args);
    return new Response(JSON.stringify({ id: 'accepted-message' }), { status: 200 });
  } });
  await transport.send({ kind: 'verification', recipient, link });
  assert.equal(calls.length, 1, 'account confirmation must send one request');
  const [url, options] = calls[0];
  assert.equal(url, 'https://api.resend.com/emails');
  assert.equal(options.method, 'POST');
  assert.equal(options.redirect, 'error', 'credentials must never follow a redirect');
  assert.equal(options.headers.Authorization, `Bearer ${apiKey}`);
  assert.equal(options.headers['Content-Type'], 'application/json');
  assert.equal(options.headers['User-Agent'], 'Pitch-Proof/1.0');
  assert.ok(options.signal instanceof AbortSignal);
  const body = JSON.parse(options.body);
  assert.equal(body.from, from);
  assert.deepEqual(body.to, [recipient]);
  assert.equal(body.subject, 'Confirm your Pitch Proof email');
  assert.ok(body.text.includes(link));
  assert.ok(body.html.includes('token=private-token&amp;callbackURL=%2F'));
  assert.deepEqual(Object.keys(body).sort(), ['from', 'html', 'subject', 'text', 'to']);
});

test('Resend reset content is distinct and provider acceptance is checked', async () => {
  const { createResendEmail } = await adapters();
  let body;
  const transport = createResendEmail({ apiKey, from, fetchImpl: async (_url, options) => {
    body = JSON.parse(options.body);
    return new Response(JSON.stringify({ id: 'accepted-reset' }));
  } });
  assert.deepEqual(await transport.send({ kind: 'reset', recipient, link }), { id: 'accepted-reset' });
  assert.equal(body.subject, 'Reset your Pitch Proof password');
  assert.match(body.text, /sign in again/);
});

test('Resend rejects missing or malformed settings before invoking fetch', async () => {
  const { createResendEmail } = await adapters();
  let called = false;
  const fetchImpl = async () => { called = true; };
  for (const options of [{ from }, { apiKey }, { apiKey: ' ', from }, { apiKey, from: 'bad\r\nBcc: attacker@example.test' }]) {
    assert.throws(() => createResendEmail({ ...options, fetchImpl }), (error) => {
      assert.doesNotMatch(String(error), /re_test_secret|attacker/);
      return true;
    });
  }
  assert.equal(called, false);
});

test('Resend rejects provider and network failures with only fixed diagnostics', async () => {
  const { createResendEmail } = await adapters();
  for (const fetchImpl of [
    async () => new Response(JSON.stringify({ message: `${apiKey} ${link} ${recipient}` }), { status: 401 }),
    async () => new Response(JSON.stringify({ id: 'unexpected-redirect' }), { status: 302 }),
    async () => new Response(JSON.stringify({ error: `${apiKey} ${link}` })),
    async () => new Response(JSON.stringify({ id: '' })),
    async () => new Response('invalid json'),
    async () => { throw new Error(`${apiKey} ${link} ${recipient}`); },
  ]) {
    const transport = createResendEmail({ apiKey, from, fetchImpl });
    await assert.rejects(transport.send({ kind: 'verification', recipient, link }), sanitized);
  }
});

test('Resend bounds fetch and response-body waits with an abort signal', async () => {
  const { createResendEmail } = await adapters();
  for (const waitOnBody of [false, true]) {
    let signal;
    const transport = createResendEmail({ apiKey, from, timeoutMs: 20, fetchImpl: async (_url, options) => {
      signal = options.signal;
      const neverFinishes = new Promise(() => {});
      return waitOnBody ? { ok: true, json: () => neverFinishes } : neverFinishes;
    } });
    await assert.rejects(transport.send({ kind: 'reset', recipient, link }), sanitized);
    assert.equal(signal.aborted, true);
  }
});

test('Resend rejects non-account messages, insecure links and malformed recipients', async () => {
  const { createResendEmail } = await adapters();
  let calls = 0;
  const transport = createResendEmail({ apiKey, from, fetchImpl: async () => { calls += 1; } });
  for (const message of [
    { kind: 'broadcast', recipient, link },
    { kind: 'reset', recipient: [recipient, 'another@example.test'], link },
    { kind: 'reset', recipient: 'a@example.test\nBcc: b@example.test', link },
    { kind: 'reset', recipient, link: 'http://pitch.example.test/reset?token=private-token' },
    { kind: 'reset', recipient, link: 'https://user:password@pitch.example.test/reset' },
    { kind: 'reset', recipient, link: 'javascript:alert(1)' },
  ]) await assert.rejects(transport.send(message), sanitized);
  assert.equal(calls, 0);
});

test('capture transport and Resend are interchangeable at verification and reset callbacks', async () => {
  const { createCaptureEmail, createResendEmail } = await adapters();
  const { createApp } = await import('../server/app.mjs');
  for (const mode of ['capture', 'resend']) {
    const bodies = [];
    const emailTransport = mode === 'capture' ? createCaptureEmail() : createResendEmail({ apiKey, from, fetchImpl: async (_url, options) => {
      bodies.push(JSON.parse(options.body));
      return new Response(JSON.stringify({ id: 'accepted-test' }));
    } });
    let app;
    await withServerFixture(async (fixture) => {
      try {
        await app.locals.auth.api.signUpEmail({ body: { email: recipient, password, name: 'Singer' } });
        await app.locals.auth.api.requestPasswordReset({ body: { email: recipient, redirectTo: '/reset-password' } });
        if (mode === 'capture') {
          const messages = emailTransport.getMessages();
          assert.deepEqual(messages.map((value) => value.kind), ['verification', 'reset']);
          assert.ok(messages.every((value) => value.recipient === recipient && value.link.includes('token=')));
          messages[0].link = 'changed';
          assert.notEqual(emailTransport.getMessages()[0].link, 'changed');
        } else {
          assert.deepEqual(bodies.map((value) => value.subject), ['Confirm your Pitch Proof email', 'Reset your Pitch Proof password']);
          assert.ok(bodies.every((value) => value.to.length === 1 && value.to[0] === recipient));
        }
        assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);
      } finally { app?.locals.closeDatabase(); }
    }, { createApp: async ({ database }) => {
      app = await createApp({ databasePath: database.prepare('PRAGMA database_list').get().file, emailTransport, publicBaseURL: 'https://pitch.example.test' });
      return app;
    } });
  }
});

test('auth email failures preserve account-existence parity and sanitized server diagnostics', async (t) => {
  const { createApp } = await import('../server/app.mjs');
  let app;
  const diagnostics = [];
  t.mock.method(console, 'error', (...values) => diagnostics.push(values));
  await withServerFixture(async (fixture) => {
    try {
      const headers = { Origin: 'https://pitch.example.test', Host: 'pitch.example.test', 'Content-Type': 'application/json' };
      async function post(route, email) {
        return fetch(fixture.url + route, { method: 'POST', headers, body: JSON.stringify({ email, password, name: 'Singer' }) });
      }
      const signup = await post('/api/auth/sign-up/email', recipient);
      assert.equal(signup.status, 200, 'delivery outage must not reveal signup state');
      for (const route of ['/api/auth/send-verification-email', '/api/auth/request-password-reset']) {
        const known = await post(route, recipient);
        const unknown = await post(route, 'unknown@example.test');
        assert.equal(known.status, unknown.status);
        assert.deepEqual(await known.json(), await unknown.json());
      }
      assert.ok(diagnostics.length >= 3, 'delivery failures remain visible only as fixed server diagnostics');
      assert.doesNotMatch(JSON.stringify(diagnostics), /re_test_secret|private-token|singer@example/);
      assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);
    } finally { app?.locals.closeDatabase(); }
  }, { createApp: async ({ database }) => {
    app = await createApp({ databasePath: database.prepare('PRAGMA database_list').get().file, emailTransport: { async send() { throw new Error(`${apiKey} ${link} ${recipient}`); } }, publicBaseURL: 'https://pitch.example.test' });
    return app;
  } });
});
