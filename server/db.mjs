import Database from 'better-sqlite3';
import { getMigrations } from 'better-auth/db/migration';

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
