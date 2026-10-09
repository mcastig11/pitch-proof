import { createServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createApp } from './app.mjs';
import { validateAuthOrigin } from './auth.mjs';
import { createCaptureEmail, createResendEmail } from './email.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function createServerConfiguration(env = process.env) {
  const mode = env.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(mode)) throw new Error('NODE_ENV must be development, test, or production.');
  const production = mode === 'production';
  const required = ['PUBLIC_BASE_URL', 'BETTER_AUTH_SECRET', 'DATABASE_PATH', 'RESEND_API_KEY', 'RESEND_FROM'];
  const missing = production ? required.filter((name) => typeof env[name] !== 'string' || !env[name].trim()) : [];
  if (missing.length) throw new Error(`Missing production settings: ${missing.join(', ')}.`);
  const port = Number(env.PORT || 3000);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  const host = env.HOST || '127.0.0.1';
  if (!['127.0.0.1', 'localhost', '0.0.0.0'].includes(host)) throw new Error('HOST must be localhost, 127.0.0.1, or 0.0.0.0.');
  const publicBaseURL = env.PUBLIC_BASE_URL || `http://localhost:${port}`;
  let publicOrigin;
  try { publicOrigin = validateAuthOrigin(publicBaseURL); }
  catch { throw new Error('PUBLIC_BASE_URL must be an HTTPS origin, or an explicit local development/test HTTP origin.'); }
  if (production && !publicOrigin.startsWith('https:')) throw new Error('Production PUBLIC_BASE_URL requires HTTPS.');
  // Capture is deliberately limited to a developer's machine.
  if (!production && !['localhost', '127.0.0.1'].includes(new URL(publicOrigin).hostname)) throw new Error('Capture email mode requires a local development/test origin.');
  if (production && env.BETTER_AUTH_SECRET.length < 32) throw new Error('BETTER_AUTH_SECRET requires at least 32 characters in production.');
  if (production && (env.DATABASE_PATH === ':memory:' || !/^(?:[A-Za-z]:[\\/]|\/)/.test(env.DATABASE_PATH))) throw new Error('Production DATABASE_PATH must be an absolute durable SQLite file path.');
  return { production, port, host, publicBaseURL: publicOrigin, secret: env.BETTER_AUTH_SECRET,
    databasePath: env.DATABASE_PATH || ':memory:', apiKey: env.RESEND_API_KEY, from: env.RESEND_FROM };
}

export async function startServer({ env = process.env, fetchImpl = globalThis.fetch, listenPort } = {}) {
  // Validate transport before creating private storage or accepting requests.
  const config = createServerConfiguration(env);
  const emailTransport = config.production
    ? createResendEmail({ apiKey: config.apiKey, from: config.from, fetchImpl })
    : createCaptureEmail();
  const app = await createApp({ databasePath: config.databasePath, emailTransport, publicBaseURL: config.publicBaseURL, secret: config.secret });
  // Serve only declared public assets, never the repo root or captured mail.
  const assets = { '/': 'index.html', '/index.html': 'index.html', '/script.js': 'script.js', '/practice-fixture.js': 'practice-fixture.js', '/practice-audio.js': 'practice-audio.js' };
  for (const [route, file] of Object.entries(assets)) app.get(route, (_request, response) => response.sendFile(resolve(projectRoot, file)));
  const server = createServer(app);
  try {
    await new Promise((resolveListen, reject) => {
      server.once('error', reject);
      server.listen(listenPort ?? config.port, config.host, () => { server.removeListener('error', reject); resolveListen(); });
    });
  } catch (error) { app.locals.closeDatabase(); throw error; }
  let closing;
  const close = () => {
    if (!closing) closing = new Promise((resolveClose, reject) => {
      server.close((error) => {
        app.locals.closeDatabase();
        if (error) reject(error); else resolveClose();
      });
      server.closeAllConnections();
    });
    return closing;
  };
  return { app, server, emailTransport, close };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const running = await startServer();
    console.log(`Pitch Proof server listening on port ${running.server.address().port}.`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
      running.close().catch(() => { console.error('Server shutdown failed.'); process.exitCode = 1; });
    });
  } catch {
    // Settings errors name fields without echoing values; no provider or DB
    // exception is printed because those can contain private paths or links.
    try { createServerConfiguration(); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
    if (!process.exitCode) { console.error('Server startup failed. Check server settings and private storage.'); process.exitCode = 1; }
  }
}
