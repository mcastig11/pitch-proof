import express from 'express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { createAuth, createAuthOptions, validateAuthOrigin } from './auth.mjs';
import { claimFirstSignIn, expireAuthRecords, migrateAuthDatabase, openDatabase } from './db.mjs';

// Bounds memory as well as traffic. At capacity, reject new buckets rather
// than evicting live counters and letting an attacker reset their allowance.
function createAuthLimiter(clock, overrides = {}) {
  const limits = { ip: 100, account: 20, windowMs: 60000, maxEntries: 10000, ...overrides };
  for (const value of Object.values(limits)) {
    if (!Number.isSafeInteger(value) || value < 1) throw new Error('Auth rate limits must be positive integers.');
  }
  const buckets = new Map();
  return (request, response, next) => {
    const now = Number(clock());
    for (const [key, value] of buckets) if (value.expiresAt <= now) buckets.delete(key);
    const keys = [[`ip:${request.socket.remoteAddress}`, limits.ip]];
    if (typeof request.body?.email === 'string') {
      request.body.email = request.body.email.trim().toLowerCase();
      keys.push([`account:${request.body.email}`, limits.account]);
    }
    for (const [key, limit] of keys) {
      const bucket = buckets.get(key);
      if ((!bucket && buckets.size >= limits.maxEntries) || (bucket && bucket.count >= limit)) {
        response.set('Retry-After', String(Math.ceil(limits.windowMs / 1000)));
        return response.status(429).json({ error: 'Please wait before trying again.' });
      }
    }
    for (const [key] of keys) {
      const bucket = buckets.get(key) || { count: 0, expiresAt: now + limits.windowMs };
      bucket.count += 1;
      buckets.set(key, bucket);
    }
    next();
  };
}

function sendAuthResponse(response, result) {
  response.status(result.status);
  for (const [name, value] of result.headers) {
    if (!['set-cookie', 'cache-control', 'content-length'].includes(name)) response.set(name, value);
  }
  const cookies = result.headers.getSetCookie();
  if (cookies.length) response.set('Set-Cookie', cookies);
  return result.text().then((body) => response.send(body));
}

export async function createApp({ databasePath, emailTransport, allowedOrigins, clock = Date.now, publicBaseURL, secret, rateLimits } = {}) {
  // Reject insecure configuration before opening or migrating private storage.
  validateAuthOrigin(publicBaseURL);
  const database = openDatabase(databasePath);
  try {
    const authOptions = createAuthOptions({ database, emailTransport, allowedOrigins, publicBaseURL, secret, clock });
    await migrateAuthDatabase(authOptions);
    const auth = createAuth(authOptions);
    const app = express();
    app.disable('x-powered-by');
    app.locals.auth = auth;
    app.locals.database = database;
    app.locals.closeDatabase = () => {
      if (database.open) database.close();
    };
    app.use(['/api/auth', '/api/me'], (request, response, next) => {
      response.set('Cache-Control', 'no-store');
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && (
        request.headers.origin !== authOptions.baseURL || request.headers.host !== new URL(authOptions.baseURL).host
      )) {
        return response.status(403).json({ error: 'Request origin is not allowed.' });
      }
      expireAuthRecords(database, clock());
      next();
    });

    const authLimiter = createAuthLimiter(clock, rateLimits);
    // Read mutation bodies once, then pass a Web Request to Better Auth's
    // documented handler. GET requests retain the Node adapter/raw stream.
    app.post('/api/auth/*splat', express.json({ limit: '16kb' }), authLimiter, async (request, response) => {
      const started = performance.now();
      const result = await auth.handler(new Request(new URL(request.originalUrl, authOptions.baseURL), {
        method: 'POST', headers: fromNodeHeaders(request.headers), body: JSON.stringify(request.body || {}),
      }));
      const generic = ['/api/auth/sign-up/email', '/api/auth/send-verification-email', '/api/auth/request-password-reset'].includes(request.path);
      if (generic && result.ok) {
        // Public success contains no user IDs, dates, verification flags, or
        // address state. Pad fast branches so email existence is less visible.
        const remaining = 250 - (performance.now() - started);
        if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
        return response.json({ status: true, message: 'Check your email for the next step if the address is eligible.' });
      }
      return sendAuthResponse(response, result);
    });
    app.all('/api/auth/*splat', toNodeHandler(auth));
    app.use(express.json({ limit: '16kb' }));

    async function requireVerifiedSession(request, response, next) {
      response.set('Cache-Control', 'no-store');
      const result = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
      if (!result?.user?.emailVerified || new Date(result.session.expiresAt).getTime() <= Number(clock())) {
        return response.status(401).json({ error: 'Sign in to open your private space.' });
      }
      response.locals.session = result;
      next();
    }

    app.post('/api/me/landing', requireVerifiedSession, (request, response) => {
      if (request.headers.origin && !authOptions.trustedOrigins.includes(request.headers.origin)) {
        return response.status(403).json({ error: 'Request origin is not allowed.' });
      }
      const firstSignIn = claimFirstSignIn(database, response.locals.session.user.id);
      return response.json({ destination: firstSignIn ? '/' : '/workspace', firstSignIn });
    });
    app.get('/api/me/workspace', requireVerifiedSession, (_request, response) => {
      return response.json({ identity: response.locals.session.user.name });
    });
    app.use((error, _request, response, _next) => {
      // Keep credentials, email links, and private content out of logs/errors.
      console.error('Account request failed.', { code: error.code || 'REQUEST_FAILED' });
      response.status(error.status === 400 ? 400 : 500).json({ error: 'The request could not be completed.' });
    });
    return app;
  } catch (error) {
    if (database.open) database.close();
    throw error;
  }
}
