import { readFile } from 'node:fs/promises';
import { createServer } from 'node:https';
import { request as httpRequest } from 'node:http';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { startServer } from '../server/index.mjs';

export async function startLocalHttps({ dataDirectory = join(process.env.LOCALAPPDATA || '', 'PitchProof', 'local-https') } = {}) {
  const configuration = JSON.parse(await readFile(join(dataDirectory, 'config.json'), 'utf8'));
  const origin = new URL(configuration.origin);
  if (origin.protocol !== 'https:' || origin.hostname !== 'localhost' || origin.pathname !== '/' || origin.username || origin.password || origin.search || origin.hash) {
    throw new Error('Local HTTPS requires an exact https://localhost origin.');
  }
  const [pfx, passphrase, secret] = await Promise.all([
    readFile(configuration.pfxPath),
    readFile(configuration.pfxPassphraseFile, 'utf8'),
    readFile(configuration.authSecretFile, 'utf8'),
  ]);
  // This helper is local capture mode; it never enables a live email provider.
  const backend = await startServer({ env: {
    NODE_ENV: 'test', HOST: '127.0.0.1', PORT: origin.port || '443',
    PUBLIC_BASE_URL: origin.origin, DATABASE_PATH: configuration.databasePath,
    BETTER_AUTH_SECRET: secret.trim(),
  }, listenPort: 0 });
  let server;
  try {
    server = createServer({ pfx, passphrase: passphrase.trim(), minVersion: 'TLSv1.2' }, (incoming, outgoing) => {
      const upstream = httpRequest({
        hostname: '127.0.0.1', port: backend.server.address().port,
        path: incoming.url, method: incoming.method, headers: incoming.headers,
      }, (response) => {
        outgoing.writeHead(response.statusCode, response.headers);
        response.pipe(outgoing);
      });
      upstream.on('error', () => {
        if (!outgoing.headersSent) outgoing.writeHead(502, { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' });
        outgoing.end('Local test server unavailable.');
      });
      incoming.on('aborted', () => upstream.destroy());
      outgoing.on('close', () => upstream.destroy());
      incoming.pipe(upstream);
    });
    server.requestTimeout = 30000;
    await new Promise((resolveListen, reject) => {
      server.once('error', reject);
      server.listen(Number(origin.port) || 443, '127.0.0.1', () => {
        server.removeListener('error', reject);
        resolveListen();
      });
    });
  } catch (error) {
    await backend.close();
    throw error;
  }
  let closing;
  return {
    server, backend, app: backend.app, emailTransport: backend.emailTransport,
    origin: origin.origin, configuration,
    close() {
      if (!closing) closing = new Promise((resolveClose, reject) => {
        server.close((error) => error ? reject(error) : resolveClose());
        server.closeAllConnections();
      }).finally(() => backend.close());
      return closing;
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const running = await startLocalHttps();
    console.log(`Pitch Proof local HTTPS listening at ${running.origin}.`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
      running.close().catch(() => { process.exitCode = 1; });
    });
  } catch {
    console.error('Local HTTPS could not start. Run the setup script and check the private certificate configuration and port.');
    process.exitCode = 1;
  }
}
