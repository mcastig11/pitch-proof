'use strict';

const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const test = require('node:test');
const { withServerFixture } = require('./support/server-fixture.cjs');

const password = 'Vocal-practice-strong-password-42!';

async function withAuthFixture(callback, { publicBaseURL = 'http://127.0.0.1' } = {}) {
  let app;
  // During RED the existing HTTP fixture still runs: missing auth behavior
  // fails on the private-access assertion, rather than an import/setup crash.
  const createApp = existsSync('server/app.mjs') ? (await import('../server/app.mjs')).createApp : null;
  try {
    return await withServerFixture(async (fixture) => {
      try {
        return await callback(fixture);
      } finally {
        // The production connection must close before the fixture deletes its
        // SQLite file on Windows, where open native handles prevent removal.
        app?.locals.closeDatabase();
      }
    }, createApp ? {
      createApp: async ({ database, emailTransport }) => {
        app = await createApp({
          databasePath: database.prepare('PRAGMA database_list').get().file,
          emailTransport,
          publicBaseURL,
          allowedOrigins: [publicBaseURL],
        });
        return app;
      },
    } : undefined);
  } finally {
    app?.locals.closeDatabase();
  }
}

async function request(fixture, route, { body, cookie, origin = 'http://127.0.0.1' } = {}) {
  return fetch(`${fixture.url}${route}`, {
    method: body ? 'POST' : 'GET',
    redirect: 'manual',
    headers: {
      origin,
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

function sessionCookie(response) {
  return response.headers.getSetCookie().find((value) => /(?:^|\.)session_token=/.test(value));
}

function assertCookiePolicy(header, secure) {
  assert.ok(header, 'sign-in must issue a persistent session cookie');
  assert.match(header, /; Max-Age=604800(?:;|$)/i);
  assert.match(header, /; HttpOnly(?:;|$)/i);
  assert.match(header, /; SameSite=Lax(?:;|$)/i);
  assert.equal(/; Secure(?:;|$)/i.test(header), secure);
}

async function signupAndVerify(fixture, { email, origin = 'http://127.0.0.1' }) {
  const signup = await request(fixture, '/api/auth/sign-up/email', {
    origin,
    body: { email, password, name: 'Test Singer', firstSignInCompleted: true },
  });
  assert.equal(signup.status, 200);
  assert.equal(sessionCookie(signup), undefined, 'signup must not authenticate');
  const row = fixture.database.prepare('SELECT * FROM user WHERE email = ?').get(email);
  assert.equal(row.emailVerified, 0);
  assert.equal(row.firstSignInCompleted, 0, 'client cannot set the onboarding field');
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);
  const link = fixture.emailTransport.getLink('verification', email);
  assert.ok(link, 'verification must be captured by the injected transport');
  const verificationURL = new URL(link);
  const verified = await request(fixture, verificationURL.pathname + verificationURL.search, { origin });
  assert.ok([200, 302, 303].includes(verified.status));
  assert.equal(sessionCookie(verified), undefined, 'confirmation must not authenticate');
  assert.equal(fixture.database.prepare('SELECT emailVerified FROM user WHERE id = ?').get(row.id).emailVerified, 1);
  assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);
  return row.id;
}

test('verified account HTTP tracer enforces confirmation and atomic first-use routing', async () => {
  await withAuthFixture(async (fixture) => {
    const anonymous = await request(fixture, '/api/me/workspace?ownerId=forged');
    assert.equal(anonymous.status, 401, 'anonymous HTTP requests must not read private workspace data');
    assert.equal(anonymous.headers.get('cache-control'), 'no-store');

    const email = 'singer@example.test';
    const pending = await request(fixture, '/api/auth/sign-up/email', {
      body: { email, password, name: 'Test Singer', firstSignInCompleted: true },
    });
    assert.equal(pending.status, 200);
    assert.equal(sessionCookie(pending), undefined);
    const user = fixture.database.prepare('SELECT * FROM user WHERE email = ?').get(email);
    assert.equal(user.emailVerified, 0);
    assert.equal(user.firstSignInCompleted, 0);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM user').get().count, 1);
    const pendingSignIn = await request(fixture, '/api/auth/sign-in/email', { body: { email, password } });
    assert.equal(pendingSignIn.status, 403);
    assert.equal(sessionCookie(pendingSignIn), undefined);
    assert.equal((await request(fixture, '/api/me/workspace')).status, 401);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);

    const link = new URL(fixture.emailTransport.getLink('verification', email));
    const verified = await request(fixture, link.pathname + link.search);
    assert.ok([200, 302, 303].includes(verified.status));
    assert.equal(sessionCookie(verified), undefined);
    assert.equal(fixture.database.prepare('SELECT emailVerified FROM user WHERE id = ?').get(user.id).emailVerified, 1);
    assert.equal((await request(fixture, '/api/me/workspace')).status, 401);

    const signIn = await request(fixture, '/api/auth/sign-in/email', { body: { email, password } });
    assert.equal(signIn.status, 200);
    const header = sessionCookie(signIn);
    assertCookiePolicy(header, false);
    const cookie = header.split(';')[0];
    assert.equal(signIn.headers.getSetCookie().some((value) => value.includes('session_data=')), false);
    const session = fixture.database.prepare('SELECT * FROM session WHERE userId = ?').get(user.id);
    assert.ok(Math.abs((new Date(session.expiresAt) - new Date(session.createdAt)) - 604800000) < 1000);

    const landingRequests = await Promise.all([
      request(fixture, '/api/me/landing', { cookie, body: { userId: 'forged' } }),
      request(fixture, '/api/me/landing', { cookie, body: {} }),
    ]);
    assert.ok(landingRequests.every((response) => response.status === 200));
    const landings = await Promise.all(landingRequests.map((response) => response.json()));
    assert.deepEqual(landings.map((value) => value.destination).sort(), ['/', '/workspace']);
    assert.equal(landings.filter((value) => value.firstSignIn).length, 1);
    assert.equal(fixture.database.prepare('SELECT firstSignInCompleted FROM user WHERE id = ?').get(user.id).firstSignInCompleted, 1);

    const workspace = await request(fixture, '/api/me/workspace?ownerId=forged', { cookie });
    assert.equal(workspace.status, 200);
    assert.equal(workspace.headers.get('cache-control'), 'no-store');
    assert.equal((await workspace.json()).identity, 'Test Singer');

    const laterSignIn = await request(fixture, '/api/auth/sign-in/email', { body: { email, password } });
    assert.equal(laterSignIn.status, 200);
    const later = await request(fixture, '/api/me/landing', { cookie: sessionCookie(laterSignIn).split(';')[0], body: {} });
    assert.deepEqual(await later.json(), { destination: '/workspace', firstSignIn: false });
  });
});

test('HTTPS auth cookies remain secure outside production', async () => {
  const origin = 'https://pitch-proof.example';
  await withAuthFixture(async (fixture) => {
    const email = 'https-singer@example.test';
    await signupAndVerify(fixture, { email, origin });
    const signedIn = await request(fixture, '/api/auth/sign-in/email', { origin, body: { email, password } });
    assert.equal(signedIn.status, 200);
    assertCookiePolicy(sessionCookie(signedIn), true);
  }, { publicBaseURL: origin });
});

test('insecure remote origins and production HTTP are rejected before database setup', async () => {
  const { createApp } = await import('../server/app.mjs');
  await assert.rejects(createApp({ publicBaseURL: 'http://pitch-proof.example' }), /HTTPS|loopback/);
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    await assert.rejects(createApp({ publicBaseURL: 'http://localhost:3000' }), /HTTPS/);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});

// Remaining cases belong to the later hardening/recovery plan.
test.todo('verification email can be resent without revealing account state');
test.todo('corrected-address signup creates a usable pending account');
test.todo('unknown account sign-in response is generic');
test.todo('duplicate signup response is generic');
test.todo('concurrent signup requests cannot create duplicate accounts');
test.todo('password reset link changes the password and requires fresh sign-in');
test.todo('pending accounts are removed only after the cleanup cutoff');
