import Database from 'better-sqlite3';
import { getMigrations } from 'better-auth/db/migration';
import { createHash, randomUUID } from 'node:crypto';

export function openDatabase(databasePath) {
  if (!databasePath) throw new Error('A private databasePath is required.');
  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('busy_timeout = 5000');
  return database;
}

export async function migrateAuthDatabase(authOptions) {
  const { runMigrations } = await getMigrations(authOptions);
  await runMigrations();
}

// One conditional write claims first use even when requests race. Identity
// comes exclusively from the verified Better Auth session, never a request ID.
export function claimFirstSignIn(database, userId) {
  return database.prepare(
    'UPDATE user SET firstSignInCompleted = 1 WHERE id = ? AND firstSignInCompleted = 0',
  ).run(userId).changes === 1;
}

// Use SQLite date conversion because the library stores ISO date strings.
// Expiry is inclusive and checked before both auth and private requests.
export function expireAuthRecords(database, now) {
  const cutoff = new Date(Number(now)).toISOString();
  database.prepare('DELETE FROM session WHERE julianday(expiresAt) <= julianday(?)').run(cutoff);
  database.prepare('DELETE FROM verification WHERE julianday(expiresAt) <= julianday(?)').run(cutoff);
}

function verificationIdentifier(token) {
  return `email-verification:${createHash('sha256').update(token).digest('hex')}`;
}

// The library's signed email links are stateless. Store only their digest,
// bound to a user ID, so correction, cleanup and use can revoke them.
export function registerEmailVerification(database, user, token, now) {
  const createdAt = new Date(Number(now)).toISOString();
  database.prepare(
    `INSERT INTO verification (id, identifier, value, createdAt, updatedAt, expiresAt)
      SELECT ?, ?, id, ?, ?, ? FROM user WHERE id = ? AND email = ? AND emailVerified = 0`,
  ).run(randomUUID(), verificationIdentifier(token), createdAt, createdAt, new Date(Number(now) + 3600000).toISOString(), user.id, user.email);
}

export function consumeEmailVerification(database, token, now) {
  return database.transaction(() => {
    const record = database.prepare('DELETE FROM verification WHERE identifier = ? AND julianday(expiresAt) > julianday(?) RETURNING value')
      .get(verificationIdentifier(token), new Date(Number(now)).toISOString());
    if (!record) return false;
    const changed = database.prepare('UPDATE user SET emailVerified = 1, updatedAt = ? WHERE id = ? AND emailVerified = 0')
      .run(new Date(Number(now)).toISOString(), record.value).changes;
    database.prepare("DELETE FROM verification WHERE value = ? AND identifier LIKE 'email-verification:%'").run(record.value);
    return changed === 1;
  })();
}

export function correctPendingEmail(database, user, newEmail, now) {
  return database.transaction(() => {
    const changed = database.prepare(`UPDATE user SET email = ?, updatedAt = ?
      WHERE id = ? AND email = ? AND emailVerified = 0
      AND EXISTS (SELECT 1 FROM account WHERE userId = user.id AND providerId = 'credential' AND password = ?)`)
      .run(newEmail, new Date(Number(now)).toISOString(), user.id, user.email, user.password).changes;
    if (changed) database.prepare('DELETE FROM verification WHERE value = ?').run(user.id);
    return changed === 1;
  })();
}

// D-04: only pending accounts strictly older than 30 days are removed.
// Each batch is bounded; FK cascades also remove credential/session rows.
export function cleanupPendingAccounts(database, now) {
  const cutoff = new Date(Number(now) - 30 * 86400000).toISOString();
  database.transaction(() => {
    const stale = database.prepare('SELECT id FROM user WHERE emailVerified = 0 AND julianday(createdAt) < julianday(?) LIMIT 100').all(cutoff);
    for (const { id } of stale) {
      database.prepare('DELETE FROM verification WHERE value = ?').run(id);
      database.prepare('DELETE FROM user WHERE id = ? AND emailVerified = 0').run(id);
    }
  })();
}
