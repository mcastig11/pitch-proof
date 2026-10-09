import { randomBytes } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { createEmailVerificationToken } from 'better-auth/api';
import { registerEmailVerification } from './db.mjs';

export const SESSION_LIFETIME_SECONDS = 604800;

export function validateAuthOrigin(publicBaseURL) {
  const origin = new URL(publicBaseURL);
  const loopback = ['localhost', '127.0.0.1'].includes(origin.hostname);
  if (origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('publicBaseURL must be an explicit origin without credentials or a path.');
  }
  if (origin.protocol !== 'https:' && (
    origin.protocol !== 'http:' || !loopback || process.env.NODE_ENV === 'production'
  )) {
    throw new Error('HTTPS is required; HTTP is allowed only for explicit development/test loopback origins.');
  }
  return origin.origin;
}

export function createAuthOptions({ database, emailTransport, allowedOrigins, publicBaseURL, secret, clock = Date.now }) {
  const baseURL = validateAuthOrigin(publicBaseURL);
  if (!emailTransport || typeof emailTransport.send !== 'function') {
    throw new Error('A server-side email transport is required.');
  }
  const authSecret = secret || process.env.BETTER_AUTH_SECRET;
  if (process.env.NODE_ENV === 'production' && (!authSecret || authSecret.length < 32)) {
    throw new Error('Production requires a server-only BETTER_AUTH_SECRET of at least 32 characters.');
  }
  const trustedOrigins = allowedOrigins || [baseURL];
  if (!Array.isArray(trustedOrigins) || trustedOrigins.length === 0) {
    throw new Error('An exact trusted-origin list is required.');
  }
  for (const origin of trustedOrigins) validateAuthOrigin(origin);
  const effectiveSecret = authSecret || randomBytes(32).toString('hex');

  async function deliverAccountEmail(message) {
    try { await emailTransport.send(message); }
    catch {
      // A provider outage must not make a known address distinguishable from
      // an unknown address. Keep public responses generic and allow resend.
      console.error('Account email delivery failed.', { code: 'EMAIL_DELIVERY_FAILED' });
    }
  }

  return {
    appName: 'Pitch Proof',
    baseURL,
    secret: effectiveSecret,
    logger: { disabled: true },
    database,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      // D-06: library consumption is atomic; all devices must sign in again.
      resetPasswordTokenExpiresIn: 3600,
      revokeSessionsOnPasswordReset: true,
      async sendResetPassword({ user, url }) {
        await deliverAccountEmail({ kind: 'reset', recipient: user.email, link: url });
      },
      async onPasswordReset({ user }) {
        database.transaction(() => {
          database.prepare('DELETE FROM session WHERE userId = ?').run(user.id);
          // Recovery always returns to My space, including before first use.
          database.prepare('UPDATE user SET firstSignInCompleted = 1 WHERE id = ?').run(user.id);
        })();
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      async sendVerificationEmail({ user, url }) {
        // A nonce keeps two links issued within one second distinct, including
        // when a corrected-away address is used by a different pending user.
        const token = await createEmailVerificationToken(effectiveSecret, user.email, undefined, 3600, { nonce: randomBytes(32).toString('hex') });
        const link = new URL(url);
        link.searchParams.set('token', token);
        registerEmailVerification(database, user, token, clock());
        await deliverAccountEmail({ kind: 'verification', recipient: user.email, link: link.href });
      },
    },
    user: {
      additionalFields: {
        firstSignInCompleted: { type: 'boolean', defaultValue: false, required: true, input: false },
      },
    },
    session: {
      expiresIn: SESSION_LIFETIME_SECONDS,
      disableSessionRefresh: true,
      cookieCache: { enabled: false },
    },
    databaseHooks: {
      user: { create: { async before(user) {
        const now = new Date(Number(clock()));
        return { data: { ...user, createdAt: now, updatedAt: now } };
      } } },
      session: { create: { async before(session) {
        const now = new Date(Number(clock()));
        return { data: { ...session, createdAt: now, updatedAt: now, expiresAt: new Date(now.getTime() + SESSION_LIFETIME_SECONDS * 1000) } };
      } } },
      verification: { create: { async before(verification) {
        if (!verification.identifier.startsWith('reset-password:')) return;
        const now = new Date(Number(clock()));
        return { data: { ...verification, createdAt: now, updatedAt: now, expiresAt: new Date(now.getTime() + 3600000) } };
      } } },
    },
    advanced: {
      useSecureCookies: baseURL.startsWith('https:'),
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax', secure: baseURL.startsWith('https:') },
      cookies: { session_token: { attributes: { maxAge: SESSION_LIFETIME_SECONDS } } },
    },
  };
}

export function createAuth(authOptions) {
  return betterAuth(authOptions);
}
