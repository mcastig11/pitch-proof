'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const test = require('node:test');
const { createServerFixture } = require('./support/server-fixture.cjs');

test('concurrent HTTP fixtures isolate SQLite, captured mail, and teardown', async () => {
  const [first, second] = await Promise.all([
    createServerFixture(),
    createServerFixture(),
  ]);
  const fixturePaths = [first.databasePath, second.databasePath];
  const fixtureDatabases = [first.database, second.database];
  const fixtureServers = [first.server, second.server];

  try {
    assert.notEqual(first.databasePath, second.databasePath);
    assert.notEqual(first.emailTransport, second.emailTransport);
    assert.equal(first.database.prepare('SELECT 1 AS value').get().value, 1);
    assert.equal(second.database.prepare('SELECT 1 AS value').get().value, 1);

    await Promise.all([
      first.emailTransport.send({ kind: 'verification', recipient: 'first@example.test', link: '/verify/first' }),
      second.emailTransport.send({ kind: 'reset', recipient: 'second@example.test', link: '/reset/second' }),
    ]);
    assert.equal(first.emailTransport.getLink('verification', 'first@example.test'), '/verify/first');
    assert.equal(first.emailTransport.getLink('reset', 'second@example.test'), undefined);
    assert.equal(second.emailTransport.getLink('reset', 'second@example.test'), '/reset/second');
    assert.equal(second.emailTransport.getLink('verification', 'first@example.test'), undefined);

    const [firstResponse, secondResponse] = await Promise.all([
      fetch(first.url),
      fetch(second.url),
    ]);
    assert.equal(await firstResponse.text(), 'test fixture ready');
    assert.equal(await secondResponse.text(), 'test fixture ready');
  } finally {
    await Promise.all([first.close(), second.close()]);
  }

  assert.ok(fixtureServers.every((server) => !server.listening));
  assert.ok(fixtureDatabases.every((database) => database.isOpen === false));
  for (const databasePath of fixturePaths) {
    await assert.rejects(fs.access(databasePath));
  }
});
