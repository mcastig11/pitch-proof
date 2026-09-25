---
last_mapped_commit: 4704def55b2998953def280accaf6b2fa55b0fcb
last_mapped_at: 2026-09-24
---
# Testing Patterns

**Analysis Date:** 2026-09-24

## Test Framework

**Runner:**

- No test runner is configured. `package.json` defines `npm test` as `echo "Error: no test specified" && exit 1`.
- No Jest, Vitest, Mocha, Playwright, Cypress, or browser-test configuration is present.

**Assertion Library:**

- None detected.

**Run Commands:**

```bash
npm test                 # Placeholder; exits with an error
python -m http.server 8000  # Manual browser serving documented in README.md
```

## Test File Organization

**Location:**

- No test files or test directories are present. Application code lives in `script.js` and `index.html`.

**Naming:**

- No test naming pattern exists. If tests are added, co-locate unit tests with the JavaScript or use a clearly named `tests/` directory and `*.test.js` files consistently.

**Structure:**

```
script.js
index.html
tests/                 # Not present; suitable location for future automated tests
```

## Test Structure

**Suite Organization:**

```javascript
// No existing suite pattern. Pure helpers such as freqToNote() and detectPitch()
// are the clearest first targets for table-driven unit tests.
```

**Patterns:**

- No setup, teardown, assertions, fixtures, or test lifecycle hooks are implemented.
- Manual verification currently requires serving the root with a local HTTP server, granting microphone permission, starting/stopping a session, and exercising playback and AI feedback in a browser (`README.md`).

## Mocking

**Framework:** None.

**Patterns:**

```javascript
// No existing mocking pattern. Browser-dependent tests would need fakes for
// navigator.mediaDevices, AudioContext, MediaRecorder, requestAnimationFrame,
// canvas.getContext(), fetch, and the DOM.
```

**What to Mock:**

- Mock microphone and media lifecycle APIs for deterministic tests of `startRecording`, `stopRecording`, and `drawLoop` in `script.js`.
- Mock `fetch` and DOM elements for `getAIFeedback`; assert request construction, loading state, successful text extraction, and error recovery.

**What NOT to Mock:**

- Keep pure numerical helpers (`freqToNote`, `detectPitch`, and `updateCentsMeter` calculations) under direct test with real arrays and numeric inputs.
- Use real `Response`-like fixtures for API parsing tests instead of mocking every internal transformation.

## Fixtures and Factories

**Test Data:**

```javascript
// No fixtures exist. Future tests should use deterministic Float32Array samples
// for known tones and small pitchLog records with note, cents, freq, and time.
```

**Location:**

- No fixture directory is present. Keep small reusable audio/pitch fixtures under `tests/fixtures/` if the suite grows.

## Coverage

**Requirements:** None enforced. There is no coverage configuration or threshold.

**View Coverage:**

```bash

# Not available until a test runner and coverage tool are configured.

```

## Test Types

**Unit Tests:**

- Not used. The pure conversion and autocorrelation helpers in `script.js` are suitable for unit coverage once extraction/import boundaries are introduced.

**Integration Tests:**

- Not used. Browser integration should cover DOM updates, recording lifecycle, canvas rendering, and AI feedback request handling.

**E2E Tests:**

- Not used. No automated browser framework is configured; manual browser checks are the current verification method.

## Common Patterns

**Async Testing:**

```javascript
// No existing async test pattern. Future tests should await startRecording()
// and getAIFeedback(), then assert state after mocked promises settle.
```

**Error Testing:**

```javascript
// No existing error-test pattern. Cover denied microphone permission, failed
// fetch/network errors, malformed API responses, empty pitchLog, and stopping
// without a valid recorder in the browser-facing handlers in script.js.
```

---

*Testing analysis: 2026-09-24*
