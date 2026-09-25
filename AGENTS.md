<!-- GSD:project-start source:PROJECT.md -->

## Project

**Pitch Proof**

Pitch Proof is a browser-based practice platform for individual singers at home. A singer uploads a PDF music score, reviews and corrects the recognized notation, selects one vocal part and a starting measure, then sings while the app follows the score and shows real-time pitch and timing feedback.

The existing application is an early prototype rather than a design constraint. Its useful browser-audio and pitch-analysis ideas may be retained, but the product architecture, interface, and implementation can be redesigned around score-guided practice.

**Core Value:** A singer can immediately see exactly which written notes they sang sharp or flat and where they were early or late.

### Constraints

- **Platform**: Browser-based experience — microphone capture, score display, and real-time feedback must work in a modern web browser
- **Input format**: PDF sheet music is the required score input — recognition must handle digital PDFs and define clear behavior for scans or unsupported notation
- **Evaluation scope**: One singer and one selected melodic part per session — polyphonic ensemble grading is excluded
- **Latency**: Pitch and timing classification must update quickly enough to feel real time — delayed feedback undermines the core value
- **Accuracy**: Pitch, score position, and timing results must be testable and confidence-aware — incorrect authoritative feedback would damage trust
- **Privacy**: Scores, practice history, and optional recordings are user-private — access control and clear retention behavior are required
- **Security**: Third-party service credentials must remain server-side — the existing client-side API-key pattern cannot be retained
- **Correction workflow**: Recognized notation must remain editable before practice — the app cannot assume automatic PDF recognition is perfect

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- JavaScript (browser, CommonJS package metadata) - all application behavior and audio/pitch processing in `script.js`
- HTML - page structure in `index.html`
- CSS - inline responsive UI styling in `index.html`
- Not detected

## Runtime

- Modern browser with Web Audio, MediaRecorder, microphone permission, Canvas, Fetch, and Blob/Object URL support
- npm
- Lockfile: present (`package-lock.json`)

## Frameworks

- No application framework - static HTML page and vanilla JavaScript (`index.html`, `script.js`)
- No test framework configured; `npm test` is an intentional placeholder that exits with an error (`package.json`)
- No bundler, transpiler, or dev server configured
- Development can use any static HTTP server; `README.md` documents `python -m http.server 8000`

## Key Dependencies

- `pitchy` `^4.1.0` - declared in `package.json` and installed in the lockfile, but no import or usage is present; pitch detection is implemented locally in `script.js` via `detectPitch`
- None detected

## Configuration

- No runtime configuration files or environment-variable loader detected
- Anthropic credentials are currently represented by the literal placeholder in `script.js`; `README.md` instructs manual replacement
- `package.json` contains package metadata and the placeholder test script
- `index.html` contains all page CSS and loads `script.js` directly

## Platform Requirements

- Serve over a local web server for reliable microphone permissions; browser must grant microphone access (`README.md`, `script.js`)
- Static web hosting capable of serving `index.html` and `script.js`
- HTTPS is required by browsers for microphone access outside localhost
- A secure server-side proxy is needed before exposing a real Anthropic API key; direct browser access is explicitly a demonstration setup (`README.md`)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- The application uses a small flat browser app with lowercase files: `script.js` and `index.html`.
- Use camelCase for functions, including `freqToNote`, `detectPitch`, `startRecording`, `stopRecording`, `drawLoop`, `updateCentsMeter`, and `getAIFeedback` in `script.js`.
- Event callbacks are commonly expressed as inline arrow functions, while reusable behavior is named with verb-oriented functions.
- Use camelCase for locals and DOM references (`audioContext`, `pitchLog`, `recordBtn`).
- Use `const` for stable references and `let` for mutable application state. Mutable state is module-scoped in `script.js` (`isRecording`, `mediaRecorder`, `lastRecordingURL`).
- Constants use uppercase snake case for fixed collections such as `NOTE_NAMES`; there is no broad convention for every numeric threshold.
- This is plain JavaScript with inferred object shapes. Pitch results are returned as object literals such as `{ note, cents, midi }`; preserve those shapes when extending the code.

## Code Style

- No formatter configuration is present. Match the existing two-space indentation, semicolons, single quotes, and trailing commas where already used.
- Keep browser behavior in `script.js` and markup/styles in `index.html`; CSS is currently embedded in the HTML.
- Existing sections use long divider comments to separate concerns (pitch helpers, state, DOM refs, recording, draw loop, and AI feedback).
- No ESLint, Biome, or other lint configuration is present. `npm test` is only a placeholder that exits with an error.
- Avoid introducing globals: existing browser globals are used directly (`document`, `navigator`, `AudioContext`, `MediaRecorder`, `fetch`).

## Import Organization

- None detected.

## Error Handling

- Wrap permission and network operations in `try/catch`, update the UI with a user-facing message, and log the original error with `console.error` (`startRecording` and `getAIFeedback` in `script.js`).
- Use sentinel values for signal-processing failure: `detectPitch` returns `-1` for quiet or unrecognized input and `freqToNote` returns `null` for non-positive frequencies.
- Guard empty user state before expensive work (`getAIFeedback` checks `pitchLog.length === 0`). Preserve UI cleanup and button re-enabling on asynchronous paths.
- Validate response content defensively with optional chaining and a fallback message (`data.content?.[0]?.text || ...`). HTTP status handling is not currently implemented; new API calls should check `response.ok` before consuming the body.

## Logging

- Log caught exceptions for debugging while showing concise status text in `statusEl` or `feedbackBox`.
- Do not log microphone data, API keys, or complete pitch sessions; keep diagnostic logging scoped to failures.

## Comments

- Comment algorithm intent and browser-specific behavior, as in the autocorrelation explanation above `detectPitch`, the MIDI conversion assumptions in `freqToNote`, and the media-permission/download notes in `startRecording`.
- Prefer comments that explain why a threshold or transformation exists; avoid narrating obvious DOM assignments.
- No JSDoc/TSDoc convention is present. If adding public/reusable helpers, document parameter units and sentinel return values rather than adding type annotations throughout the app.

## Function Design

- Keep pure calculations isolated (`freqToNote`, `detectPitch`, `updateCentsMeter`) and keep event orchestration in named functions. `drawLoop` and `getAIFeedback` are currently the largest mixed-responsibility functions.
- Pass required data explicitly (`buffer, sampleRate`, or `cents`) and read UI/application state from the module scope for event handlers.
- Preserve numeric units in names/comments: frequencies are Hz, deviations are cents, and pitch-log timestamps are seconds.
- Return `null`/`-1` for invalid or unavailable pitch data and object literals for successful conversions.
- UI event handlers generally return nothing; async handlers return promises and update the DOM as their observable result.

## Module Design

- There are no ES module exports. `script.js` is loaded as a classic browser script after the page markup, so DOM lookups occur at top level.
- Not applicable.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Page shell and presentation | Defines all markup, controls, cards, canvas, and inline responsive styling | `index.html` |
| Pitch conversion helpers | Converts frequency to MIDI/note/cents and estimates fundamental frequency with autocorrelation | `script.js` (`freqToNote`, `detectPitch`) |
| Session controller | Requests microphone access, starts/stops the audio pipeline and recording, resets UI | `script.js` (`startRecording`, `stopRecording`) |
| Live analysis loop | Samples analyser data on animation frames, detects pitch, updates metrics and waveform | `script.js` (`drawLoop`, `updateCentsMeter`) |
| Session state | Holds recorder, audio graph, animation, recording flag, pitch samples, and playback URL | Module-level variables in `script.js` |
| AI feedback adapter | Summarizes pitch samples and sends a coaching request to Anthropic | `script.js` (`getAIFeedback`) |
| Playback/download | Creates a WebM blob/object URL and plays the last recording | `script.js` (`mediaRecorder.onstop`, playback listener) |

## Pattern Overview

- `index.html` is the composition root and owns both markup and CSS; `script.js` is loaded at the end of the body.
- `script.js` combines pure-ish signal-processing helpers, mutable application state, event handlers, rendering, recording, and external API access in one module.
- Browser APIs provide audio capture, real-time analysis, recording, object URLs, and playback; there is no application server or persistence layer.

## Layers

- Purpose: Render controls and current session values.
- Location: `index.html` and DOM updates in `script.js`.
- Contains: Navigation, record/playback controls, statistics, live pitch card, waveform canvas, feedback box.
- Depends on: Browser DOM and CSS.
- Used by: User interactions and the analysis loop.
- Purpose: Acquire microphone audio and expose it to analysis and recording.
- Location: `script.js` (`startRecording`, `stopRecording`).
- Contains: `navigator.mediaDevices.getUserMedia`, `AudioContext`, `AnalyserNode`, `MediaRecorder`, and `Blob` handling.
- Depends on: Browser permissions and media APIs.
- Used by: Session controller and `drawLoop`.
- Purpose: Turn time-domain samples into notes and aggregate tuning metrics.
- Location: `script.js` (`detectPitch`, `freqToNote`, `drawLoop`, `pitchLog`).
- Contains: RMS gate, autocorrelation search, MIDI conversion, cents classification, sample statistics.
- Depends on: Audio analyser data and audio context sample rate.
- Used by: Live UI and AI summary generation.
- Purpose: Convert the current pitch log into a prompt and display Claude's response.
- Location: `script.js` (`getAIFeedback`).
- Contains: note frequency counts, average deviation, sharp/flat counts, grouped off-pitch moments, `fetch` request.
- Depends on: `pitchLog`, network access, and an Anthropic API key configured in source.
- Used by: Feedback button.

## Data Flow

### Primary Recording and Analysis Path

### AI Feedback Path

## Key Abstractions

- Purpose: A recorded observation used by metrics and coaching.
- Examples: Objects pushed to `pitchLog` in `script.js`.
- Pattern: Plain object with `note`, `cents`, `freq`, and string `time` fields.
- Purpose: Connect microphone stream to time-domain analyser data.
- Examples: `audioContext`, `analyser`, `source` in `script.js`.
- Pattern: Browser Web Audio node graph managed by session lifecycle functions.
- Purpose: Avoid repeated lookups and centralize UI targets.
- Examples: `recordBtn`, `noteNameEl`, `waveformCanvas`, `feedbackBox` in `script.js`.
- Pattern: `document.getElementById` constants initialized at module load.

## Entry Points

- Location: `index.html`
- Triggers: Browser navigation to the served document.
- Responsibilities: Build the UI, define CSS, and load `script.js`.
- Location: `script.js`
- Triggers: Script load followed by button events and animation frames.
- Responsibilities: Initialize DOM bindings and attach record/playback/feedback handlers.

## Architectural Constraints

- **Threading:** Main browser UI thread; `requestAnimationFrame` performs analysis and drawing synchronously.
- **Global state:** All runtime state is module-global in `script.js`; no store or dependency injection layer exists.
- **Circular imports:** Not applicable; there are no application modules or imports.
- **Browser security:** Microphone access requires a secure context or localhost and user permission; API calls currently use direct browser access.
- **Persistence:** Recordings exist only as in-memory chunks/object URLs and an immediate download; pitch data is not persisted.

## Anti-Patterns

### Monolithic client controller

### Client-side secret/API access

## Error Handling

- Microphone failures set `#status` to a permission-related message (`script.js`).
- Empty pitch logs short-circuit AI feedback with a message in `#feedbackBox`.
- API response failures are represented by fallback text; HTTP status is not explicitly validated before parsing JSON.

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `$gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `$gsd-debug` for investigation and bug fixing
- `$gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `$gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
