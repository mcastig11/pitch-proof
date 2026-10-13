'use strict';

// Scaffold-only cases: later implementation tasks must replace each todo with
// an active assertion. A todo does not count as final requirement coverage.
const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
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

test.todo('unauthenticated requests cannot read private resource metadata or bytes');
test.todo('Alice cannot read Bob resource metadata');
test.todo('Alice cannot read Bob resource bytes');
test.todo('forged owner identifiers cannot bypass server-side ownership checks');
test.todo('resource metadata lists only the authenticated owner records');
test.todo('resource bytes are available to their authenticated owner');
