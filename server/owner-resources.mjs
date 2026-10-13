export { migratePrivateResources } from './db.mjs';

const INTERNAL_KEY = /^[A-Za-z0-9_-]{1,128}$/;
const MIME_TYPE = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i;

function requireOwner(ownerUserId) {
  if (typeof ownerUserId !== 'string' || !ownerUserId.trim()) {
    throw new Error('An owner user ID is required.');
  }
}

function metadata(row) {
  if (!row) return null;
  return { id: row.id, ownerUserId: row.owner_user_id, mimeType: row.mime_type, byteLength: row.byte_length, providerKey: row.provider_key };
}

// No unscoped get/list exists. Only trusted server code seeds metadata;
// routes never accept an owner ID or a filesystem path from a caller.
export function createOwnerResourceRepository(database) {
  const list = database.prepare('SELECT id, owner_user_id, mime_type, byte_length, provider_key FROM private_resources WHERE owner_user_id = ? ORDER BY id');
  const get = database.prepare('SELECT id, owner_user_id, mime_type, byte_length, provider_key FROM private_resources WHERE owner_user_id = ? AND id = ?');
  const create = database.prepare('INSERT INTO private_resources (id, owner_user_id, mime_type, byte_length, provider_key) VALUES (?, ?, ?, ?, ?)');
  return {
    list(ownerUserId) {
      requireOwner(ownerUserId);
      return list.all(ownerUserId).map(metadata);
    },
    get(ownerUserId, resourceId) {
      requireOwner(ownerUserId);
      if (typeof resourceId !== 'string' || !INTERNAL_KEY.test(resourceId)) return null;
      return metadata(get.get(ownerUserId, resourceId));
    },
    create({ id, ownerUserId, mimeType, byteLength, providerKey }) {
      requireOwner(ownerUserId);
      if (typeof id !== 'string' || !INTERNAL_KEY.test(id)) throw new Error('An internal resource ID is required.');
      if (typeof providerKey !== 'string' || !INTERNAL_KEY.test(providerKey)) throw new Error('An inert provider key is required.');
      if (typeof mimeType !== 'string' || !MIME_TYPE.test(mimeType)) throw new Error('A valid MIME type is required.');
      if (!Number.isSafeInteger(byteLength) || byteLength < 0) throw new Error('A valid byte length is required.');
      create.run(id, ownerUserId, mimeType, byteLength, providerKey);
      return this.get(ownerUserId, id);
    },
  };
}
