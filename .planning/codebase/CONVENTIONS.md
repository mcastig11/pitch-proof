---
last_mapped_commit: 4704def55b2998953def280accaf6b2fa55b0fcb
last_mapped_at: 2026-09-24
---
# Coding Conventions

**Analysis Date:** 2026-09-24

## Naming Patterns

**Files:**

- The application uses a small flat browser app with lowercase files: `script.js` and `index.html`.

**Functions:**

- Use camelCase for functions, including `freqToNote`, `detectPitch`, `startRecording`, `stopRecording`, `drawLoop`, `updateCentsMeter`, and `getAIFeedback` in `script.js`.
- Event callbacks are commonly expressed as inline arrow functions, while reusable behavior is named with verb-oriented functions.

**Variables:**

- Use camelCase for locals and DOM references (`audioContext`, `pitchLog`, `recordBtn`).
- Use `const` for stable references and `let` for mutable application state. Mutable state is module-scoped in `script.js` (`isRecording`, `mediaRecorder`, `lastRecordingURL`).
- Constants use uppercase snake case for fixed collections such as `NOTE_NAMES`; there is no broad convention for every numeric threshold.

**Types:**

- This is plain JavaScript with inferred object shapes. Pitch results are returned as object literals such as `{ note, cents, midi }`; preserve those shapes when extending the code.

## Code Style

**Formatting:**

- No formatter configuration is present. Match the existing two-space indentation, semicolons, single quotes, and trailing commas where already used.
- Keep browser behavior in `script.js` and markup/styles in `index.html`; CSS is currently embedded in the HTML.
- Existing sections use long divider comments to separate concerns (pitch helpers, state, DOM refs, recording, draw loop, and AI feedback).

**Linting:**

- No ESLint, Biome, or other lint configuration is present. `npm test` is only a placeholder that exits with an error.
- Avoid introducing globals: existing browser globals are used directly (`document`, `navigator`, `AudioContext`, `MediaRecorder`, `fetch`).

## Import Organization

**Order:**

1. No JavaScript imports are currently used.
2. Third-party functionality is loaded through the package manifest (`pitchy`) but is not imported in `script.js`.
3. Browser APIs and DOM references are accessed directly after module-level state declarations.

**Path Aliases:**

- None detected.

## Error Handling

**Patterns:**

- Wrap permission and network operations in `try/catch`, update the UI with a user-facing message, and log the original error with `console.error` (`startRecording` and `getAIFeedback` in `script.js`).
- Use sentinel values for signal-processing failure: `detectPitch` returns `-1` for quiet or unrecognized input and `freqToNote` returns `null` for non-positive frequencies.
- Guard empty user state before expensive work (`getAIFeedback` checks `pitchLog.length === 0`). Preserve UI cleanup and button re-enabling on asynchronous paths.
- Validate response content defensively with optional chaining and a fallback message (`data.content?.[0]?.text || ...`). HTTP status handling is not currently implemented; new API calls should check `response.ok` before consuming the body.

## Logging

**Framework:** `console.error` only.

**Patterns:**

- Log caught exceptions for debugging while showing concise status text in `statusEl` or `feedbackBox`.
- Do not log microphone data, API keys, or complete pitch sessions; keep diagnostic logging scoped to failures.

## Comments

**When to Comment:**

- Comment algorithm intent and browser-specific behavior, as in the autocorrelation explanation above `detectPitch`, the MIDI conversion assumptions in `freqToNote`, and the media-permission/download notes in `startRecording`.
- Prefer comments that explain why a threshold or transformation exists; avoid narrating obvious DOM assignments.

**JSDoc/TSDoc:**

- No JSDoc/TSDoc convention is present. If adding public/reusable helpers, document parameter units and sentinel return values rather than adding type annotations throughout the app.

## Function Design

**Size:**

- Keep pure calculations isolated (`freqToNote`, `detectPitch`, `updateCentsMeter`) and keep event orchestration in named functions. `drawLoop` and `getAIFeedback` are currently the largest mixed-responsibility functions.

**Parameters:**

- Pass required data explicitly (`buffer, sampleRate`, or `cents`) and read UI/application state from the module scope for event handlers.
- Preserve numeric units in names/comments: frequencies are Hz, deviations are cents, and pitch-log timestamps are seconds.

**Return Values:**

- Return `null`/`-1` for invalid or unavailable pitch data and object literals for successful conversions.
- UI event handlers generally return nothing; async handlers return promises and update the DOM as their observable result.

## Module Design

**Exports:**

- There are no ES module exports. `script.js` is loaded as a classic browser script after the page markup, so DOM lookups occur at top level.

**Barrel Files:**

- Not applicable.

---

*Convention analysis: 2026-09-24*
