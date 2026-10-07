import express from 'express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { createAuth, createAuthOptions, validateAuthOrigin } from './auth.mjs';
import { claimFirstSignIn, migrateAuthDatabase, openDatabase } from './db.mjs';

export async function createApp({ databasePath, emailTransport, allowedOrigins, clock = Date.now, publicBaseURL, secret } = {}) {
  // Reject insecure configuration before opening or migrating private storage.
  validateAuthOrigin(publicBaseURL);
  const database = openDatabase(databasePath);
  try {
    const authOptions = createAuthOptions({ database, emailTransport, allowedOrigins, publicBaseURL, secret });
    await migrateAuthDatabase(authOptions);
    const auth = createAuth(authOptions);
    const app = express();
    app.disable('x-powered-by');
    app.locals.auth = auth;
    app.locals.database = database;
    app.locals.closeDatabase = () => {
      if (database.open) database.close();
    };

    // Express 5 requires a named wildcard; leave the incoming body stream
    // intact for Better Auth by mounting it before the JSON parser.
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
