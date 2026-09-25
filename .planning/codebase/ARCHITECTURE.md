---
last_mapped_commit: 4704def55b2998953def280accaf6b2fa55b0fcb
last_mapped_at: 2026-09-24
---
<!-- refreshed: 2026-09-24 -->

# Architecture

**Analysis Date:** 2026-09-24

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                  Browser-rendered single page                 │
│                      `index.html`                            │
│  HTML structure + inline CSS + DOM event targets              │
└──────────────────────────┬──────────────────────────────────┘
                           │ loads
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application controller                       │
│                      `script.js`                             │
│ DOM state • recording • animation loop • pitch log            │
└───────────────┬───────────────────┬─────────────────────────┘
                │                   │
                ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│ Browser media/audio APIs  │  │ Anthropic Messages API         │
│ getUserMedia, Web Audio,  │  │ fetch from `script.js`         │
│ MediaRecorder, Audio      │  │ direct browser request         │
└──────────────────────────┘  └──────────────────────────────┘
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

**Overall:** Browser-only monolithic single-page application with imperative DOM control.

**Key Characteristics:**

- `index.html` is the composition root and owns both markup and CSS; `script.js` is loaded at the end of the body.
- `script.js` combines pure-ish signal-processing helpers, mutable application state, event handlers, rendering, recording, and external API access in one module.
- Browser APIs provide audio capture, real-time analysis, recording, object URLs, and playback; there is no application server or persistence layer.

## Layers

**Presentation:**

- Purpose: Render controls and current session values.
- Location: `index.html` and DOM updates in `script.js`.
- Contains: Navigation, record/playback controls, statistics, live pitch card, waveform canvas, feedback box.
- Depends on: Browser DOM and CSS.
- Used by: User interactions and the analysis loop.

**Audio and recording:**

- Purpose: Acquire microphone audio and expose it to analysis and recording.
- Location: `script.js` (`startRecording`, `stopRecording`).
- Contains: `navigator.mediaDevices.getUserMedia`, `AudioContext`, `AnalyserNode`, `MediaRecorder`, and `Blob` handling.
- Depends on: Browser permissions and media APIs.
- Used by: Session controller and `drawLoop`.

**Analysis and session metrics:**

- Purpose: Turn time-domain samples into notes and aggregate tuning metrics.
- Location: `script.js` (`detectPitch`, `freqToNote`, `drawLoop`, `pitchLog`).
- Contains: RMS gate, autocorrelation search, MIDI conversion, cents classification, sample statistics.
- Depends on: Audio analyser data and audio context sample rate.
- Used by: Live UI and AI summary generation.

**External feedback:**

- Purpose: Convert the current pitch log into a prompt and display Claude's response.
- Location: `script.js` (`getAIFeedback`).
- Contains: note frequency counts, average deviation, sharp/flat counts, grouped off-pitch moments, `fetch` request.
- Depends on: `pitchLog`, network access, and an Anthropic API key configured in source.
- Used by: Feedback button.

## Data Flow

### Primary Recording and Analysis Path

1. The user clicks `#recordBtn`, invoking the listener in `script.js`.
2. `startRecording` requests microphone access, creates an `AudioContext`/`AnalyserNode`, and connects a `MediaStreamAudioSourceNode`.
3. `requestAnimationFrame` repeatedly invokes `drawLoop`; `getFloatTimeDomainData` supplies samples to `detectPitch` (`script.js`).
4. A valid frequency is converted by `freqToNote`; the note, cents, rounded frequency, and elapsed time are appended to `pitchLog`.
5. `drawLoop` updates note/frequency text, cents meter, session statistics, and the `#waveform` canvas.
6. `MediaRecorder` stores chunks; stopping closes the audio graph, resets the live display, creates a WebM blob/object URL, and exposes playback/download.

### AI Feedback Path

1. The user clicks `#feedbackBtn`, invoking `getAIFeedback`.
2. The function summarizes `pitchLog` into common notes, average cents, sharp/flat/in-tune counts, and contiguous off-pitch moments.
3. A POST request is sent directly to `https://api.anthropic.com/v1/messages`.
4. The first returned content text is rendered into `#feedbackBox`; errors render a user-facing fallback.

**State Management:** Module-level mutable variables in `script.js` are the single source of truth (`isRecording`, `pitchLog`, audio nodes, recorder, animation frame, and `lastRecordingURL`). UI state is updated imperatively through cached DOM references.

## Key Abstractions

**Pitch sample:**

- Purpose: A recorded observation used by metrics and coaching.
- Examples: Objects pushed to `pitchLog` in `script.js`.
- Pattern: Plain object with `note`, `cents`, `freq`, and string `time` fields.

**Audio analysis pipeline:**

- Purpose: Connect microphone stream to time-domain analyser data.
- Examples: `audioContext`, `analyser`, `source` in `script.js`.
- Pattern: Browser Web Audio node graph managed by session lifecycle functions.

**DOM reference cache:**

- Purpose: Avoid repeated lookups and centralize UI targets.
- Examples: `recordBtn`, `noteNameEl`, `waveformCanvas`, `feedbackBox` in `script.js`.
- Pattern: `document.getElementById` constants initialized at module load.

## Entry Points

**Static page:**

- Location: `index.html`
- Triggers: Browser navigation to the served document.
- Responsibilities: Build the UI, define CSS, and load `script.js`.

**Client script:**

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

**What happens:** Signal processing, UI rendering, recording lifecycle, and API integration all live in `script.js`.
**Why it's wrong:** Changes to one concern can affect unrelated runtime state and are difficult to unit test independently.
**Do this instead:** Preserve the existing DOM contract while extracting pure pitch/summary helpers and separate browser adapters into modules under a future `src/` or similarly explicit directory.

### Client-side secret/API access

**What happens:** `getAIFeedback` sends an `x-api-key` header directly from the browser in `script.js`.
**Why it's wrong:** Browser-delivered credentials cannot be kept secret and are vulnerable to misuse.
**Do this instead:** Proxy Anthropic calls through a server endpoint and keep credentials in server-side environment configuration, as noted in `README.md`.

## Error Handling

**Strategy:** Local `try/catch` around microphone setup and API fetch; user-facing status text is updated while details are logged with `console.error`.

**Patterns:**

- Microphone failures set `#status` to a permission-related message (`script.js`).
- Empty pitch logs short-circuit AI feedback with a message in `#feedbackBox`.
- API response failures are represented by fallback text; HTTP status is not explicitly validated before parsing JSON.

## Cross-Cutting Concerns

**Logging:** `console.error` is used for microphone and API exceptions in `script.js`; there is no structured logger.
**Validation:** Pitch validity is constrained by RMS threshold and a 60–1200 Hz range in `drawLoop`; API input is derived from the local pitch log.
**Authentication:** Anthropic authentication is a client-side API key header; there is no user identity or application authentication.

---

*Architecture analysis: 2026-09-24*
