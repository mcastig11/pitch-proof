# Phase 2: Private Practice Access - Pattern Map

**Mapped:** 2026-09-28  
**Files analyzed:** 20 proposed new/modified files  
**Analogs found:** 14 / 20

The paths below are planning candidates inferred from `02-CONTEXT.md` and `02-RESEARCH.md`, not filenames locked by the user. The current Phase 1 source is authoritative; the older `.planning/codebase/` map still describes the pre-Phase-1 prototype. All analog paths in this map were verified with `git ls-files -- <path>` and are tracked source files.

## File Classification

| New/Modified File | Role | Data Flow | Closest Tracked Analog | Match Quality |
|---|---|---|---|---|
| `server/app.mjs` | route/config | request-response | — | no analog: no HTTP server |
| `server/index.mjs` | config | request-response | — | no analog: no server entry |
| `server/auth.mjs` | service/config | request-response, CRUD | — | no analog: no auth/session layer |
| `server/email.mjs` | service | event-driven, request-response | — | no analog: no email transport |
| `server/db.mjs` | model/config | CRUD, file-I/O | — | no analog: no persistent database |
| `server/owner-resources.mjs` | service/route | CRUD, file-I/O | — | no analog: no private resource route |
| `client/auth.js` | component/controller | request-response, event-driven | `script.js` | role/data-flow partial |
| `client/workspace.js` | component/controller | request-response | `script.js` | role/data-flow partial |
| `welcome.html` | component | request-response | `index.html` | same page role |
| `auth.html` | component | request-response | `index.html` | page role; forms are new |
| `workspace.html` | component | request-response | `index.html` | same page role |
| `index.html` | component | request-response | `index.html` | exact existing page |
| `script.js` | component/controller | event-driven, streaming | `script.js` | exact existing example controller |
| `package.json` | config | batch | `package.json` | exact existing package config |
| `.gitignore` | config | file-I/O | `.gitignore` | exact existing ignore file |
| `tests/auth-flow.test.cjs` | test | request-response | `tests/audio-session.test.cjs` | test structure; HTTP new |
| `tests/ownership.test.cjs` | test | CRUD, request-response | `tests/fixture.test.cjs` | test structure; owner HTTP new |
| `tests/security.test.cjs` | test | request-response | `tests/audio-session.test.cjs` | test structure; HTTP new |
| `tests/account-ui.test.cjs` | test | event-driven | `tests/page-startup.test.cjs` | test harness match |
| `tests/accessibility-contract.test.cjs` | test | transform | `tests/accessibility-contract.test.cjs` | exact existing static UI contract |

## Pattern Assignments

### Public page files: `welcome.html`, `auth.html`, `workspace.html`, `index.html`

**Analog:** `index.html` (tracked). Copy the semantic page shell, native controls, focus styles, responsive breakpoints, and explicit status text. The welcome, auth, and workspace pages need their own purpose-specific content. Do not copy the score interface into them.

**Page and interaction pattern** (`index.html:11-17`, `index.html:54-57`, `index.html:60-70`):

```html
<main class="page">
  <header><strong>Pitch Proof</strong><span>Example practice</span></header>
  <section aria-labelledby="page-title">
    <h1 id="page-title">Practice the example score</h1>
  </section>
  <section class="panel setup" aria-labelledby="setup-heading">
    <div class="field"><label for="part-select">Vocal part</label><select id="part-select" disabled></select></div>
  </section>
</main>
```

`index.html:11-15` gives controls a 44px minimum, disabled state, and visible 2px focus outline. `index.html:54-57` uses `[hidden] { display: none !important; }`, two responsive breakpoints, and reduced-motion handling. Apply those rules to account forms and the account menu. `index.html:94-98` distinguishes live provisional observations from grades; retain this guest-facing text. `index.html:101-112` places practice controls before the polite live announcement and loads the fixture, audio, then controller scripts in dependency order. Add account browser assets without making the existing three-script example depend on an authenticated session.

### Example integration: `script.js`

**Analog:** `script.js` (tracked). Keep the guest practice path independent from session-status fetches. Add a quiet invitation near the example and repeat it once after an attempt, using D-03's exact copy. Add signed-in My space/account navigation, but do not gate microphone or provisional pitch observations.

**DOM and safe text pattern** (`script.js:4-26`):

```js
const fixtureApi = window.PitchProofFixture;
const audioApi = window.PitchProofAudio;
const ids = ['fixture-title', 'part-select', 'start-measure', /* existing ids */];
const ui = Object.fromEntries(ids.map((id) => [
  id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
  document.getElementById(id),
]));
function setText(node, value) { node.textContent = value; }
```

Use `textContent` for server-provided identity and status. `script.js:216-245` is the exact attempt-end seam: `endAttempt()` stops audio, calls `setIdleAfterStop(...)`, and states that no grades were saved. Place the one-time post-attempt invitation there without changing retry, stop, or audio cleanup. `script.js:335-340` updates provisional observation text from `onObservation` without an API call. `script.js:368-377` registers named button handlers and then loads the fixture. Do not bind auth network operations into the audio callback or `followPosition()` frame loop.

### Browser account flow: `client/auth.js`, `client/workspace.js`

**Analog:** `script.js` (tracked). The existing browser controller provides event registration, async UI status, and safe DOM rendering, but has no `fetch` or cookie handling. The Better Auth browser client, 401 handling, route intent, and private data fetching must follow research/vendor guidance rather than an in-repo auth example.

**Async UI/error pattern** (`script.js:247-275`):

```js
async function checkMicrophone() {
  ui.micButton.disabled = true;
  ui.micStatus.classList.remove('error');
  try {
    const ready = await audio.checkMicrophone();
    if (!ready) return;
    ui.micStatus.textContent = 'Microphone ready. Sing a note to check the input level.';
  } catch (error) {
    console.error(error);
    ui.micStatus.classList.add('error');
  } finally {
    ui.micButton.disabled = false;
  }
}
```

For account requests, preserve the disable/try/catch/finally pattern, but show generic errors that do not reveal account existence and clear private workspace DOM on 401, sign-out, or reset. The closest safe rendering example is `script.js:114-127`, which creates `<option>` nodes and assigns `.textContent` from data; do the same for account identity. Do not copy the old direct browser API-key behavior described in `AGENTS.md`: Phase 2 transport and secrets are server-only.

### Package and local secrets: `package.json`, `.gitignore`

**Analogs:** same tracked files.

```json
"scripts": {
  "test": "node --test tests/*.test.cjs"
},
"type": "commonjs"
```

This is `package.json:6-12`. Preserve the `.cjs` tests and CommonJS package setting; new Better Auth/Express server modules can use `.mjs` as `02-RESEARCH.md:75` recommends. Add build and start scripts explicitly. `.gitignore:1-3` already excludes `node_modules/` and `.env`; extend it for local SQLite databases, journals, and private object storage, not public assets.

### HTTP integration tests: `tests/auth-flow.test.cjs`, `tests/ownership.test.cjs`, `tests/security.test.cjs`

**Analogs:** `tests/audio-session.test.cjs` and `tests/fixture.test.cjs` (tracked). These supply built-in test/assert imports, injected dependencies, isolated fixtures, and negative assertions. There is no existing HTTP or cookie-jar harness: create one against an ephemeral local server and isolated temporary SQLite file. Capture email links through the new transport interface.

**Test imports and injected harness** (`tests/audio-session.test.cjs:1-3`, `tests/audio-session.test.cjs:12-25`, `tests/audio-session.test.cjs:60-66`):

```js
const assert = require('node:assert/strict');
const test = require('node:test');

function makeAudioHarness({ getUserMedia, failAnalyser = false } = {}) {
  const tracks = [];
  const mediaDevices = {
    getUserMedia: getUserMedia || (async () => {
      const track = { stopped: 0, stop() { this.stopped++; } };
      tracks.push(track);
      return { getTracks: () => [track] };
    }),
  };
  // The harness injects fake browser dependencies into createPracticeAudio.
}
```

Mirror that dependency-injection style for `createApp({ database, emailTransport, ... })`, then make raw `fetch` requests with separate Alice and Bob cookies. `tests/audio-session.test.cjs:86-99` tests a stale asynchronous result after stop; apply the same idea to expiry and revoked-session requests. `tests/fixture.test.cjs:16-25` tests malformed state fails closed, while `tests/fixture.test.cjs:28-34` tests unknown IDs return no selectable resource/position. Ownership tests must assert 401 without a session and 404 for a foreign object ID and bytes, including a forged owner ID in body or URL.

### Browser and accessibility tests: `tests/account-ui.test.cjs`, `tests/accessibility-contract.test.cjs`

**Analogs:** `tests/page-startup.test.cjs` and `tests/accessibility-contract.test.cjs` (tracked).

**DOM harness pattern** (`tests/page-startup.test.cjs:12-35`):

```js
const elements = new Map();
const document = {
  getElementById(id) {
    if (!elements.has(id)) {
      const listeners = new Map();
      elements.set(id, {
        listeners,
        addEventListener(type, callback) { listeners.set(type, callback); },
      });
    }
    return elements.get(id);
  },
};
vm.runInNewContext(script, { window: {}, document, console: { error() {} } });
```

Use this for listener/wiring smoke tests. Extend `tests/accessibility-contract.test.cjs:22-60`'s visible-label, native-control, DOM-order, and focus assertions for signup/sign-in/reset inputs. Its `:72-89` live-region check is the precedent for pending confirmation and session-ended announcements. Avoid treating regex-only markup assertions as proof of auth or access control; raw HTTP tests must provide that proof.

## Shared Patterns

### Public example and provisional audio

**Sources:** `index.html:94-112`, `script.js:335-340`, `practice-audio.js:51-69`, `practice-audio.js:221-225`. **Apply to:** public example, account invitation, session expiry behavior. `analyzeAudioFrame()` returns text such as `Pitch heard: ${pitch.note}` and keeps no grade or server persistence. `startPractice()` calls `onObservation?.(analysis)` after count-in. Preserve this path for guests and across a sign-in expiry during an active attempt; check private access only when navigating to private content.

### Safe identity rendering and user-facing errors

**Sources:** `script.js:26-38`, `script.js:114-127`, `script.js:247-275`, `tests/fixture.test.cjs:36-43`. **Apply to:** account status, workspace identity, pending/reset messages. Render variable data through `.textContent`, keep error copy concise, disable and re-enable pending controls in `finally`, and log only scoped failures. Do not log email links, cookies, passwords, private content, or secrets.

### Test seams and failure cases

**Sources:** `practice-audio.js:72-76`, `tests/audio-session.test.cjs:12-66`, `tests/audio-session.test.cjs:86-143`. **Apply to:** new server factory, email transport, auth clock/session tests. The audio module injects external APIs through an `options` object, and tests use a fake harness to verify cleanup and stale results. Build similarly injectable server/database/email seams. This is an architectural analogy, not an existing auth implementation.

### Server security guidance has no in-repo analog

**Source for implementation:** `02-RESEARCH.md:111-129` and its official Better Auth/OWASP citations. **Apply to:** `server/app.mjs`, `server/auth.mjs`, `server/db.mjs`, `server/owner-resources.mjs`. Mount auth before JSON parsing; get the server session from request headers; require verified identity; enforce fixed expiry and all-session reset revocation; query resource metadata using both resource ID and authenticated owner ID; respond 404 for foreign IDs; use `Cache-Control: no-store` for private responses. Never derive authority from browser-supplied owner IDs or a visible workspace shell.

## No Analog Found

| File | Role / Flow | Reason / Source to use |
|---|---|---|
| `server/app.mjs` | route/config, request-response | No server or protected route; use `02-RESEARCH.md:111-113,154-175`. |
| `server/index.mjs` | config, request-response | No server entry or startup failure policy; use `02-RESEARCH.md:140-152`. |
| `server/auth.mjs` | service/config, request-response | No password, verification, reset, or session code; use vendor patterns in `02-RESEARCH.md:111-125`. |
| `server/email.mjs` | service, event-driven | No email sender/capture; use `02-RESEARCH.md:123-125`. |
| `server/db.mjs` | model/config, CRUD | No migration, SQLite connection, or transaction pattern; use `02-RESEARCH.md:65-77,127-129`. |
| `server/owner-resources.mjs` | service/route, CRUD/file-I/O | No private object store or owner predicate; use `02-RESEARCH.md:127-129`. |

## Metadata

**Analog search scope:** tracked root application files, `tests/*.test.cjs`, `package.json`, `.gitignore`; excluded ignored install/runtime mirrors.  
**Files scanned:** 10 tracked analog candidates, plus Phase 2 context/research and `AGENTS.md`.  
**Pattern extraction date:** 2026-09-28.  
**Boundary:** no personal PDF upload, practice history, separate pitch playground, or saved grades in Phase 2. Production email/domain and durable hosting remain deployment prerequisites identified in research.
