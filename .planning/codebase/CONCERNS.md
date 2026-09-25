---
last_mapped_commit: 4704def55b2998953def280accaf6b2fa55b0fcb
last_mapped_at: 2026-09-24
---
# Codebase Concerns

**Analysis Date:** 2026-09-24

## Tech Debt

**Single-file application architecture:**

- Issue: All UI wiring, audio lifecycle, pitch detection, statistics, recording, playback, and AI integration live in one global script.
- Files: `script.js`, `index.html`
- Impact: Changes cross unrelated responsibilities, make lifecycle bugs difficult to isolate, and prevent focused unit testing without browser-wide setup.
- Fix approach: Extract pure pitch/statistics functions, an audio session controller, recorder service, and feedback client into separate modules; keep DOM rendering as a thin layer.

**Dead and incomplete UI state:**

- Issue: `tuningBadge` and `waveformBadge` are queried but never updated, while navigation items and the “new session” button have no behavior.
- Files: `script.js`, `index.html`
- Impact: The interface can report stale “waiting”/“idle” states and advertises controls that do nothing.
- Fix approach: Define explicit UI state transitions and either implement these controls or remove them until supported.

**Duplicated/inconsistent tuning thresholds:**

- Issue: The note color uses a ±10-cent threshold, session “in tune” uses ±15 cents, and the meter uses ±10 cents.
- Files: `script.js`
- Impact: The same sample can be shown as off-tune while counted as in tune, confusing users and making feedback harder to validate.
- Fix approach: Centralize thresholds in named constants and use one documented classification policy for display, statistics, and AI summaries.

**Encoding/maintenance quality:**

- Issue: User-visible musical symbols and comments render as mojibake such as `â€”`, `â™­`, and `â€“` in both source and markup.
- Files: `script.js`, `index.html`
- Impact: The UI and generated status messages display corrupted punctuation and symbols.
- Fix approach: Save files as UTF-8, replace corrupted sequences with correct characters/entities, and add a browser smoke check for visible labels.

## Known Bugs

**Playback is displayed before a recording exists:**

- Symptoms: The playback button is assigned `display: block` during script initialization, overriding the markup’s hidden state; clicking before recording silently does nothing.
- Files: `script.js`, `index.html`
- Trigger: Load the page before recording.
- Workaround: None; only click after a successful recording.

**Recorder chunks leak across sessions:**

- Symptoms: `recordedChunks` is initialized once and never cleared before a new recording. Later downloads contain prior sessions concatenated into the new blob.
- Files: `script.js`
- Trigger: Complete two or more recordings in one page load.
- Workaround: Reload the page between sessions.

**Microphone tracks are not stopped:**

- Symptoms: `stopRecording()` disconnects the source and closes the audio context but never calls `MediaStreamTrack.stop()` on the stream.
- Files: `script.js`
- Trigger: Stop a recording and inspect browser microphone indicators or start repeated sessions.
- Workaround: Reload the page or revoke permission manually.

**Stop can throw when recording setup is incomplete:**

- Symptoms: `stopRecording()` calls `mediaRecorder.stop()` unconditionally. A permission/device failure or a race during startup can leave it null or inactive.
- Files: `script.js`
- Trigger: Click stop quickly during permission prompt, or invoke stop after `getUserMedia`/`MediaRecorder` initialization fails.
- Workaround: Avoid double-clicking and wait for the listening state.

**AI response errors are treated as successful JSON:**

- Symptoms: The fetch path does not check `response.ok`; HTTP 401/429/500 responses can be rendered as the generic “Could not get feedback” text, and API error details are discarded.
- Files: `script.js`
- Trigger: Use an invalid key, exceed rate limits, or call the API without network access.
- Workaround: Read the browser console/network panel.

## Security Considerations

**Browser-exposed Anthropic credential:**

- Risk: The API key is sent directly from client JavaScript using `x-api-key`; any real key inserted in `script.js` is recoverable by every visitor and can be abused for arbitrary API spend.
- Files: `script.js`, `README.md`
- Current mitigation: The checked-in code contains the literal placeholder `YOUR_API_KEY_HERE`; the README acknowledges the demonstration-only approach.
- Recommendations: Proxy requests through a server-side endpoint, store the secret in server environment configuration, validate/rate-limit requests, and remove the dangerous direct-browser header from production code.

**Unbounded client-to-API prompt construction:**

- Risk: `pitchLog` is serialized into a prompt-derived summary without session duration/sample limits, allowing long sessions to create excessive CPU, memory, or prompt usage.
- Files: `script.js`
- Current mitigation: Only aggregate note counts and off-pitch moments are sent; raw audio is not sent.
- Recommendations: Cap session duration and sample count, coalesce moments, enforce server-side payload/token limits, and show a clear limit to the user.

**Sensitive microphone recordings are downloaded automatically:**

- Risk: `mediaRecorder.onstop` automatically creates and clicks a download link containing the user’s voice recording, which may be surprising on shared devices and leaves object URLs unmanaged.
- Files: `script.js`
- Current mitigation: Recording stays in browser memory and is not uploaded to Anthropic.
- Recommendations: Ask for explicit download consent, stop tracks, revoke old object URLs with `URL.revokeObjectURL`, and document retention/privacy behavior.

## Performance Bottlenecks

**Quadratic pitch detection on every animation frame:**

- Problem: `detectPitch()` performs nested scans up to half the analyser buffer for every `requestAnimationFrame` call.
- Files: `script.js`
- Cause: Autocorrelation is implemented as an O(N²) absolute-difference loop with a new `Float32Array` allocated each frame.
- Improvement path: Reuse buffers, throttle pitch analysis independently from drawing, constrain frequency lag ranges, and use the installed `pitchy`/FFT-backed approach or a worker for sustained sessions.

**Repeated full-history aggregation:**

- Problem: Every valid frame filters and reduces the entire `pitchLog` to update counts and average drift.
- Files: `script.js`
- Cause: Statistics are recalculated from an ever-growing array rather than maintained incrementally.
- Improvement path: Maintain sample count, in-tune count, and cumulative cents as samples arrive; cap or downsample history used for feedback.

**Canvas layout and rendering work per frame:**

- Problem: Canvas dimensions are read from layout and reset on every animation frame, clearing drawing state each time.
- Files: `script.js`
- Cause: `offsetWidth`, `offsetHeight`, and device-pixel-ratio scaling are handled inside `drawLoop()`.
- Improvement path: Resize only on a `ResizeObserver`/viewport change, configure the backing store once per size, and render at a controlled frame rate.

## Fragile Areas

**Audio lifecycle and asynchronous startup:**

- Files: `script.js`
- Why fragile: `startRecording()` awaits permission while button state remains startable, and shared globals (`isRecording`, `mediaRecorder`, `source`, `audioContext`) can be observed in partially initialized states.
- Safe modification: Add an explicit `idle → requesting → recording → stopping → idle/error` state machine, disable the button during transitions, and make cleanup idempotent.
- Test coverage: No automated tests; permission denial, device removal, unsupported APIs, and rapid clicks are untested.

**Pitch detection correctness:**

- Files: `script.js`
- Why fragile: Fixed RMS and correlation thresholds, a fixed 60–1200 Hz acceptance range, no smoothing/hysteresis, and no handling for noisy or polyphonic input can cause octave jumps and flickering notes.
- Safe modification: Keep `detectPitch()` pure, add representative sine/noise/voice fixtures, smooth confidence and note transitions, and calibrate thresholds against supported microphones.
- Test coverage: No unit or integration tests for `freqToNote()`, `detectPitch()`, cents classification, or statistics.

**Browser API compatibility:**

- Files: `script.js`, `README.md`
- Why fragile: `AudioContext`, `MediaRecorder`, `getUserMedia`, and `canvas.getContext()` are assumed available; MIME support is hard-coded to `audio/webm`.
- Safe modification: Feature-detect APIs and supported MIME types, provide actionable UI errors, and test Chrome/Firefox/Edge behavior.
- Test coverage: No browser matrix or smoke tests are configured.

## Scaling Limits

**Long-running session memory:**

- Current capacity: `pitchLog` receives one object for every valid animation frame and `recordedChunks` retains all media data for the session.
- Limit: Memory and per-frame aggregation grow without bound during a long recording; object URLs also remain alive across recordings.
- Scaling path: Set maximum session duration/size, stream or summarize data incrementally, clear chunks after blob creation, and revoke replaced URLs.

## Dependencies at Risk

**Unused `pitchy` dependency:**

- Risk: `package.json` installs `pitchy` and transitive `fft.js`, but `script.js` contains its own detector and imports no package (the app is loaded as a plain browser script).
- Impact: Dependency maintenance and supply-chain surface exist without providing functionality; future contributors may assume the library is active.
- Migration plan: Either bundle/import `pitchy` through an explicit build setup and use it, or remove the dependency and regenerate `package-lock.json`.

**No pinned runtime/toolchain:**

- Risk: There is no Node/browser version policy, bundler, lint configuration, or CI lock enforcement beyond the lockfile.
- Impact: Behavior and quality checks can vary by machine, and browser-only regressions are easy to ship.
- Migration plan: Document supported browsers, add a minimal build/lint/test command, and run it in CI.

## Missing Critical Features

**No server boundary for AI feedback:**

- Problem: Production-safe secret handling, rate limiting, authentication, and request observability are absent.
- Blocks: Safe multi-user deployment of the AI feature.

**No session persistence/history despite navigation UI:**

- Problem: The app has no storage model or history implementation; all pitch data disappears on reload.
- Blocks: Comparing sessions, resuming work, and supporting the visible “history” affordance.

## Test Coverage Gaps

**Core signal processing:**

- What's not tested: `freqToNote()`, `detectPitch()`, frequency boundaries, cents rounding, silence/noise rejection, and octave behavior.
- Files: `script.js`
- Risk: Incorrect notes and tuning scores can go unnoticed.
- Priority: High

**Recording lifecycle:**

- What's not tested: permission denial, unsupported MIME types, rapid start/stop, repeated sessions, cleanup, playback URL replacement, and download contents.
- Files: `script.js`
- Risk: Broken recordings, microphone leaks, and runtime exceptions in common user flows.
- Priority: High

**AI feedback failure paths:**

- What's not tested: non-2xx responses, malformed JSON, timeout/abort, rate limiting, empty content, and prompt size limits.
- Files: `script.js`
- Risk: Poor user feedback and uncontrolled external API usage.
- Priority: High

**UI/browser smoke coverage:**

- What's not tested: DOM initialization, responsive canvas sizing, visible state badges, keyboard access, and feature support across browsers.
- Files: `index.html`, `script.js`
- Risk: Regressions are only discovered manually after deployment.
- Priority: Medium

---

*Concerns audit: 2026-09-24*
