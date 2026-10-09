import express from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { z } from 'zod';
import { createAuth, createAuthOptions, validateAuthOrigin } from './auth.mjs';
import { claimFirstSignIn, cleanupPendingAccounts, consumeEmailVerification, correctPendingEmail, expireAuthRecords, migrateAuthDatabase, openDatabase } from './db.mjs';

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
    // SQLite remains the creation gate even when separate HTTP requests race.
    database.exec('CREATE UNIQUE INDEX IF NOT EXISTS user_email_normalized_unique ON user (lower(trim(email)))');
    cleanupPendingAccounts(database, clock());
    const auth = createAuth(authOptions);
    const dummyPasswordHash = await hashPassword(randomBytes(32).toString('hex'));
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
      if (request.originalUrl.startsWith('/api/auth/') && request.method === 'POST') cleanupPendingAccounts(database, clock());
      next();
    });

    const authLimiter = createAuthLimiter(clock, rateLimits);
    const receiptName = 'pitch-proof.confirmation';
    const receiptOptions = { httpOnly: true, sameSite: 'lax', secure: authOptions.baseURL.startsWith('https:'), path: '/api/auth/confirmation-result', maxAge: 60000 };
    const signReceipt = (value) => createHmac('sha256', authOptions.secret).update(value).digest('hex');
    app.get('/api/auth/confirmation-result', (request, response) => {
      const receipt = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${receiptName}=`))?.slice(receiptName.length + 1) || '';
      const [issued, nonce, signature = ''] = receipt.split('.');
      const expected = signReceipt(`${issued}.${nonce}`);
      const age = Number(clock()) - Number(issued);
      const confirmed = /^[a-f0-9]{64}$/.test(signature) && /^[a-f0-9]{32}$/.test(nonce || '')
        && age >= 0 && age < 60000 && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      response.clearCookie(receiptName, receiptOptions);
      return response.status(confirmed ? 200 : 400).json({ confirmed });
    });
    app.get('/api/auth/verify-email', (request, response) => {
      // This route owns one-use verification; no stateless fallback may verify
      // an address after the original account corrected it or was removed.
      const token = request.query.token;
      if (typeof token !== 'string' || token.length > 4096) return response.status(400).json({ error: 'Invalid verification link.' });
      let callback;
      if (request.query.callbackURL !== undefined) {
        try {
          callback = new URL(request.query.callbackURL, authOptions.baseURL);
          if (callback.origin !== authOptions.baseURL) throw new Error('Invalid callback');
          if (callback.pathname !== '/' && !(callback.pathname === '/auth' && callback.searchParams.get('mode') === 'verify')) throw new Error('Invalid callback');
        } catch { return response.status(403).json({ error: 'Request origin is not allowed.' }); }
      }
      const verified = consumeEmailVerification(database, token, clock());
      if (callback) {
        callback.searchParams.delete('confirmed');
        callback.searchParams.delete('token');
        callback.searchParams.delete('error');
        if (verified && callback.pathname === '/auth') {
          const value = `${Number(clock())}.${randomBytes(16).toString('hex')}`;
          response.cookie(receiptName, `${value}.${signReceipt(value)}`, receiptOptions);
          callback.searchParams.set('confirmed', '1');
        }
        if (!verified) callback.searchParams.set('error', 'INVALID_TOKEN');
        return response.redirect(callback.pathname + callback.search + callback.hash);
      }
      return response.status(verified ? 200 : 400).json(verified ? { status: true, user: null } : { error: 'Invalid verification link.' });
    });
    // Read mutation bodies once, then pass a Web Request to Better Auth's
    // documented handler. GET requests retain the Node adapter/raw stream.
    app.post('/api/auth/*splat', express.json({ limit: '16kb' }), authLimiter, async (request, response) => {
      const started = performance.now();
      if (request.path === '/api/auth/correct-pending-email') {
        const input = z.object({ email: z.email(), password: z.string().min(1).max(128), newEmail: z.email() }).safeParse({
          ...request.body, newEmail: typeof request.body?.newEmail === 'string' ? request.body.newEmail.trim().toLowerCase() : request.body?.newEmail,
        });
        if (!input.success) return response.status(400).json({ error: 'Enter a valid address and password.' });
        const { email, password, newEmail } = input.data;
        const user = database.prepare(`SELECT user.*, account.password FROM user JOIN account ON account.userId = user.id
          WHERE user.email = ? AND account.providerId = 'credential'`).get(email);
        const valid = await verifyPassword({ password, hash: user?.password || dummyPasswordHash });
        if (!valid || !user || user.emailVerified) return response.status(401).json({ error: 'Email or password is incorrect.' });
        let changed;
        try { changed = correctPendingEmail(database, user, newEmail, clock()); }
        catch (error) {
          if (!error.code?.startsWith('SQLITE_CONSTRAINT_UNIQUE')) throw error;
          return response.json({ status: true, message: 'Check your email for the next step if the address is eligible.' });
        }
        if (!changed) return response.status(401).json({ error: 'Email or password is incorrect.' });
        await authOptions.emailVerification.sendVerificationEmail({
          user: { ...user, email: newEmail }, url: `${authOptions.baseURL}/api/auth/verify-email?callbackURL=%2Fauth%3Fmode%3Dverify`,
        });
        return response.json({ status: true, message: 'Check your email for the next step if the address is eligible.' });
      }
      const result = await auth.handler(new Request(new URL(request.originalUrl, authOptions.baseURL), {
        method: 'POST', headers: fromNodeHeaders(request.headers), body: JSON.stringify(request.body || {}),
      }));
      const generic = ['/api/auth/sign-up/email', '/api/auth/send-verification-email', '/api/auth/request-password-reset'].includes(request.path);
      const signupConflict = request.path === '/api/auth/sign-up/email' && result.status === 422
        && (await result.clone().json()).code === 'FAILED_TO_CREATE_USER'
        && database.prepare('SELECT id FROM user WHERE email = ?').get(request.body.email);
      if (generic && (result.ok || signupConflict)) {
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

    async function verifiedSession(request) {
      const result = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
      if (!result?.user?.emailVerified || new Date(result.session.expiresAt).getTime() <= Number(clock())) {
        return null;
      }
      return result;
    }
    async function requireVerifiedSession(request, response, next) {
      response.set('Cache-Control', 'no-store');
      const result = await verifiedSession(request);
      if (!result) return response.status(401).json({ error: 'Sign in to open your private space.' });
      response.locals.session = result;
      next();
    }
    app.get(['/workspace', '/workspace.html'], async (request, response) => {
      response.set('Cache-Control', 'no-store');
      if (!await verifiedSession(request)) return response.redirect('/auth?mode=signin&returnTo=%2Fworkspace');
      return response.sendFile(fileURLToPath(new URL('../workspace.html', import.meta.url)));
    });

    app.post('/api/me/landing', requireVerifiedSession, (request, response) => {
      if (request.headers.origin && !authOptions.trustedOrigins.includes(request.headers.origin)) {
        return response.status(403).json({ error: 'Request origin is not allowed.' });
      }
      const firstSignIn = claimFirstSignIn(database, response.locals.session.user.id);
      return response.json({ destination: firstSignIn && request.body?.returnTo !== '/workspace' ? '/' : '/workspace', firstSignIn });
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
