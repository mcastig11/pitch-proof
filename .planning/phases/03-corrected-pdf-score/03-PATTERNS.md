# Phase 03: Corrected PDF Score - Pattern Map

**Mapped:** 2026-10-15
**Scope:** Current source, 03-CONTEXT.md D-01–D-12 and 03-RESEARCH.md proposals; filenames below remain planning proposals.
**Tracking:** Every existing analog below was verified in `git ls-files`; no installed/runtime mirrors are analogs. No project skill directories were found.

## File Classification

Rows group files sharing an assignment; this is a scope inventory, not a prescribed plan split.

| New/modified file(s) | Role | Data flow | Closest tracked analog | Match |
|---|---|---|---|---|
| `score-model.js`, `score-commands.js` | model, utility | transform | `practice-fixture.js` | role; command/reflow new |
| `score-timeline.js` | service | transform | `practice-fixture.js` | role; general timeline new |
| `server/scores.mjs`, `server/score-revisions.mjs` | route, service | CRUD/request-response | `server/owner-resources.mjs` | role |
| `server/object-store.mjs` | service | file-I/O | `server/owner-resources.mjs` | partial: injected bytes only |
| `server/recognition-jobs.mjs` | service | event-driven/batch | `server/db.mjs` | partial: atomic SQL only |
| `worker/recognize.mjs` | service | batch/file-I/O | none | new bounded native worker |
| `worker/import-musicxml.mjs`, `worker/source-map.mjs` | utility | transform/file-I/O | none | new XML/provenance domain |
| `client/score-editor.js`, `client/pdf-source.js` | component, controller | event-driven/file-I/O | `client/workspace.js` | partial: lifecycle only |
| `score-review.html` | component | event-driven | `workspace.html` | shell role only |
| `client/workspace.js`, `workspace.html` | controller, component | request-response/event-driven | same files | exact current extension point |
| `server/app.mjs`, `server/index.mjs` | route, config | request-response | `server/app.mjs` | guard/wiring role |
| `server/db.mjs` | migration | CRUD | same file | exact migration extension |
| `script.js`, `index.html` | controller, component | event-driven | existing example path | preserve guest/count-in behavior |
| `package.json`, `package-lock.json`, `README.md` | config/documentation | batch | current files | dependency/test/deployment extension |
| `tests/score-model.test.cjs`, `tests/score-commands.test.cjs`, `tests/score-timeline.test.cjs` | test | transform | `tests/fixture.test.cjs`, `tests/timeline.test.cjs` | role |
| `tests/score-library.test.cjs`, `tests/score-revisions.test.cjs`, `tests/object-store.test.cjs`, `tests/recognition-jobs.test.cjs` | test | CRUD/file-I/O/batch | `tests/ownership.test.cjs` | role; jobs/storage semantics new |
| `tests/recognition-import.test.cjs`, `tests/score-source-map.test.cjs` | test | transform | `tests/fixture.test.cjs` | partial; real XML/coordinates new |
| `tests/score-review-ui.test.cjs` | test | event-driven | `tests/auth-ui.test.cjs` | role; no staff-layout proof |
| `scripts/evaluate-score-corpus.mjs`, `tests/fixtures/scores/` | utility, test fixtures | batch/file-I/O | none | new corpus/evidence harness |

## Pattern Assignments

### Owner API, repositories, storage seam

Primary analog: `server/owner-resources.mjs`. Imports use explicit relative `.mjs` extensions; its `Router` import is at line 44. Copy owner predicates and server-derived identity, never owner fields supplied by a caller.

```js
// server/owner-resources.mjs:20-21
const list = database.prepare('SELECT id, owner_user_id, mime_type, byte_length, provider_key FROM private_resources WHERE owner_user_id = ? ORDER BY id');
const get = database.prepare('SELECT id, owner_user_id, mime_type, byte_length, provider_key FROM private_resources WHERE owner_user_id = ? AND id = ?');
// server/owner-resources.mjs:65-72
router.get('/:resourceId/bytes', async (request, response) => {
  const resource = repository.get(response.locals.session.user.id, request.params.resourceId);
  if (!resource || !byteProvider) return missing(response);
  // Authorization completes before the injected provider is invoked.
  // Existing source also documents that no persistence adapter exists here.
  let bytes;
  try { bytes = await byteProvider(resource.providerKey); }
  catch { return response.status(502).json({ error: 'Resource is temporarily unavailable.' }); }
```

Validation: lines 33–40 reject invalid internal keys, MIME and byte counts; lines 73–80 validate provider output before sending bytes with `nosniff`. Public metadata excludes owner/provider fields (47–49). New upload, checksum, S3 streaming, quotas and revision conflicts need explicit contracts; these are not implemented by this analog.

### Atomic revisions and injectable job claims

Primary analog: `server/db.mjs`:20–28 creates idempotent owner-FK schema and owner index. Copy transaction shape and conditional-write result handling from lines 61–70:

```js
return database.transaction(() => {
  const record = database.prepare('DELETE FROM verification WHERE identifier = ? AND julianday(expiresAt) > julianday(?) RETURNING value')
    .get(verificationIdentifier(token), new Date(Number(now)).toISOString());
  if (!record) return false;
  const changed = database.prepare('UPDATE user SET emailVerified = 1, updatedAt = ? WHERE id = ? AND emailVerified = 0')
    .run(new Date(Number(now)).toISOString(), record.value).changes;
  database.prepare("DELETE FROM verification WHERE value = ? AND identifier LIKE 'email-verification:%'").run(record.value);
  return changed === 1;
})();
```

Apply the transaction technique to immutable confirmation and compare-and-save; design lease, heartbeat, attempt fencing, retries and partial-result durability separately. Inject clock/provider/runner into factories rather than invoking OMR in request handlers. Existing factory seam: `server/app.mjs`:53 accepts `clock = Date.now` and `byteProvider`; this is not a job system.

### Portable canonical score modules and timeline

Primary analog: `practice-fixture.js`:1–6 exports the same pure API to Node and browser:

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PitchProofFixture = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
```

Use distinct new namespace names. Validation collects errors and returns `{ valid: errors.length === 0, errors }` (47–88); invalid positions return `null` (120–124). Tracker marks clock discontinuities uncertain (196–214), copies snapshots (172–179), and observations remain `graded: false` (246–254). Copy these trust boundaries, not the fixture's treble-only, mandatory pickup, integer-beat restrictions (56–69, 95–104). Rational duration, multi-part events, stable identity, command affected sets, undo/reflow and review hashes are new domain rules. Keep existing example validator unchanged.

### Workspace/editor lifecycle

Primary analog: `client/workspace.js`:34–40 renders identity through `textContent`; lines 47–52 use same-origin/no-store fetch, HTTP status checks and stale-generation rejection:

```js
const response = await fetch('/api/me/workspace', { credentials: 'same-origin', cache: 'no-store' });
if (version !== generation) return;
if (response.status === 401) { clearPrivate(); workspaceState('ended'); if (!privatePage) get('account-status').textContent = ''; return; }
if (!response.ok) throw new Error('unavailable');
```

Do not transplant `load()` unchanged: line 44 clears private content before every fetch; lines 86 and 90–94 clear/reload on timer, pagehide, visibility and bfcache. Introduce non-destructive authorization checks distinct from editor mounting and explicit Save draft. Warn on unsaved navigation; expiry must revoke access and remove private display without silently autosaving. Decide/test in-memory draft handling under the privacy contract. Existing code has no unsaved-state protection. Use `workspace.html` as a native-control shell; staff gestures, Smoosic command adapter and PDF viewport overlays need new real-browser evidence.

### Contract and integration tests

Primary analog: `tests/ownership.test.cjs`:5–9 imports `node:test`, strict assertions and `withServerFixture`; lines 11–24 isolate repository DBs; 105–131 inject a byte provider, clock and call log. Copy the assertions proving denied requests never invoke storage:

```js
// tests/ownership.test.cjs:169-171
hidden(await request(fixture, '/api/me/resources/bob-resource/bytes', alice), 404);
hidden(await request(fixture, '/api/me/resources/missing/bytes', alice), 404);
assert.deepEqual(fixture.providerCalls, []);
```

Extend forged-owner tests (175–189), expiry/revocation (224–241), provider failures (244–254) to score bytes, revisions and jobs. `tests/support/server-fixture.cjs`:38–83 provides temp DB/listener cleanup, but its raw `node:sqlite` fixture DB is distinct from the app's `better-sqlite3` connection: copy ownership test's app factory wiring and close both. Pure tests copy `tests/fixture.test.cjs`:16–25 mutation/invalidity assertions and `tests/timeline.test.cjs`:9–20 exact time boundaries.

## Shared Patterns

- **Authentication:** `server/app.mjs`:172–184 derives a verified, unexpired session; 202–204 mounts the owner router after that guard. New protected API/page routes must use the same boundary and no-store; register browser assets deliberately through `server/index.mjs`.
- **Error/privacy:** `server/app.mjs`:205–208 logs only a bounded failure code and returns generic JSON. Never expose provider keys, original paths, XML, score content or credentials in public errors.
- **UI test limits:** `tests/support/browser-harness.cjs`:5–6 explicitly excludes layout/speech; its VM event API (49) and `tests/auth-ui.test.cjs`:262–305 exercise actual HTTP-backed identity rendering, not an actual browser. Add real pointer/keyboard and source-coordinate checks separately.
- **Actual browser evidence:** `scripts/verify-local-https.mjs`:19–24 launches isolated hidden Chrome; 50–68 provides bounded CDP/evaluate calls; 149–157 returns sanitized version/security evidence. This is host-dependent acceptance, not an exported generic browser helper or proof of editor behavior.
- **Fixture provenance:** `practice-fixture.js`:8–12 records original exercise authorship; this is the only analogous provenance seed. Asset hashes, rights manifests, independent gold annotations, physical scans and recognition/correction measurements need new corpus tooling.

## No Analog Found

No existing PDF parser/editor, MusicXML normalization, Audiveris process sandbox, durable recognition queue, S3 persistence, original-page coordinate join, command reflow/review hashing or corpus measurement exists. Use RESEARCH.md feasibility/security/license/provisioning gates; mocks do not establish those capabilities or cloud isolation. A confirmed reference must not upgrade Phase 3 microphone observations to measured grades.

## Metadata

Search scope: tracked root, `server/`, `client/`, `tests/`, `tests/support/`, `scripts/`; five primary pattern families above, with narrowly cited integration/test helpers. Package test command is `node --test tests/*.test.cjs` (`npm.cmd test` on Windows). No tests were run for this read-only mapping; only this artifact was written.
