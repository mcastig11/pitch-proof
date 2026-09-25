# Phase 1: Verified Example Practice - Pattern Map

**Mapped:** 2026-09-25  
**Files analyzed:** 8 proposed/modified implementation and validation files  
**Analogs found:** 3 / 8 (existing browser files; no analog for fixture/timeline/tests)

## Scope and Existing Shape

Phase 1 is a static browser application with one verified score. Current composition root is `index.html`; behavior is in classic-script `script.js`; package metadata is in `package.json`. There is no server boundary, score data model, notation renderer, score follower, metronome, module system, or established tests. The RESEARCH.md file proposes `practice-fixture.js`, `practice-timeline.js`, `practice-audio.js`, and `tests/`; these are recommendations, not existing paths. The approved UI-SPEC controls structure, wording, states, accessibility, and provisional-only feedback.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `index.html` | component / composition root | event-driven, request-response | `index.html` | role-match; replace prototype shell while keeping classic script entry |
| `script.js` | controller / UI integration | event-driven, request-response, streaming audio | `script.js` | partial; microphone and DOM patterns only |
| `practice-fixture.js` | model / config | transform | None | no analog; fixed score schema is new |
| `practice-timeline.js` | utility | transform | `freqToNote()` in `script.js` | partial; pure deterministic mapping is a new domain |
| `practice-audio.js` | service / controller | streaming audio, event-driven | `startRecording()` / `stopRecording()` in `script.js` | role-match for browser APIs; lifecycle must be substantially safer |
| `tests/fixture.test.cjs` | test | transform | None | no existing test convention |
| `tests/timeline.test.cjs` | test | transform | None | no existing test convention |
| `tests/audio-session.test.cjs` and `tests/replay.test.cjs` | test | event-driven, streaming/replay | None | no existing test convention |
| `package.json` | config | build/validation | `package.json` | role-match; add Node test command if adopting research plan |

Names and boundaries for the proposed JS files and tests are from `01-RESEARCH.md` and remain planning proposals. If planning chooses a different split, preserve the same responsibilities and state boundaries.

## Pattern Assignments

### `index.html` (composition root, event-driven)

**Analog:** `index.html` (tracked)

The page embeds CSS in `<style>`, keeps markup in the body, and loads `script.js` at the end of the body (line 433). `script.js` immediately resolves controls by stable IDs (e.g. lines 81-91), so markup must exist before script execution. For Phase 1, replace the legacy pitch-coach layout and its nonfunctional history/settings controls; implement the UI-SPEC's native labeled selectors/buttons, score container with accessible text summary, persistent text position, and polite live status. Keep score position available independently of SVG. Preserve vanilla HTML/CSS and classic script loading unless planning explicitly chooses modules.

**Concrete DOM binding pattern** (`script.js`, lines 81-91):

```js
const recordBtn = document.getElementById('recordBtn');
const statusEl = document.getElementById('status');
const noteNameEl = document.getElementById('noteName');
```

The existing IDs are examples only; new IDs should reflect practice semantics. Current shell has no useful reusable score markup.

### `script.js` (browser controller / integration)

**Analog:** `script.js` (tracked)

Use its named functions and DOM update style as local conventions, but keep the new controller focused on wiring fixture, timeline, audio session, and rendered UI. Existing `recordBtn` handler delegates to `startRecording()`/`stopRecording()` (`script.js:95-102`); async permission work uses `try/catch` and user-visible status (`script.js:104-149`). `drawLoop()` reads analyser samples, calls pure helpers, and schedules its next frame (`script.js:176-239`). `freqToNote()` and `detectPitch(buffer, sampleRate)` accept explicit numeric inputs and return a value/sentinel (`script.js:17-68`).

Useful conventions to retain: camelCase functions/locals, `const` for stable DOM/API references, `let` for mutable state, two-space indentation, semicolons, concise status text, and pure calculations isolated from handlers. Do not carry forward monolithic global state or per-frame accumulation/statistics. Keep pitch detection separate from score-position confidence; phase feedback must use the UI-SPEC's “observations · not graded” language and never classify a note as wrong/sharp/flat or timing as early/late.

### `practice-fixture.js` (score model/config)

**Analog:** None.

Create a bounded, static, validated fixture containing the chosen verified score's part, tempo, meter, pickup semantics, measure numbering, note/rest events, and display positions, all sourced from the same data. Keep valid start measures derivable from this fixture. No PDF/OMR path or generalized engraving engine belongs in this phase. Research explicitly says score content and pause/divergence behavior remain planning decisions; the mapper does not select them.

### `practice-timeline.js` (pure timeline utility)

**Analog:** `freqToNote()` in `script.js:17-29` (partial role/data-shape analog).

The closest existing pattern is a helper that takes explicit numeric input and returns a small value object, with invalid input handled explicitly. Implement deterministic mapping from audio-clock timestamps and selected fixture measure to measure/beat; treat pickup beats using explicit fixture metadata. Position trust must remain separate from detected-pitch presence. RESEARCH Pattern 2 and UI-SPEC interaction states are the domain contracts; no existing code demonstrates score-following.

### `practice-audio.js` (audio service/session lifecycle)

**Analog:** `startRecording()` and `stopRecording()` in `script.js:104-174` (tracked; partial).

The existing setup (`script.js:111-119`) demonstrates `navigator.mediaDevices.getUserMedia({ audio: true })`, `AudioContext`, `AnalyserNode`, and connecting a media stream source. It catches microphone startup errors and sets user-facing text (`script.js:145-148`). Reuse browser API knowledge, not its lifecycle: startup awaits permission while controls remain active; tracks are not stopped; `stopRecording()` unconditionally stops a recorder, so partial startup can throw (CONCERNS.md). Follow RESEARCH Pattern 3: explicit states, stale-request guard, repeatable teardown, stop every `MediaStreamTrack`, disconnect nodes, cancel timers/frames, stop metronome sources, and close context.

For count-in clicks, use a Web Audio look-ahead scheduler keyed to `AudioContext.currentTime`, with beat timestamps consumed by visual rendering. Accent beat one by tone at approximately equal gain; stop clicks at count-in end, with no extra cue. Use this both for initial start and recovery. `requestAnimationFrame` renders current audio-clock position only; it is not the metronome clock.

### `tests/*.test.cjs` (tests)

**Analog:** None. There are no current tests, mocks, or test framework. `.planning/codebase/TESTING.md` records this explicitly.

Research recommends Node's built-in `node:test`, deterministic fixture/timeline/replay tests, and mocked audio lifecycle tests, with `node --test tests/*.test.cjs`. The current `npm test` intentionally exits with “no test specified” (`package.json:5-7`); if adopted, update it to invoke Node's runner. Test pure fixture validation and timeline/pickup mapping directly. Inject/fake browser media APIs for permission races and teardown. Keep real-browser/device checks for pickup, silence/rest, wrong pitch, octave ambiguity, tracking loss/recovery, keyboard use, responsive widths, and zoom; synthetic tests cannot establish microphone behavior or latency on real hardware.

### `package.json` (config)

**Analog:** `package.json` (tracked).

It is CommonJS metadata and has a placeholder failing test script. The app itself is not bundled and `script.js` is a classic browser script. Research recommends no added package; `pitchy` is declared but unused and must not be assumed available to a browser script. Align any new module strategy and test execution with whichever plan is selected; avoid adding an unneeded score or audio dependency.

## Integration Boundaries

- `index.html` remains the page composition root and owns embedded styles; it loads the client behavior after markup.
- The fixture is the single source for displayed notation, part, tempo/meter, valid measures, pickup, and timeline events.
- The controller connects native UI state to pure fixture/timeline behavior and the isolated audio session.
- Audio capture and click scheduling share `AudioContext` time where useful, but visual position reads scheduled beat timestamps. Microphone input is never routed back to speakers.
- Tracking confidence, pitch detection, and expected rests are separate concepts. On position uncertainty, freeze the last confirmed marker, remove current-position claims, label the passage ungraded, and allow selected-measure recovery without page reload.
- No server, account, upload, history, persisted result, recording download, or AI integration is part of Phase 1.

## Shared Patterns and Anti-Patterns

### Carry forward

- Vanilla DOM and browser APIs, native controls, named functions, small pure helpers, explicit units in variable names/comments, and concise user-visible errors with diagnostic `console.error` only for failures.
- Use `response.ok` for any future HTTP request; Phase 1 has no network path.
- Feature/state text communicates meaning without color or sound alone; live regions announce transitions, not every animation frame, pitch sample, or beat.

### Avoid

- Existing monolithic controller/global state; split fixture, deterministic timeline, audio lifecycle, and UI orchestration enough to test boundaries.
- `requestAnimationFrame` or `setInterval` as the audible beat clock.
- Assuming permission is immediate, cleanup automatic, or repeated stop safe; current code violates these assumptions.
- Treating silence, a rest, wrong pitch, octave ambiguity, or uncertain score position as interchangeable.
- Authoritative grade labels, accuracy totals, saved results, or attaching provisional observations to notes while position confidence is lost.
- Porting the prototype's cents meter, waveform/recording/AI flows, or browser-exposed API credential pattern into the new practice shell.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `practice-fixture.js` | model/config | transform | No score fixture/model exists. |
| `practice-timeline.js` | utility | transform | No timeline/score-following behavior exists. |
| `tests/*.test.cjs` | test | varies | No test runner, suite, mocks, or fixtures exist. |

## Metadata

**Analog search scope:** root `index.html`, `script.js`, `package.json`; `.planning/codebase/TESTING.md`, `CONCERNS.md`; Phase 1 `01-CONTEXT.md`, `01-RESEARCH.md`, `01-UI-SPEC.md`.  
**Tracked-source check:** all named existing source analogs (`index.html`, `script.js`, `package.json`) are returned by `git ls-files`.  
**Pattern extraction date:** 2026-09-25
