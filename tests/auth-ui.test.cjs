'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { browserHarness } = require('./support/browser-harness.cjs');
const { withServerFixture } = require('./support/server-fixture.cjs');
const { request: httpRequest } = require('node:http');
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const reply = (data = {}, status = 200) => new Response(JSON.stringify(data), { status });
const generic = 'Check your email for the next step if the address is eligible.';
function auth(options) { return browserHarness('client/auth.js', options); }
function fill(h, values = { email: 'singer@example.test', password: 'strong-password' }) {
  for (const [key, value] of Object.entries(values)) h.get(key).value = value;
}

test('pending email state has clear confirmation copy, resend, and correction actions', async () => {
  const h = auth({ search: '?mode=signup', fetchImpl: async () => reply() });
  fill(h); await h.get('auth-form').emit('submit');
  assert.equal(h.get('auth-heading').textContent, 'Check your email');
  assert.match(h.get('auth-body').textContent, /Email confirmation is required/);
  assert.equal(h.get('auth-status').textContent, generic);
  for (const id of ['resend', 'correct-email', 'sign-in-link', 'example-link']) assert.equal(h.get(id).hidden, false);
  await h.get('resend').emit('click'); assert.equal(h.calls.at(-1)[0], '/api/auth/send-verification-email');
  assert.equal(h.get('auth-status').textContent, generic);
  await h.get('correct-email').emit('click');
  fill(h, { email: 'typo@example.test', password: 'secret-password', newEmail: 'correct@example.test' });
  await h.get('auth-form').emit('submit');
  assert.equal(h.calls.at(-1)[0], '/api/auth/correct-pending-email');
  assert.deepEqual(JSON.parse(h.calls.at(-1)[1].body), { email: 'typo@example.test', password: 'secret-password', newEmail: 'correct@example.test' });
  assert.equal(h.get('password').value, '');
});
test('signup, sign-in, and reset forms use accessible native semantics', () => {
  const html = read('auth.html'); assert.match(html, /<form[^>]*id="auth-form"[^>]*novalidate/);
  for (const id of ['email', 'password', 'newEmail']) assert.match(html, new RegExp(`<label[^>]*for="${id}"`));
  assert.match(html, /type="email"[^>]*autocomplete="email"/); assert.match(html, /type="password"/);
  assert.match(html, /role="status" aria-live="polite"/);
  for (const mode of ['signup', 'signin', 'reset-request', 'reset']) {
    const h = auth({ search: `?mode=${mode}&token=valid-token` });
    assert.ok(h.get('auth-heading').textContent.length > 0); assert.equal(h.document.activeElement, h.get('auth-heading'));
  }
});
test('blank and partial forms focus actionable errors without a request', async () => {
  const h = auth({ search: '?mode=signup' }); await h.get('auth-form').emit('submit');
  assert.equal(h.calls.length, 0); assert.equal(h.document.activeElement, h.get('email'));
  assert.equal(h.get('email-error').textContent, 'Enter your email address.');
  fill(h, { email: 'valid@example.test', password: 'short' }); await h.get('auth-form').emit('submit');
  assert.equal(h.calls.length, 0); assert.equal(h.get('email').value, 'valid@example.test');
  assert.equal(h.get('password-error').textContent, 'Use a password with 8–128 characters.');
  assert.equal(h.get('password').getAttribute('aria-invalid'), 'true');
});
test('first sign-in returns to example and later sign-in opens workspace', async () => {
  for (const destination of ['/', '/workspace']) {
    const h = auth({ fetchImpl: async (url) => reply(url === '/api/me/landing' ? { destination } : {}) }); fill(h);
    await h.get('auth-form').emit('submit'); assert.equal(h.window.location.assigned, destination); assert.equal(h.calls[1][0], '/api/me/landing');
  }
  const h = auth({ fetchImpl: async (url) => reply(url === '/api/me/landing' ? { destination: 'https://evil.example' } : {}) }); fill(h);
  await h.get('auth-form').emit('submit'); assert.equal(h.window.location.assigned, '');
  assert.equal(h.get('auth-status').textContent, 'Your request could not be completed. Try again.');
});
test('generic credential, pending confirmation, offline and rate-limit outcomes clear secrets', async () => {
  for (const [status, expected] of [[401, 'Email or password is incorrect. Check your details and try again.'], [429, 'Please wait before trying again.'], [500, 'Your request could not be completed. Try again.']]) {
    const h = auth({ fetchImpl: async () => reply({}, status) }); fill(h); await h.get('auth-form').emit('submit');
    assert.equal(h.get('auth-status').textContent, expected); assert.equal(h.get('password').value, ''); assert.equal(h.get('auth-submit').disabled, false);
  }
  const h = auth({ fetchImpl: async () => reply({ code: 'EMAIL_NOT_VERIFIED' }, 403) }); fill(h);
  await h.get('auth-form').emit('submit'); assert.equal(h.get('auth-heading').textContent, 'Check your email');
  const offline = auth({ fetchImpl: async () => { throw new Error('offline'); } }); fill(offline); await offline.get('auth-form').emit('submit');
  assert.equal(offline.get('auth-status').textContent, 'We could not reach Pitch Proof. Check your connection and try again.');
});
test('generic account results match for known and unknown accounts and prevent duplicate requests', async () => {
  for (const mode of ['signup', 'reset-request', 'resend']) {
    const states = [];
    for (const email of ['known@example.test', 'unknown@example.test']) {
      const h = auth({ search: `?mode=${mode}`, fetchImpl: async () => reply({ message: email }) }); fill(h, { email, password: 'strong-password' });
      await h.get('auth-form').emit('submit'); states.push(h.get('auth-status').textContent);
    }
    assert.deepEqual(states, [generic, generic]);
  }
  let resolve; const h = auth({ search: '?mode=signup', fetchImpl: () => new Promise((r) => { resolve = r; }) }); fill(h);
  const first = h.get('auth-form').emit('submit'); await h.get('auth-form').emit('submit');
  assert.equal(h.calls.length, 1); assert.equal(h.get('auth-status').textContent, 'Creating your private space…');
  await h.get('reset-link').emit('click'); resolve(reply()); await first;
  assert.equal(h.get('auth-heading').textContent, 'Reset your password', 'late signup cannot replace newer state');
});
test('verification and reset links never fabricate success and reset requires fresh sign-in', async () => {
  for (const search of ['?mode=verify', '?mode=verify&error=INVALID_TOKEN', '?mode=reset', '?mode=reset&token=secret&error=INVALID_TOKEN']) {
    const h = auth({ search }); assert.match(h.get('auth-body').textContent, /no longer valid/); assert.equal(h.get('auth-form').hidden, true);
    assert.doesNotMatch(h.get('auth-body').textContent, /secret/);
  }
  const failed = auth({ search: '?mode=verify&confirmed=1', fetchImpl: async () => reply({ confirmed: false }, 400) }); await failed.flush();
  assert.match(failed.get('auth-body').textContent, /no longer valid/);
  const success = auth({ search: '?mode=verify&confirmed=1', fetchImpl: async () => reply({ confirmed: true }) }); await success.flush();
  assert.equal(success.get('auth-heading').textContent, 'Email confirmed');
  const h = auth({ search: '?mode=reset&token=secret', fetchImpl: async () => reply() }); fill(h, { password: 'new-strong-password' });
  await h.get('auth-form').emit('submit'); assert.equal(h.get('auth-heading').textContent, 'Password updated');
  assert.equal(h.window.location.assigned, ''); assert.equal(h.get('password').value, '');
  assert.equal(h.get('sign-in-link').href, '/auth?mode=signin&returnTo=%2Fworkspace');
  const invalid = auth({ search: '?mode=reset&token=secret', fetchImpl: async () => reply({ code: 'INVALID_TOKEN' }, 400) }); fill(invalid, { password: 'new-strong-password' });
  await invalid.get('auth-form').emit('submit'); assert.equal(invalid.get('auth-form').hidden, true); assert.match(invalid.get('auth-body').textContent, /no longer valid/);
});
test('browser auth source never persists passwords or bearer tokens', () => { assert.doesNotMatch(read('client/auth.js'), /localStorage|sessionStorage|document\.cookie/); });

async function withUiServer(callback) {
  const { createApp } = await import('../server/app.mjs'); let app;
  return withServerFixture(async (fixture) => {
    const request = (route, { body, cookie } = {}) => new Promise((resolve, reject) => {
      const outgoing = httpRequest(`${fixture.url}${route}`, { method: body ? 'POST' : 'GET', headers: {
        host: '127.0.0.1', origin: 'http://127.0.0.1', ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}),
      } }, (incoming) => {
        const chunks = []; incoming.on('data', (chunk) => chunks.push(chunk)); incoming.on('end', () => {
          const headers = new Headers(); for (let i = 0; i < incoming.rawHeaders.length; i += 2) headers.append(incoming.rawHeaders[i], incoming.rawHeaders[i + 1]);
          resolve(new Response(Buffer.concat(chunks), { status: incoming.statusCode, headers }));
        }); incoming.on('error', reject);
      }); outgoing.on('error', reject); outgoing.end(body ? JSON.stringify(body) : undefined);
    });
    try { await callback(fixture, request); } finally { app.locals.closeDatabase(); }
  }, { createApp: async ({ database, emailTransport }) => {
    app = await createApp({ databasePath: database.prepare('PRAGMA database_list').get().file, emailTransport, publicBaseURL: 'http://127.0.0.1' }); return app;
  } });
}

test('real verification callback proves confirmation server-side and rejects unsafe routes', async () => {
  await withUiServer(async (fixture, request) => {
    assert.equal((await request('/api/auth/confirmation-result')).status, 400, 'query flags alone cannot claim confirmation');
    await request('/api/auth/sign-up/email', { body: { email: 'callback@example.test', password: 'strong-password', name: 'Singer', callbackURL: '/auth?mode=verify' } });
    const link = new URL(fixture.emailTransport.getLink('verification', 'callback@example.test'));
    const verified = await request(link.pathname + link.search);
    assert.equal(verified.headers.get('location'), '/auth?mode=verify&confirmed=1');
    const receipt = verified.headers.getSetCookie().find((value) => value.startsWith('pitch-proof.confirmation='));
    assert.match(receipt, /HttpOnly/); assert.doesNotMatch(receipt, /session_token/);
    const proof = await request('/api/auth/confirmation-result', { cookie: receipt.split(';')[0] });
    assert.deepEqual(await proof.json(), { confirmed: true }); assert.equal(proof.headers.get('cache-control'), 'no-store');
    const used = await request(link.pathname + link.search + '&confirmed=1');
    assert.match(used.headers.get('location'), /error=INVALID_TOKEN/); assert.doesNotMatch(used.headers.get('location'), /confirmed=1/);
    assert.equal((await request('/api/auth/verify-email?token=invalid&callbackURL=https%3A%2F%2Fevil.example')).status, 403);
    assert.equal((await request('/api/auth/verify-email?token=invalid&callbackURL=%2Fserver%2Fapp.mjs')).status, 403);
  });
});

function workspace(options = {}) { return browserHarness('client/workspace.js', { page: 'workspace', ...options }); }
test('welcome page gives Try the example and Sign in equal weight', () => {
  const html = read('welcome.html');
  const actions = [...html.matchAll(/<a class="action" href="([^"]+)">([^<]+)<\/a>/g)];
  assert.deepEqual(actions.map((match) => [match[1], match[2]]), [['/', 'Try the example'], ['/auth?mode=signin', 'Sign in']]);
  assert.doesNotMatch(html, /class="primary"/); assert.match(html, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});
test('expired workspace session clears private content and offers sign-in', async () => {
  let valid = true;
  const h = workspace({ fetchImpl: async () => valid ? reply({ identity: '<Singer> very-long@example.test' }) : reply({}, 401) });
  await h.flush(); assert.match(h.get('private-content').textContent, /<Singer> very-long@example.test/);
  assert.match(h.get('private-content').textContent, /Your own scores are coming next\./);
  assert.equal(h.calls[0][1].cache, 'no-store'); assert.equal(h.calls[0][1].credentials, 'same-origin');
  valid = false; await h.event('window:pageshow', { persisted: true });
  assert.equal(h.get('private-content').textContent, ''); assert.equal(h.get('account-nav').hidden, true);
  assert.equal(h.get('workspace-heading').textContent, 'Your sign-in has ended');
  assert.equal(h.document.activeElement, h.get('workspace-heading'));
  assert.equal(h.get('workspace-signin').href, '/auth?mode=signin&returnTo=%2Fworkspace');
});
test('workspace visibility clears identity immediately and rejects stale asynchronous responses', async () => {
  const pending = [];
  const h = workspace({ fetchImpl: () => new Promise((resolve) => pending.push(resolve)) });
  assert.equal(h.get('private-content').textContent, '');
  await h.event('window:pageshow', { persisted: true });
  pending[1](reply({}, 401)); await h.flush();
  pending[0](reply({ identity: 'Stale Singer' })); await h.flush();
  assert.equal(h.get('private-content').textContent, '');
  await h.event('document:visibilitychange'); pending[2](reply({ identity: 'Current Singer' })); await h.flush();
  assert.match(h.get('private-content').textContent, /Current Singer/);
  h.document.hidden = true; await h.event('document:visibilitychange');
  assert.equal(h.get('private-content').textContent, '');
  assert.equal(h.get('account-nav').hidden, true);
});
test('workspace network, server and malformed responses remove private data without claiming expiry', async () => {
  for (const fetchImpl of [async () => { throw new Error('offline'); }, async () => reply({}, 500), async () => reply({ identity: '' }), async () => reply({ identity: {} })]) {
    const h = workspace({ fetchImpl }); await h.flush();
    assert.equal(h.get('private-content').textContent, '');
    assert.equal(h.get('workspace-heading').textContent, 'Your private space could not be opened');
    assert.equal(h.get('workspace-retry').hidden, false); assert.equal(h.get('workspace-example').href, '/');
  }
});
test('sign-out clears private content immediately, prevents duplicates and confirms server success', async () => {
  let resolve; const h = workspace({ fetchImpl: async (url) => url === '/api/me/workspace' ? reply({ identity: 'Singer' }) : new Promise((r) => { resolve = r; }) });
  await h.flush(); const logout = h.get('sign-out').emit('click'); await h.get('sign-out').emit('click');
  assert.equal(h.get('private-content').textContent, ''); assert.equal(h.window.location.assigned, '');
  assert.equal(h.calls.filter(([url]) => url === '/api/auth/sign-out').length, 1);
  resolve(reply({}, 500)); await logout; assert.equal(h.window.location.assigned, '');
  assert.equal(h.get('sign-out').disabled, false); assert.match(h.get('account-status').textContent, /could not be completed/);
  const retry = h.get('sign-out').emit('click'); resolve(reply()); await retry;
  assert.equal(h.window.location.assigned, '/welcome');
});
test('Account native disclosure Escape restores trigger focus', async () => {
  const h = workspace({ fetchImpl: async () => reply({ identity: 'Singer' }) }); await h.flush();
  h.get('account-menu').open = true; await h.get('account-menu').emit('keydown', { key: 'Escape' });
  assert.equal(h.get('account-menu').open, false); assert.equal(h.document.activeElement, h.get('account-trigger'));
  assert.match(read('workspace.html'), /<details id="account-menu"[\s\S]*<summary id="account-trigger">Account<\/summary>[\s\S]*id="sign-out"/);
});
test.todo('signed-in example shows My space and keeps sign-out in the account menu');
test.todo('D-03 invitation appears near practice and once after an attempt with exact copy');
test.todo('guest example practice continues uninterrupted after session expiry');
