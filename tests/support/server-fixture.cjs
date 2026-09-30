'use strict';

const { createServer } = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createCaptureEmail } = require('./capture-email.cjs');

function defaultApp(_dependencies) {
  return (_request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('test fixture ready');
  };
}

function listen(server) {
  return new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    server.once('error', onError);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', onError);
      resolve(server.address());
    });
  });
}

async function closeServer(server) {
  if (!server.listening) return;

  const closed = new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  server.closeAllConnections();
  await closed;
}

async function createServerFixture({ createApp = defaultApp } = {}) {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'pitch-proof-auth-'));
  const databasePath = path.join(temporaryDirectory, 'fixture.sqlite');
  const database = new DatabaseSync(databasePath);
  const emailTransport = createCaptureEmail();
  let server;
  let closed = false;

  try {
    const app = await createApp({ database, emailTransport });
    server = app && typeof app.listen === 'function' && typeof app.close === 'function'
      ? app
      : createServer(app);
    const address = await listen(server);

    return {
      database,
      databasePath,
      emailTransport,
      server,
      url: `http://127.0.0.1:${address.port}`,
      async close() {
        if (closed) return;
        closed = true;
        try {
          await closeServer(server);
        } finally {
          try {
            database.close();
          } finally {
            await fs.rm(temporaryDirectory, { recursive: true, force: true });
          }
        }
      },
    };
  } catch (error) {
    try {
      if (server) await closeServer(server);
    } finally {
      try {
        database.close();
      } finally {
        await fs.rm(temporaryDirectory, { recursive: true, force: true });
      }
    }
    throw error;
  }
}

async function withServerFixture(callback, options) {
  const fixture = await createServerFixture(options);
  try {
    return await callback(fixture);
  } finally {
    await fixture.close();
  }
}

module.exports = { createServerFixture, withServerFixture };
