'use strict';

// D-01/D-07: private resources are inert metadata and injected sentinels.
// No PDF files or guest microphone observations are persisted by these tests.
const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { request: httpRequest } = require('node:http');
const { withServerFixture } = require('./support/server-fixture.cjs');

async function withRepository(callback) {
  const { openDatabase } = await import('../server/db.mjs');
  const resources = existsSync('server/owner-resources.mjs') ? await import('../server/owner-resources.mjs') : {};
  const database = openDatabase(':memory:');
  try {
    database.exec("CREATE TABLE user (id TEXT PRIMARY KEY); INSERT INTO user VALUES ('alice'), ('bob')");
    assert.equal(typeof resources.createOwnerResourceRepository, 'function', 'owner-scoped repository must exist');
    resources.migratePrivateResources(database);
    resources.migratePrivateResources(database);
    const repository = resources.createOwnerResourceRepository(database);
    repository.create({ id: 'alice-resource', ownerUserId: 'alice', mimeType: 'application/octet-stream', byteLength: 5, providerKey: 'alice-sentinel' });
    repository.create({ id: 'bob-resource', ownerUserId: 'bob', mimeType: 'application/octet-stream', byteLength: 3, providerKey: 'bob-sentinel' });
    await callback(repository, database);
  } finally { database.close(); }
}

test('repository list and get always scope metadata to the required owner', async () => {
  await withRepository(async (repository) => {
    assert.deepEqual(repository.list('alice').map((row) => row.id), ['alice-resource']);
    assert.deepEqual(repository.list('bob').map((row) => row.id), ['bob-resource']);
    assert.equal(repository.get('alice', 'bob-resource'), null);
    assert.equal(repository.get('bob', 'alice-resource'), null);
    assert.equal(repository.get('alice', 'missing'), null);
    assert.equal(repository.get('alice', 'alice-resource').ownerUserId, 'alice');
    for (const owner of [undefined, null, '', ' ', 12, {}]) {
      assert.throws(() => repository.list(owner), /owner/i);
      assert.throws(() => repository.get(owner, 'alice-resource'), /owner/i);
    }
  });
});

test('resource metadata stores only inert keys and validates size, type and ownership', async () => {
  await withRepository(async (repository, database) => {
    const metadata = { id: 'new-resource', ownerUserId: 'alice', mimeType: 'application/octet-stream', byteLength: 0, providerKey: 'new-sentinel' };
    for (const providerKey of ['../private.pdf', '/private.pdf', 'C:\\private.pdf', 'https://example.test/private', '']) {
      assert.throws(() => repository.create({ ...metadata, providerKey }), /provider/i);
    }
    for (const byteLength of [-1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => repository.create({ ...metadata, byteLength }), /length/i);
    assert.throws(() => repository.create({ ...metadata, mimeType: 'text/plain\r\nInjected: yes' }), /mime/i);
    assert.throws(() => repository.create({ ...metadata, ownerUserId: '' }), /owner/i);
    assert.throws(() => repository.create({ ...metadata, ownerUserId: 'missing-user' }), /FOREIGN KEY/);
    repository.create(metadata);
    const columns = database.prepare('PRAGMA table_info(private_resources)').all().map((row) => row.name);
    assert.deepEqual(columns.sort(), ['byte_length', 'id', 'mime_type', 'owner_user_id', 'provider_key']);
    assert.equal(repository.get('alice', 'new-resource').byteLength, 0);
    database.prepare('DELETE FROM user WHERE id = ?').run('alice');
    assert.deepEqual(repository.list('alice'), []);
  });
});

const password = 'Owner-boundary-test-password-42!';

async function request(fixture, route, { cookie, body, method = 'GET', headers = {} } = {}) {
  const payload = body === undefined ? null : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const outgoing = httpRequest(fixture.url + route, {
      method,
      headers: {
        host: '127.0.0.1', origin: 'http://127.0.0.1',
        ...(cookie ? { cookie } : {}),
        ...(payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {}),
        ...headers,
      },
    }, (incoming) => {
      const chunks = [];
      incoming.on('data', (chunk) => chunks.push(chunk));
      incoming.on('error', reject);
      incoming.on('end', () => resolve({
        status: incoming.statusCode, headers: incoming.headers,
        bytes: Buffer.concat(chunks),
        json() { return JSON.parse(this.bytes.toString()); },
      }));
    });
    outgoing.on('error', reject);
    outgoing.end(payload);
  });
}

async function account(fixture, name, verify = true) {
  const email = name + '@example.test';
  assert.equal((await request(fixture, '/api/auth/sign-up/email', { method: 'POST', body: { email, password, name } })).status, 200);
  if (verify) {
    const url = new URL(fixture.emailTransport.getLink('verification', email));
    assert.equal((await request(fixture, url.pathname + url.search)).status, 302);
  }
  const signedIn = await request(fixture, '/api/auth/sign-in/email', { method: 'POST', body: { email, password } });
  if (!verify) { assert.equal(signedIn.status, 403); return null; }
  assert.equal(signedIn.status, 200);
  return {
    id: fixture.database.prepare('SELECT id FROM user WHERE email = ?').get(email).id,
    cookie: signedIn.headers['set-cookie'].find((value) => /session_token=/.test(value)).split(';')[0],
  };
}

async function withResources(callback, { clock = Date.now, provider } = {}) {
  let app;
  const providerCalls = [];
  const values = new Map([['alice-sentinel', Buffer.from('ALICE')], ['bob-sentinel', Buffer.from('BOB')]]);
  const { createApp } = await import('../server/app.mjs');
  try {
    return await withServerFixture(async (fixture) => {
      fixture.providerCalls = providerCalls;
      fixture.values = values;
      fixture.seed = async (owner, id, providerKey) => {
        const { migratePrivateResources, createOwnerResourceRepository } = await import('../server/owner-resources.mjs');
        migratePrivateResources(app.locals.database);
        createOwnerResourceRepository(app.locals.database).create({ id, ownerUserId: owner.id, providerKey, mimeType: 'application/octet-stream', byteLength: values.get(providerKey).length });
      };
      try { return await callback(fixture); }
      finally { app.locals.closeDatabase(); }
    }, {
      createApp: async ({ database, emailTransport }) => {
        app = await createApp({
          databasePath: database.prepare('PRAGMA database_list').get().file,
          emailTransport, clock, publicBaseURL: 'http://127.0.0.1', allowedOrigins: ['http://127.0.0.1'],
          byteProvider: async (key) => { providerCalls.push(key); return provider ? provider(key) : values.get(key) || null; },
        });
        return app;
      },
    });
  } finally { app?.locals.closeDatabase(); }
}

function noStore(response) { assert.equal(response.headers['cache-control'], 'no-store'); }
function hidden(response, status) {
  assert.equal(response.status, status);
  noStore(response);
  assert.doesNotMatch(response.bytes.toString(), /ALICE|BOB|sentinel|ownerUserId|providerKey|mimeType/);
}

test('unauthenticated requests cannot read private resource metadata or bytes', async () => {
  await withResources(async (fixture) => {
    for (const route of ['/api/me/resources', '/api/me/resources/alice-resource', '/api/me/resources/alice-resource/bytes']) {
      hidden(await request(fixture, route), 401);
      hidden(await request(fixture, route, { cookie: 'better-auth.session_token=forged' }), 401);
    }
    assert.deepEqual(fixture.providerCalls, []);
  });
});

test('Alice cannot read Bob resource metadata', async () => {
  await withResources(async (fixture) => {
    const alice = await account(fixture, 'alice');
    const bob = await account(fixture, 'bob');
    await fixture.seed(bob, 'bob-resource', 'bob-sentinel');
    const foreign = await request(fixture, '/api/me/resources/bob-resource', alice);
    const missing = await request(fixture, '/api/me/resources/missing', alice);
    hidden(foreign, 404); hidden(missing, 404);
    assert.deepEqual(foreign.json(), missing.json());
    assert.deepEqual(fixture.providerCalls, []);
  });
});

test('Alice cannot read Bob resource bytes', async () => {
  await withResources(async (fixture) => {
    const alice = await account(fixture, 'alice');
    const bob = await account(fixture, 'bob');
    await fixture.seed(bob, 'bob-resource', 'bob-sentinel');
    hidden(await request(fixture, '/api/me/resources/bob-resource/bytes', alice), 404);
    hidden(await request(fixture, '/api/me/resources/missing/bytes', alice), 404);
    assert.deepEqual(fixture.providerCalls, []);
  });
});

test('forged owner identifiers cannot bypass server-side ownership checks', async () => {
  await withResources(async (fixture) => {
    const alice = await account(fixture, 'alice');
    const bob = await account(fixture, 'bob');
    await fixture.seed(alice, 'alice-resource', 'alice-sentinel');
    for (const suffix of ['', '/bytes']) {
      hidden(await request(fixture, '/api/me/resources/alice-resource' + suffix + '?ownerId=' + alice.id + '&owner_user_id=' + alice.id, {
        cookie: bob.cookie, body: { ownerId: alice.id, ownerUserId: alice.id, user: { id: alice.id } },
        headers: { 'x-owner-id': alice.id, 'x-user-id': alice.id },
      }), 404);
    }
    const list = await request(fixture, '/api/me/resources?ownerId=' + alice.id, { cookie: bob.cookie, body: { ownerUserId: alice.id } });
    assert.equal(list.status, 200); noStore(list); assert.deepEqual(list.json(), { resources: [] });
    hidden(await request(fixture, '/api/me/resources/' + alice.id + '/alice-resource/bytes', bob), 404);
    assert.deepEqual(fixture.providerCalls, []);
  });
});

test('resource metadata lists only the authenticated owner records', async () => {
  await withResources(async (fixture) => {
    const alice = await account(fixture, 'alice');
    const bob = await account(fixture, 'bob');
    await fixture.seed(alice, 'alice-resource', 'alice-sentinel');
    await fixture.seed(bob, 'bob-resource', 'bob-sentinel');
    for (const [owner, id, length] of [[alice, 'alice-resource', 5], [bob, 'bob-resource', 3]]) {
      const expected = { id, mimeType: 'application/octet-stream', byteLength: length };
      const list = await request(fixture, '/api/me/resources', owner);
      assert.equal(list.status, 200); noStore(list); assert.deepEqual(list.json(), { resources: [expected] });
      const metadata = await request(fixture, '/api/me/resources/' + id, owner);
      assert.equal(metadata.status, 200); noStore(metadata); assert.deepEqual(metadata.json(), expected);
    }
    assert.deepEqual(fixture.providerCalls, []);
  });
});

test('resource bytes are available to their authenticated owner', async () => {
  await withResources(async (fixture) => {
    const alice = await account(fixture, 'alice');
    await fixture.seed(alice, 'alice-resource', 'alice-sentinel');
    const response = await request(fixture, '/api/me/resources/alice-resource/bytes', alice);
    assert.equal(response.status, 200); noStore(response);
    assert.deepEqual(response.bytes, Buffer.from('ALICE'));
    assert.equal(response.headers['content-type'], 'application/octet-stream');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.match(response.headers['content-disposition'], /^attachment/);
    assert.deepEqual(fixture.providerCalls, ['alice-sentinel']);
  });
});

test('pending, expired and revoked sessions cannot read any private resource', async () => {
  let now = Date.now();
  await withResources(async (fixture) => {
    await account(fixture, 'pending', false);
    const alice = await account(fixture, 'alice');
    await fixture.seed(alice, 'alice-resource', 'alice-sentinel');
    fixture.database.prepare('UPDATE user SET emailVerified = 0 WHERE id = ?').run(alice.id);
    for (const route of ['/api/me/resources', '/api/me/resources/alice-resource', '/api/me/resources/alice-resource/bytes']) hidden(await request(fixture, route, alice), 401);
    fixture.database.prepare('UPDATE user SET emailVerified = 1 WHERE id = ?').run(alice.id);
    now += 604800000;
    for (const route of ['/api/me/resources', '/api/me/resources/alice-resource', '/api/me/resources/alice-resource/bytes']) hidden(await request(fixture, route, alice), 401);
    now -= 604800000;
    const fresh = await request(fixture, '/api/auth/sign-in/email', { method: 'POST', body: { email: 'alice@example.test', password } });
    const cookie = fresh.headers['set-cookie'].find((value) => /session_token=/.test(value)).split(';')[0];
    assert.equal((await request(fixture, '/api/auth/sign-out', { method: 'POST', cookie, body: {} })).status, 200);
    hidden(await request(fixture, '/api/me/resources/alice-resource/bytes', { cookie }), 401);
    assert.deepEqual(fixture.providerCalls, []);
  }, { clock: () => now });
});

test('byte provider failure and invalid results disclose no private bytes and remain no-store', async () => {
  for (const provider of [() => { throw new Error('secret sentinel private path'); }, () => null, () => Buffer.from('wrong length'), () => 'ALICE']) {
    await withResources(async (fixture) => {
      const alice = await account(fixture, 'alice');
      await fixture.seed(alice, 'alice-resource', 'alice-sentinel');
      const response = await request(fixture, '/api/me/resources/alice-resource/bytes', alice);
      assert.ok([404, 502].includes(response.status)); noStore(response);
      assert.doesNotMatch(response.bytes.toString(), /secret|sentinel|private path|ALICE|wrong length/);
      assert.deepEqual(fixture.providerCalls, ['alice-sentinel']);
    }, { provider });
  }
});
