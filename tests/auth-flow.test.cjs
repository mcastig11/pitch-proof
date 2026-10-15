'use strict';

const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const test = require('node:test');
const { request: httpRequest } = require('node:http');
const { withServerFixture } = require('./support/server-fixture.cjs');

const password = 'Vocal-practice-strong-password-42!';

async function withAuthFixture(callback, { publicBaseURL = 'http://127.0.0.1', clock = Date.now } = {}) {
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
          clock,
        });
        return app;
      },
    } : undefined);
  } finally {
    app?.locals.closeDatabase();
  }
}

async function request(fixture, route, { body, cookie, origin = 'http://127.0.0.1' } = {}) {
  return new Promise((resolve, reject) => {
    const outgoing = httpRequest(`${fixture.url}${route}`, {
    method: body ? 'POST' : 'GET',
    redirect: 'manual',
    headers: {
      host: new URL(origin).host,
      origin,
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    }, (incoming) => {
      const chunks = [];
      incoming.on('data', (chunk) => chunks.push(chunk));
      incoming.on('end', () => {
        const responseHeaders = new Headers();
        for (let index = 0; index < incoming.rawHeaders.length; index += 2) {
          responseHeaders.append(incoming.rawHeaders[index], incoming.rawHeaders[index + 1]);
        }
        resolve(new Response([204, 304].includes(incoming.statusCode) ? null : Buffer.concat(chunks), { status: incoming.statusCode, headers: responseHeaders }));
      });
      incoming.on('error', reject);
    });
    outgoing.on('error', reject);
    outgoing.end(body ? JSON.stringify(body) : undefined);
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
    assert.equal((await workspace.json()).identity, email);
    assert.equal(fixture.database.prepare('SELECT name FROM user WHERE id = ?').get(user.id).name, 'Test Singer');

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

test('verification email can be resent without revealing account state', async () => {
  await withAuthFixture(async (fixture) => {
    const email = 'pending@example.test';
    await request(fixture, '/api/auth/sign-up/email', { body: { email, password, name: 'Singer' } });
    const before = fixture.emailTransport.getMessages().length;
    const pending = await request(fixture, '/api/auth/send-verification-email', { body: { email } });
    const unknown = await request(fixture, '/api/auth/send-verification-email', { body: { email: 'unknown@example.test' } });
    assert.equal(pending.status, unknown.status);
    assert.deepEqual(await pending.json(), await unknown.json());
    assert.equal(fixture.emailTransport.getMessages().length, before + 1);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);
  });
});

test('corrected-address signup invalidates prior links and signs in with the current workspace email', async () => {
  await withAuthFixture(async (fixture) => {
    const email = 'typo@example.test';
    const newEmail = 'correct@example.test';
    await request(fixture, '/api/auth/sign-up/email', { body: { email, password, name: email } });
    const oldLink = new URL(fixture.emailTransport.getLink('verification', email));
    const id = fixture.database.prepare('SELECT id FROM user WHERE email = ?').get(email).id;
    const denied = await request(fixture, '/api/auth/correct-pending-email', { body: { email, password: 'wrong-password', newEmail } });
    assert.equal(denied.status, 401, 'correction requires pending account credentials');
    const corrected = await request(fixture, '/api/auth/correct-pending-email', { body: { email, password, newEmail: ' CORRECT@EXAMPLE.TEST ' } });
    assert.equal(corrected.status, 200);
    assert.equal(sessionCookie(corrected), undefined);
    assert.equal(fixture.database.prepare('SELECT emailVerified FROM user WHERE id = ?').get(id).emailVerified, 0);
    assert.equal(fixture.database.prepare('SELECT email FROM user WHERE id = ?').get(id).email, newEmail);
    assert.equal((await request(fixture, '/api/me/workspace')).status, 401);
    // Reusing the abandoned address must not resurrect the old email token.
    await request(fixture, '/api/auth/sign-up/email', { body: { email, password, name: 'Another Singer' } });
    const stale = await request(fixture, oldLink.pathname + oldLink.search);
    assert.ok(stale.status >= 400 || new URL(stale.headers.get('location'), fixture.url).searchParams.has('error'));
    assert.equal(fixture.database.prepare('SELECT emailVerified FROM user WHERE email = ?').get(email).emailVerified, 0);
    const link = new URL(fixture.emailTransport.getLink('verification', newEmail));
    assert.ok([200, 302].includes((await request(fixture, link.pathname + link.search)).status));
    assert.equal(fixture.database.prepare('SELECT emailVerified FROM user WHERE id = ?').get(id).emailVerified, 1);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);
    assert.equal((await request(fixture, '/api/me/workspace')).status, 401);

    const signIn = await request(fixture, '/api/auth/sign-in/email', { body: { email: newEmail, password } });
    assert.equal(signIn.status, 200);
    const cookie = sessionCookie(signIn).split(';')[0];
    const workspace = await request(fixture, '/api/me/workspace?identity=forged', { cookie });
    assert.equal(workspace.status, 200);
    assert.equal(workspace.headers.get('cache-control'), 'no-store');
    assert.equal((await workspace.json()).identity, newEmail);
    assert.equal(fixture.database.prepare('SELECT name FROM user WHERE id = ?').get(id).name, email);
  });
});

test('unknown account sign-in response is generic', async () => {
  await withAuthFixture(async (fixture) => {
    const email = 'known@example.test';
    await signupAndVerify(fixture, { email });
    const wrong = await request(fixture, '/api/auth/sign-in/email', { body: { email, password: 'incorrect-password' } });
    const unknown = await request(fixture, '/api/auth/sign-in/email', { body: { email: 'unknown@example.test', password: 'incorrect-password' } });
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, wrong.status);
    assert.deepEqual(await unknown.json(), await wrong.json());
  });
});

test('verification links are distinct, consumed atomically, and expire after one hour', async () => {
  let now = Date.now();
  await withAuthFixture(async (fixture) => {
    const email = 'one-use@example.test';
    await request(fixture, '/api/auth/sign-up/email', { body: { email, password, name: 'Singer' } });
    const first = new URL(fixture.emailTransport.getLink('verification', email));
    await request(fixture, '/api/auth/send-verification-email', { body: { email } });
    const latest = new URL(fixture.emailTransport.getMessages().filter((value) => value.kind === 'verification' && value.recipient === email).at(-1).link);
    assert.notEqual(first.searchParams.get('token'), latest.searchParams.get('token'));
    const outcomes = await Promise.all([1, 2].map(() => request(fixture, latest.pathname + latest.search)));
    assert.equal(outcomes.filter((value) => value.status === 302 && !value.headers.get('location').includes('error=')).length, 1);
    assert.equal(outcomes.filter((value) => value.headers.get('location')?.includes('error=')).length, 1);
    assert.ok((await request(fixture, first.pathname + first.search)).headers.get('location').includes('error='));
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM session').get().count, 0);

    const expiring = 'expired@example.test';
    await request(fixture, '/api/auth/sign-up/email', { body: { email: expiring, password, name: 'Singer' } });
    const link = new URL(fixture.emailTransport.getLink('verification', expiring));
    now += 3600000;
    assert.ok((await request(fixture, link.pathname + link.search)).headers.get('location').includes('error='));
    assert.equal(fixture.database.prepare('SELECT emailVerified FROM user WHERE email = ?').get(expiring).emailVerified, 0);
  }, { clock: () => now });
});

test('pending correction cannot change a verified account or overwrite another account', async () => {
  await withAuthFixture(async (fixture) => {
    const verified = 'verified-correction@example.test';
    await signupAndVerify(fixture, { email: verified });
    const pending = 'pending-correction@example.test';
    await request(fixture, '/api/auth/sign-up/email', { body: { email: pending, password, name: 'Singer' } });
    const old = new URL(fixture.emailTransport.getLink('verification', pending));
    assert.equal((await request(fixture, '/api/auth/correct-pending-email', { body: { email: verified, password, newEmail: 'other@example.test' } })).status, 401);
    const collision = await request(fixture, '/api/auth/correct-pending-email', { body: { email: pending, password, newEmail: verified } });
    assert.equal(collision.status, 200, 'target account existence is hidden');
    assert.equal(sessionCookie(collision), undefined);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM user').get().count, 2);
    assert.equal((await request(fixture, old.pathname + old.search)).status, 302, 'a failed correction preserves the prior usable link');
    assert.equal(fixture.database.prepare('SELECT emailVerified FROM user WHERE email = ?').get(pending).emailVerified, 1);
  });
});

test('duplicate signup response is generic', async () => {
  await withAuthFixture(async (fixture) => {
    const body = { email: 'duplicate@example.test', password, name: 'Singer' };
    const first = await request(fixture, '/api/auth/sign-up/email', { body });
    const duplicate = await request(fixture, '/api/auth/sign-up/email', { body });
    assert.equal(first.status, 200);
    assert.equal(duplicate.status, first.status);
    assert.deepEqual(await duplicate.json(), await first.json());
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM user').get().count, 1);
  });
});

test('concurrent signup requests cannot create duplicate accounts or first-use claims', async () => {
  await withAuthFixture(async (fixture) => {
    const emails = ['race@example.test', ' RACE@EXAMPLE.TEST ', 'Race@Example.Test', 'race@example.test'];
    const signups = await Promise.all(emails.map((email) => request(fixture, '/api/auth/sign-up/email', { body: { email, password, name: 'Singer' } })));
    assert.ok(signups.every((value) => value.status === 200), 'every racing signup has the generic success outcome');
    const bodies = await Promise.all(signups.map((value) => value.json()));
    assert.ok(bodies.every((value) => JSON.stringify(value) === JSON.stringify(bodies[0])));
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM user').get().count, 1);
    const link = new URL(fixture.emailTransport.getLink('verification', 'race@example.test'));
    await request(fixture, link.pathname + link.search);
    const signins = await Promise.all(emails.map((email) => request(fixture, '/api/auth/sign-in/email', { body: { email, password } })));
    assert.ok(signins.every((value) => value.status === 200));
    const landings = await Promise.all(signins.map((value) => request(fixture, '/api/me/landing', { cookie: sessionCookie(value).split(';')[0], body: {} })));
    const routes = await Promise.all(landings.map((value) => value.json()));
    assert.equal(routes.filter((value) => value.firstSignIn).length, 1);
    assert.equal(routes.filter((value) => value.destination === '/workspace').length, 3);
  });
});

test('password reset link changes the password and requires fresh sign-in', async () => {
  await withAuthFixture(async (fixture) => {
    const email = 'reset@example.test';
    await signupAndVerify(fixture, { email });
    await request(fixture, '/api/auth/request-password-reset', { body: { email, redirectTo: '/reset-password' } });
    const link = new URL(fixture.emailTransport.getLink('reset', email));
    const opened = await request(fixture, link.pathname + link.search);
    assert.equal(opened.status, 302);
    const token = new URL(opened.headers.get('location'), fixture.url).searchParams.get('token');
    const newPassword = 'Recovered-vocal-practice-password-44!';
    const reset = await request(fixture, '/api/auth/reset-password', { body: { token, newPassword } });
    assert.equal(reset.status, 200);
    assert.equal(sessionCookie(reset), undefined);
    assert.equal((await request(fixture, '/api/me/workspace')).status, 401);
    const signIn = await request(fixture, '/api/auth/sign-in/email', { body: { email, password: newPassword } });
    assert.equal(signIn.status, 200);
    const landing = await request(fixture, '/api/me/landing', { cookie: sessionCookie(signIn).split(';')[0], body: {} });
    assert.deepEqual(await landing.json(), { destination: '/workspace', firstSignIn: false });
  });
});

test('pending accounts are removed only after the exact cleanup cutoff on startup and auth activity', async () => {
  let now = Date.now();
  await withAuthFixture(async (fixture) => {
    const day = 86400000;
    const emails = ['old@example.test', 'boundary@example.test', 'new@example.test', 'verified@example.test'];
    for (const email of emails) await request(fixture, '/api/auth/sign-up/email', { body: { email, password, name: 'Singer' } });
    const stamp = fixture.database.prepare('UPDATE user SET createdAt = ?, emailVerified = ? WHERE email = ?');
    stamp.run(new Date(now - 30 * day - 1).toISOString(), 0, emails[0]);
    stamp.run(new Date(now - 30 * day).toISOString(), 0, emails[1]);
    stamp.run(new Date(now - 29 * day).toISOString(), 0, emails[2]);
    stamp.run(new Date(now - 60 * day).toISOString(), 1, emails[3]);
    const oldId = fixture.database.prepare('SELECT id FROM user WHERE email = ?').get(emails[0]).id;
    await request(fixture, '/api/auth/request-password-reset', { body: { email: 'unknown@example.test' } });
    assert.equal(fixture.database.prepare('SELECT id FROM user WHERE email = ?').get(emails[0]), undefined);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM verification WHERE value = ?').get(oldId).count, 0);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM account WHERE userId = ?').get(oldId).count, 0);
    assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM user').get().count, 3);
    now += 1;
    const { createApp } = await import('../server/app.mjs');
    const restarted = await createApp({ databasePath: fixture.databasePath, publicBaseURL: 'http://127.0.0.1', emailTransport: fixture.emailTransport, clock: () => now });
    try {
      assert.equal(fixture.database.prepare('SELECT id FROM user WHERE email = ?').get(emails[1]), undefined);
      assert.equal(fixture.database.prepare('SELECT COUNT(*) AS count FROM user').get().count, 2);
    } finally { restarted.locals.closeDatabase(); }
  }, { clock: () => now });
});
