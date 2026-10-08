'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { withServerFixture } = require('./support/server-fixture.cjs');

const password = 'Vocal-practice-strong-password-42!';
const newPassword = 'Changed-vocal-practice-password-43!';
const origin = 'http://127.0.0.1';

async function withAuthFixture(callback, options = {}) {
  const { createApp } = await import('../server/app.mjs');
  let app;
  let now = Date.now();
  await withServerFixture(async (fixture) => {
    try {
      await callback({ ...fixture, advance: (ms) => { now += ms; }, now: () => now, app });
    } finally {
      app.locals.closeDatabase();
    }
  }, {
    createApp: async ({ database, emailTransport }) => {
      app = await createApp({
        databasePath: database.prepare('PRAGMA database_list').get().file,
        emailTransport, publicBaseURL: origin, allowedOrigins: [origin], clock: () => now,
        ...options,
      });
      return app;
    },
  });
}

async function request(fixture, route, { body, cookie, requestOrigin = origin, headers = {} } = {}) {
  return fetch(`${fixture.url}${route}`, {
    method: body ? 'POST' : 'GET', redirect: 'manual',
    headers: {
      ...(requestOrigin === null ? {} : { origin: requestOrigin }),
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}), ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

function cookieFrom(response) {
  return response.headers.getSetCookie().find((value) => /(?:^|\.)session_token=/.test(value))?.split(';')[0];
}

async function verifiedAccount(fixture, email = 'singer@example.test') {
  assert.equal((await request(fixture, '/api/auth/sign-up/email', { body: { email, password, name: 'Singer' } })).status, 200);
  const link = new URL(fixture.emailTransport.getLink('verification', email));
  assert.ok([200, 302].includes((await request(fixture, link.pathname + link.search)).status));
  return email;
}

async function signIn(fixture, email, secret = password, cookie) {
  const response = await request(fixture, '/api/auth/sign-in/email', { cookie, body: { email, password: secret } });
  assert.equal(response.status, 200);
  assert.ok(cookieFrom(response));
  return cookieFrom(response);
}

async function resetToken(fixture, email) {
  const response = await request(fixture, '/api/auth/request-password-reset', { body: { email, redirectTo: '/reset-password' } });
  assert.equal(response.status, 200, 'password recovery must be enabled');
  const links = fixture.emailTransport.getMessages().filter((value) => value.kind === 'reset' && value.recipient === email);
  const link = new URL(links.at(-1).link);
  return link.searchParams.get('token') || link.pathname.split('/').at(-1);
}

test('database session expiry is fixed and enforced by the server', async () => {
  await withAuthFixture(async (fixture) => {
    const email = await verifiedAccount(fixture);
    const cookie = await signIn(fixture, email);
    const initial = fixture.database.prepare('SELECT * FROM session').get();
    assert.ok(Math.abs((new Date(initial.expiresAt) - new Date(initial.createdAt)) - 604800000) < 1000);
    fixture.advance(604800000 - 1);
    assert.equal((await request(fixture, '/api/me/workspace', { cookie })).status, 200);
    assert.ok((await (await request(fixture, '/api/auth/get-session', { cookie })).json())?.session);
    assert.equal(fixture.database.prepare('SELECT expiresAt FROM session').get().expiresAt, initial.expiresAt);
    fixture.advance(1);
    assert.equal((await request(fixture, '/api/me/workspace', { cookie })).status, 401);
    assert.equal(await (await request(fixture, '/api/auth/get-session', { cookie })).json(), null, 'expired cookie must not expose an auth session');
  });
});

test('sign-out invalidates the active session cookie', async () => {
  await withAuthFixture(async (fixture) => {
    const cookie = await signIn(fixture, await verifiedAccount(fixture));
    assert.equal((await request(fixture, '/api/auth/sign-out', { cookie, body: {} })).status, 200);
    assert.equal((await request(fixture, '/api/me/workspace', { cookie })).status, 401);
  });
});

test('password reset invalidates every cookie issued before reset', async () => {
  await withAuthFixture(async (fixture) => {
    const email = await verifiedAccount(fixture);
    const cookies = await Promise.all([signIn(fixture, email), signIn(fixture, email), signIn(fixture, email)]);
    assert.equal(new Set(cookies).size, 3);
    const token = await resetToken(fixture, email);
    const reset = await request(fixture, '/api/auth/reset-password', { cookie: cookies[0], body: { token, newPassword } });
    assert.equal(reset.status, 200);
    assert.equal(cookieFrom(reset), undefined, 'reset must require a fresh sign-in');
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);
    for (const cookie of cookies) assert.equal((await request(fixture, '/api/me/workspace', { cookie })).status, 401);
    assert.equal((await request(fixture, '/api/auth/sign-in/email', { body: { email, password } })).status, 401);
    const cookie = await signIn(fixture, email, newPassword);
    assert.deepEqual(await (await request(fixture, '/api/me/landing', { cookie, body: {} })).json(), { destination: '/workspace', firstSignIn: false });
    assert.equal((await request(fixture, '/api/auth/reset-password', { body: { token, newPassword: password } })).status, 400);
  });
});

test('reset tokens expire at one hour and are consumed once under concurrent requests', async () => {
  await withAuthFixture(async (fixture) => {
    const email = await verifiedAccount(fixture);
    const token = await resetToken(fixture, email);
    const row = fixture.database.prepare('SELECT * FROM verification WHERE identifier = ?').get(`reset-password:${token}`);
    assert.equal(new Date(row.expiresAt) - new Date(row.createdAt), 3600000);
    fixture.advance(3600000);
    assert.equal((await request(fixture, '/api/auth/reset-password', { body: { token, newPassword } })).status, 400);
    const next = await resetToken(fixture, email);
    const results = await Promise.all([1, 2].map(() => request(fixture, '/api/auth/reset-password', { body: { token: next, newPassword } })));
    assert.deepEqual(results.map((value) => value.status).sort(), [200, 400]);
    await signIn(fixture, email, newPassword);
  });
});
test.todo('sign-in does not adopt a session identifier supplied before authentication');
test.todo('cross-origin state-changing requests are rejected');
test.todo('auth endpoints enforce rate limits');
test.todo('signup, resend, and reset responses do not reveal account existence');
test.todo('private responses include Cache-Control no-store');
