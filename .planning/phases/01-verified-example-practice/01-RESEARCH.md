<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** The audible click plays during the count-in only, then stops for the singing portion. Apply the same count-in behavior when recovering position, consistent with the approved UI contract.
- **D-02:** Accent the first count-in beat with a different tone at about the same volume as the other beats.
- **D-03:** Do not add a separate "sing now" cue. Move into the practice state on the next beat after the count-in.
- Keep the visible beat number and score-position indication defined by the approved UI contract; the user decision concerns audible clicks and the transition cue.

### the agent's Discretion
- The user did not delegate choices explicitly. Details not discussed remain open for research/planning recommendations rather than user-approved defaults.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within Phase 1 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PRAC-01 | A singer can choose a starting measure and review the selected part and tempo before singing. `[VERIFIED:.planning/REQUIREMENTS.md:23; quote: "PRAC-01"]` | Validate the fixture and derive the native measure selector and review metadata from it; reject invalid starts rather than inventing values. |
| PRAC-02 | A metronome and count-in begin from the selected measure. `[VERIFIED:.planning/REQUIREMENTS.md:24; quote: "PRAC-02"]` | Schedule count-in clicks and fixture beat times on the Web Audio clock, with pickup-aware beat mapping. |
| PRAC-03 | A singer can check microphone readiness and start, stop, or retry a session. `[VERIFIED:.planning/REQUIREMENTS.md:25; quote: "PRAC-03"]` | Build a single explicit async lifecycle for permission, input readiness, attempt, stop, error, and retry; stop tracks and close audio resources. |
| PRAC-04 | The score shows the current position and provides a way to recover if tracking is lost. `[VERIFIED:.planning/REQUIREMENTS.md:26; quote: "PRAC-04"]` | Keep score-position confidence separate from pitch detection; freeze the last confirmed position and offer measure selection plus count-in recovery. |
| ACCESS-01 | Primary controls and feedback work with a keyboard and do not rely on color alone. `[VERIFIED:.planning/REQUIREMENTS.md:45; quote: "ACCESS-01"]` | Use native buttons/selects, persistent text status, visible focus, and a polite live region for state transitions. |
</phase_requirements>

# Phase 1: Verified Example Practice - Research

**Researched:** 2026-09-25  
**Domain:** Browser audio capture, score-timeline practice, and accessible live feedback  
**Confidence:** MEDIUM

## Summary

Build the practice loop around one bundled, manually verified score fixture and a deterministic event timeline. Keep score metadata and the visual notation tied to the same fixture so the selected part, tempo, meter, measures, pickup, rests, and position labels cannot drift apart. For this bounded score, author a small SVG notation view rather than implementing general music engraving or importing an unverified package. These are planning recommendations; the example score and singer-pause/divergence behavior were not decided in CONTEXT.md and need explicit decisions during planning.

Use Web Audio scheduled time as the clock for count-in clicks and beat boundaries. Schedule the accented first click with the same nominal gain as other clicks but a distinct pitch/timbre; end the click sequence at count-in completion and enter Following on the next beat without another cue. Drive visual position from those scheduled timestamps, not from timer callback arrival. Treat position confidence separately from whether a sung pitch is detected: uncertainty must remove the current-position claim and detach observations from score notes. Phase 1 observations remain descriptive and provisional; measured per-note grades are Phase 4 work.

The browser microphone path needs a dedicated state machine, stale-request protection, guaranteed stream-track stop, audio-context close, cancellation of beat/UI loops, and retry-safe cleanup. Current concerns explicitly identify microphone tracks not being stopped and incomplete/competing async startup states [VERIFIED:.planning/codebase/CONCERNS.md:55-67,124-134]. The exit gate still requires real-browser/device replay of pickup, silence, wrong-pitch, and octave-ambiguity timelines; synthetic fixture replay alone does not establish microphone behavior.

**Primary recommendation:** Keep Phase 1 dependency-free: a validated static score/timeline fixture, a small fixture-specific SVG renderer, a Web Audio scheduler, an isolated microphone/session controller, and deterministic replayable analysis inputs.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Example score metadata and part selection | Browser / Client | — | One static fixture supplies all valid choices; no API or persistence exists in this phase. |
| Notation and current measure/beat display | Browser / Client | — | The DOM/SVG score and text position are rendered in the page. |
| Count-in, click, and beat clock | Browser / Client | — | Web Audio owns sound scheduling; visual state consumes scheduled audio-clock timestamps. |
| Microphone readiness and pitch/onset observations | Browser / Client | — | `getUserMedia`, Web Audio analysis, and provisional status remain local to the browser. |
| Keyboard and assistive-technology status | Browser / Client | — | Native controls and accessible text/live regions are part of the page UI. |

## Standard Stack

### Core

| Library / API | Version | Purpose | Why Standard |
|---------------|---------|---------|--------------|
| Vanilla JavaScript, HTML, CSS | Existing project; no framework | Practice controller, native controls, and layout | The repository is a static page with one browser script and inline CSS [VERIFIED:.planning/codebase/STACK.md:21-31]. |
| Web Audio API (`AudioContext`, oscillator, analyser) | Browser-provided | Click scheduling, microphone analysis, and shared audio clock | `AudioScheduledSourceNode.start(when)` schedules playback in the context time coordinate system [CITED: https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start]. |
| `getUserMedia` / `MediaStreamTrack` | Browser-provided | Request microphone input and release it on stop/retry | Permission and availability errors are distinct and secure-context access is required [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia]. |
| SVG + DOM text | Browser-provided | Small fixed notation rendering with accessible parallel position text | The approved UI contract requires score graphics plus a separate accessible summary and text position [VERIFIED:.planning/phases/01-verified-example-practice/01-UI-SPEC.md:64-76]. |

### Supporting

| API / Tool | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| Node.js built-in `node:test` | Present local Node is 24.19.0; project runtime is not pinned | Unit/replay tests for pure timeline and fixture validation | Use without a new test dependency; add a project test command because the current script is a failing placeholder [VERIFIED:package.json:1-19]. |
| `requestAnimationFrame` | Browser-provided | Paint score marker and visual beat state | Use only to render from current audio time; it is one-shot and generally pauses in hidden/background tabs [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame]. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Web Audio clock scheduling | `setInterval` or `requestAnimationFrame` as the click clock | Avoid: callbacks are main-thread scheduled and can be delayed/throttled; MDN's Web Audio scheduling guidance schedules ahead against `AudioContext.currentTime` [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques]. |
| Fixture-specific SVG | General-purpose engraving/score package | A library is warranted when multiple scores or editing are in scope; this phase only needs one verified example, and adding a package introduces supply-chain and integration work without solving PDF/OMR scope. This is a bounded-scope recommendation [ASSUMED]. |
| Deterministic timeline replay | Only live microphone/manual QA | Replay makes pickup, silence, wrong-pitch, and octave-ambiguity cases repeatable; hardware/browser checks remain necessary for lifecycle and latency [VERIFIED:.planning/ROADMAP.md:30]. |

**Installation:** None recommended; do not add external packages for this phase.

## Package Legitimacy Audit

Not applicable: the recommended Phase 1 stack adds no external packages.

## Architecture Patterns

### System Architecture Diagram

```text
Bundled verified score fixture
        │ validate required metadata and ordered measures
        ├───────────────> DOM controls + SVG notation + text score summary
        │
Singer selects part/measure and checks microphone
        ├───────────────> getUserMedia ─> Web Audio analyser ─> provisional
        │                                              pitch/onset observations
        └───────────────> Start / recovery
                            │
                            ├─> Web Audio clock scheduler ─> count-in clicks
                            │                               (accent first beat)
                            └─> beat timestamps ─> timeline position renderer
                                                   │
                       uncertainty detected ───────┴─> ungraded status
                                                       └─> select measure + count-in
```

### Recommended Project Structure

Keep the current simple browser composition, but extract new logic into focused files if doing so makes the state boundaries testable. Fit names to repository convention and avoid introducing a framework:

```text
index.html             # native controls, accessible status, score container
script.js              # page composition and event wiring
practice-fixture.js    # one validated score/part/measure/timeline fixture
practice-timeline.js   # pure mapping from audio time to measure/beat
practice-audio.js      # audio scheduling, microphone, and idempotent teardown
tests/                 # fixture/timeline tests and annotated replay cases
```

This file layout is an implementation proposal, not an existing project path [ASSUMED].

### Pattern 1: Audio-clock look-ahead metronome

**What:** Maintain the next beat's scheduled `AudioContext.currentTime`; periodically schedule short oscillator clicks slightly ahead, enqueue beat timestamps for UI rendering, and stop the scheduler after the last count-in click. MDN documents the look-ahead scheduler pattern and precise source start time [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques].

**When to use:** Both initial and recovery count-ins. For the singing state, keep visual score timing from the fixture clock while audible clicks stop per D-01.

**Example:**

```js
function scheduleBeat(audioContext, when, accented) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = accented ? accentHz : clickHz;
  gain.gain.value = clickGain;
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(when);
  oscillator.stop(when + clickDurationSeconds);
}
```

`accentHz`, `clickHz`, `clickGain`, and `clickDurationSeconds` are calibration choices, not locked project values [ASSUMED]. Keep accent volume approximately equal; distinguish it by tone as required by D-02.

### Pattern 2: Fixture timeline and confidence separation

**What:** Represent the selected part as ordered measures with beat-relative note/rest events and a separate map of each measure's display position. Use the fixture's explicit pickup semantics when translating measure selection to beat time. Keep three distinct concepts: (1) scheduled score position, (2) whether the audio detector hears/classifies a pitch, and (3) whether the current score position is trusted. Never infer a wrong written note from silence or octave ambiguity.

**When to use:** Initial practice and recovery from a chosen measure. Position should freeze at the last confirmed marker on uncertainty; stale observations are cleared at recovery count-in as the UI contract states [VERIFIED:.planning/phases/01-verified-example-practice/01-UI-SPEC.md:83-95].

**Planning checkpoint:** CONTEXT leaves example-score content and pause/divergence behavior undecided. Pick a score fixture with a real pickup, rests/silence, a manageable measure count, and clearly verified tempo/meter. Decide how a pause/divergence can make position uncertain and what signal re-establishes confidence; do not let the pitch classifier's `no pitch` result alone imply lost score position [ASSUMED].

### Pattern 3: Explicit audio-session state machine

**What:** Model permission pending, microphone ready, count-in, following, uncertain, stopping, stopped, and recoverable error explicitly. Disable duplicate actions during async permission startup, handle a permission prompt that remains pending, and use a session token/generation check so a late permission resolution cannot revive a stopped/retried attempt. Teardown must be safe to call repeatedly: cancel timers/animation, stop every input track, disconnect nodes, stop audio sources, and close the context.

**When to use:** Microphone check, start, stop, device loss, error, retry, and recovery. `getUserMedia()` may reject with permission/device/security failures and may remain pending if the user ignores the prompt [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia]. Tracks need explicit stopping [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop].

### Anti-Patterns to Avoid

- **Use animation callbacks as the metronome:** background tabs pause `requestAnimationFrame`, which can stall UI callbacks while audio continues [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame].
- **Conflate pitch confidence and position confidence:** a quiet input, rest, wrong pitch, or octave ambiguity is not proof that the timeline position is wrong [VERIFIED:.planning/ROADMAP.md:30].
- **Claim grade semantics:** Phase 1 displays observations only; avoid sharp/flat, early/late, accuracy totals, saved results, or a wrong-note badge [VERIFIED:.planning/phases/01-verified-example-practice/01-UI-SPEC.md:56-76].
- **Assume permission resolves quickly or cleanup happens automatically:** the existing implementation permits partial state and leaves tracks live; retry/stop must cover delayed permission, denial, device loss, rapid actions, and repeated attempts [VERIFIED:.planning/codebase/CONCERNS.md:55-67,124-134].
- **Implement a reusable notation engine or PDF path:** those are later-phase concerns; this phase validates only the bundled example workflow [VERIFIED:.planning/ROADMAP.md:30].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accurate metronome scheduling | Main-thread interval loop used as audio clock | Web Audio source scheduling against `AudioContext.currentTime` | Scheduled audio time is the clock the API exposes for precise playback [CITED: https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start]. |
| Generic score recognition/engraving | PDF parser, OMR, or general notation editor | One manually verified fixture and a fixture-specific notation view | PDF import and correction belong to Phase 3; avoid expanding the slice [VERIFIED:.planning/ROADMAP.md:30,57]. |
| Screen-reader state notification | Frequent spoken pitch/beat announcements | One polite status region for meaningful state transitions; keep beat count visible in text | WAI guidance describes live regions for status changes without moving focus [CITED: https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA25]. |

**Key insight:** The trust risk in this phase is falsely presenting a plausible marker as reliable. Keep the timeline and input detector independently inspectable and let the UI abstain whenever position cannot be defended.

## Common Pitfalls

### Pitfall 1: Click drift or late clicks

**What goes wrong:** Count-in beats vary with rendering load, and visual state disagrees with audible timing.  
**Why it happens:** Each click is triggered when a main-thread callback finally runs.  
**How to avoid:** Schedule oscillator events ahead on the audio clock; use audio timestamps to update the UI; stop after count-in and test repeated/recovery count-ins.  
**Warning signs:** Beat spacing changes under load, resume begins with stale beat index, or sound continues during singing. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques]

### Pitfall 2: Pickup mislabeled as a full bar

**What goes wrong:** The selected score marker/count-in begins at the wrong beat or a fabricated measure label appears.  
**Why it happens:** Timeline math assumes every displayed measure has a full meter.  
**How to avoid:** Store pickup duration/beat offset explicitly in the fixture and add a replay case selecting the pickup and the measure after it.  
**Warning signs:** Count-in meter does not match visible pickup labeling or subsequent barlines drift. [VERIFIED:.planning/phases/01-verified-example-practice/01-UI-SPEC.md:50-52,83-85]

### Pitfall 3: Microphone never releases or retry races

**What goes wrong:** Browser still shows microphone in use, repeated starts create duplicate loops, or a delayed permission grant restarts an ended attempt.  
**Why it happens:** Closing the audio context/source does not replace explicit track stop and race-safe controller state.  
**How to avoid:** Store the stream; stop all tracks; make teardown idempotent; invalidate pending starts on Stop/retry; gate controls during transitions.  
**Warning signs:** mic indicator stays on after stop, repeated-session failures, null/inactive recorder-style assumptions, or duplicate timers. [VERIFIED:.planning/codebase/CONCERNS.md:55-67,124-134] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop]

### Pitfall 4: No pitch interpreted as silence/rest/wrong note interchangeably

**What goes wrong:** The UI invents a missed/wrong note in a rest, loses score position when the singer is merely quiet, or attaches a pitch to the wrong note.  
**Why it happens:** Pitch detection, onset detection, and score-position confidence are collapsed into one boolean.  
**How to avoid:** Keep separate observation fields/states; show expected-rest when the fixture says rest; show “listening” when there is no pitch; show “position uncertain” only when the follower's own evidence is insufficient; do not grade any of these.  
**Warning signs:** Wrong-pitch indicators during annotated silence or stale observations after recovery. [VERIFIED:.planning/phases/01-verified-example-practice/01-UI-SPEC.md:70-95]

### Pitfall 5: “Live” status overwhelms keyboard and assistive technology users

**What goes wrong:** Screen reader speech queues every animation frame, note estimate, or beat.  
**Why it happens:** The entire rapidly changing visual panel is made a live region.  
**How to avoid:** Announce only microphone ready/failure, count-in start, following start/stop, uncertainty, and recovery completion; do not move focus; retain visible changing beat number and non-color text.  
**Warning signs:** Continuous speech during practice or keyboard focus moved to the score. [VERIFIED:.planning/phases/01-verified-example-practice/01-UI-SPEC.md:100-108] [CITED: https://www.w3.org/WAI/WCAG21/Understanding/status-messages]

## Code Examples

### Schedule clicks against the audio clock

```js
function scheduleClick(audioContext, time, frequency, gainValue, duration) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + duration);
}
```

Call with the next scheduled audio-clock time rather than `Date.now()` or an animation callback's arrival time. Web Audio source start times use the audio context's time coordinate [CITED: https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start].

### Request and release microphone input

```js
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// Connect the stream to an analyser for local input-level/pitch observation.
// On every stop, error, retry, or abandoned pending session:
stream.getTracks().forEach((track) => track.stop());
```

Production code must wrap the request in error handling and retain the stream for cleanup. `getUserMedia` requires permission and a secure context; browsers treat `localhost` as secure for local development [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia].

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fire each metronome click from `setInterval` / repaint loop | Schedule Web Audio sources against `AudioContext.currentTime`, with callbacks only maintaining a look-ahead queue | Current Web Audio API guidance; MDN page last modified 2025-11-30 for `getUserMedia` and scheduling guide current at research time | Beat audio remains scheduled independently from repaint cadence [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques]. |
| Treat analyzer output as a score grade | Show provisional pitch/onset observation independently from score-position confidence | Phase-specific product decision, not a browser API change | Avoid implying the unmeasured detector is authoritative [VERIFIED:.planning/ROADMAP.md:30,71]. |

**Deprecated/outdated:** None identified for the APIs recommended here; this phase adds no third-party packages.

## Project Constraints (from AGENTS.md)

- Keep the product browser-based and scoped to one singer and one selected melodic part; this phase uses the verified fixture and does not add arbitrary PDF support [VERIFIED:AGENTS.md:12-19; quote: “**Evaluation scope**: One singer and one selected melodic part per session”].
- Keep microphone/audio and rendering behavior in the browser. Use the existing vanilla HTML/CSS/JavaScript conventions unless a small extraction is needed to test the state boundary [VERIFIED:AGENTS.md:73-90; quote: “Keep browser behavior in `script.js` and markup/styles in `index.html`”].
- Use camelCase functions/locals, `const` for stable references, `let` for mutable state, and match two-space indentation, semicolons, and single quotes [VERIFIED:AGENTS.md:67-90; quote: “Use camelCase for functions”].
- Keep pure calculations isolated from event orchestration; preserve units in names and comments [VERIFIED:AGENTS.md:101-119; quote: “Keep pure calculations isolated (`freqToNote`, `detectPitch`, `updateCentsMeter`)”].
- Do not log microphone data, API keys, or complete sessions [VERIFIED:AGENTS.md:93-99; quote: “Do not log microphone data, API keys, or complete pitch sessions”].
- Before code edits, enter through the GSD workflow (`$gsd-quick` for small fixes, `$gsd-execute-phase` for planned work); direct edits outside a GSD workflow require explicit bypass [VERIFIED:AGENTS.md:241-252; quote: “Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.”].
- No UI framework, score package, test framework, bundler, or dev server is currently configured; the existing `npm test` is a placeholder [VERIFIED:.planning/codebase/STACK.md:21-46; quote: “No test framework configured; `npm test` is an intentional placeholder that exits with an error”]. Add only what the Phase 1 test strategy needs.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A fixture-specific SVG renderer is the least costly way to display this single example; no notation dependency is needed. | Summary, Standard Stack | Rendering/layout effort may exceed expectation or the score may need a real engraving library; could alter implementation cost. |
| A2 | The one score fixture can provide explicit, verified pickup, rest, note, and measure timing data. | Architecture Patterns | If fixture source cannot support those cases, the roadmap exit gate cannot be exercised without changing the fixture. |
| A3 | A deterministic timeline plus separately modeled uncertainty is the right Phase 1 follower boundary; pause/divergence semantics are intentionally deferred for planning decision. | Pattern 2 | Incorrect pause policy could create confusing or false position claims. |
| A4 | Local `node:test` is adequate for pure fixture/timeline tests without installing a framework. | Validation Architecture | Browser-specific integration behavior still needs manual/device validation; the app does not pin a Node version. |

## Open Questions

1. **Which verified example score and license/source will Phase 1 use?** It must include the roadmap's pickup, silence, wrong-pitch, and octave-ambiguity replay cases; CONTEXT leaves its content open. Choose a short, reproducible fixture with explicit metadata and measure ordering.
2. **What causes position confidence to drop, and what recovers it after singer pause/divergence?** The approved UI defines the visible uncertain/recovery flow, but CONTEXT does not choose follower semantics. Decide a deterministic rule and map its annotated replay cases before implementation; keep observations ungraded.
3. **What browser/device pair is the required manual exit-gate baseline?** The roadmap requires a real browser and device but does not name versions. Plan at least one modern supported browser with a real microphone and audio output; record browser/device used in exit-gate evidence.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Built-in unit/replay tests | ✓ | 24.19.0 | — |
| npm | Package scripts if updated | ✓ | 11.17.0 (`npm.cmd`) | Run `node --test` directly |
| Python | Existing README local static-server command | ✗ | — | Use another local static server already available, or provide a supported local command during planning. |
| Modern browser with microphone and speakers | Phase exit gate | Not verified in this CLI environment | — | Cannot replace the real-device exit gate with deterministic tests. |

The microphone API requires a secure context and permission; localhost is suitable for local development [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia]. No external service or package registry is needed for the recommended implementation.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node:test`; local Node 24.19.0 is available; project does not pin Node compatibility. |
| Config file | None. |
| Quick run command | `node --test tests/*.test.cjs` (proposed; add tests and script as a plan task). |
| Full suite command | `node --test tests/*.test.cjs` plus the manual browser/device exit gate. |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRAC-01 | Fixture exposes exactly valid part, tempo/meter, and starting measures; invalid/missing fixture fields disable start. | unit + DOM smoke | `node --test tests/fixture.test.cjs` | ❌ Wave 0 |
| PRAC-02 | Starting from a chosen regular measure or pickup maps count-in beat timestamps to the matching fixture timeline; first click differs in tone, clicks cease during following, recovery repeats count-in. | unit/replay + manual audio check | `node --test tests/timeline.test.cjs` | ❌ Wave 0 |
| PRAC-03 | Permission pending/denied/no-device/ready, start/stop/retry, repeated teardown, and late permission resolution produce one valid state and stop all tracks. | mocked lifecycle + real browser/device | `node --test tests/audio-session.test.cjs`; manual exit gate | ❌ Wave 0 |
| PRAC-04 | Annotated pickup, rest, wrong pitch, octave ambiguity, and lost-position events yield correct text/marker/uncertainty and recovery without restarting. | deterministic replay + browser interaction | `node --test tests/replay.test.cjs`; manual exit gate | ❌ Wave 0 |
| ACCESS-01 | All controls work via keyboard; text status persists apart from color; 320px, 600px, desktop, and 200% zoom reflow; live region announces only transitions. | manual accessibility smoke | Manual browser checklist | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Run the narrow `node --test tests/{fixture,timeline,audio-session,replay}.test.cjs` target related to the task.
- **Per wave merge:** Run `node --test tests/*.test.cjs`.
- **Phase gate:** Automated fixture/timeline/lifecycle checks green and complete the roadmap's real-browser/device exit gate.

### Wave 0 Gaps

- [ ] Add `tests/` and Node built-in test setup for fixture validation and timeline/pickup mapping.
- [ ] Add deterministic replay cases for pickup, silence/rest, wrong pitch, octave ambiguity, uncertainty, and recovery.
- [ ] Add an injectable/mockable audio-session boundary to test permission races and track cleanup without microphone hardware.
- [ ] Add the proposed test script; current `npm test` exits as a placeholder [VERIFIED:package.json:5-8; quote: `"test": "echo \"Error: no test specified\" && exit 1"`].

## Security Domain

Security enforcement is enabled: `[VERIFIED:.planning/config.json:48; quote: "security_enforcement": true]`.

### Applicable ASVS Categories

Use OWASP ASVS 5.0 chapter names: the older labels in the generic research template map differently in the current standard. OWASP identifies ASVS 5.0.0 as its latest stable version and publishes the current chapter map [CITED: https://owasp.org/projects/asvs].

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Encoding and Sanitization | Yes | Render fixture-provided text through text nodes; do not treat score labels as HTML. |
| V2 Validation and Business Logic | Yes | Validate the fixture shape and keep attempt transitions in order; reject unknown measures. |
| V3 Web Frontend Security | Yes | Use same-origin bundled assets; do not add third-party scripts or transmit microphone data. |
| V6 Authentication | No | No identity/account capability in Phase 1. |
| V7 Session Management | No | No authenticated application session in Phase 1. |
| V8 Authorization | No | No cross-user or persisted resource boundary in Phase 1. |
| V11 Cryptography | No | No secrets, encryption, or cryptographic data path is introduced. |
| V14 Data Protection | Yes | Keep microphone samples in memory for the active attempt only and clear them on stop; no recording or history persistence. |
| V17 WebRTC | No | Phase 1 uses local microphone capture via Web Audio and does not establish WebRTC communications. |

Applicability is a phase-scope assessment [ASSUMED]. Browser microphone permissions and secure-context requirements still apply [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia]. Never transmit or persist microphone samples in this fixture practice slice; do not route input back to speakers, consistent with the approved UI contract [VERIFIED:.planning/phases/01-verified-example-practice/01-UI-SPEC.md:60-76].

### Known Threat Patterns for Browser Audio

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Microphone permission denied, ignored, revoked, or unavailable | Denial of Service | Show specific actionable status; keep score usable; disable start until readiness; allow retry. |
| Input stream survives stop/error/retry | Information Disclosure / privacy | Stop every `MediaStreamTrack`, disconnect graph, and close `AudioContext` on every terminal path. |
| Malformed or incomplete fixture drives fabricated labels/positions | Tampering | Validate required fixture fields and event ordering; block start rather than infer missing metadata. |
| Rapid actions race async permission/startup | Elevation of Privilege / integrity | Single explicit state machine, disable duplicate actions while pending, invalidate stale start results, and make cleanup idempotent. |

## Sources

### Primary (official browser/accessibility documentation; MEDIUM confidence via research lookup)

- [MDN: Advanced techniques for creating and sequencing audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques) — look-ahead scheduler and `AudioContext.currentTime`.
- [MDN: `AudioScheduledSourceNode.start()`](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start) — scheduled source start time coordinate.
- [MDN: `getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) — secure contexts, permission, failure modes.
- [MDN: `MediaStreamTrack.stop()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop) — release captured track.
- [MDN: `requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — repaint pacing and background pause behavior.
- [W3C WAI: ARIA25 live region status messages](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA25) — dynamic status updates without focus movement.
- [W3C WAI: Understanding WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) — status message scope and announcement behavior.
- [OWASP: Application Security Verification Standard](https://owasp.org/projects/asvs) — ASVS 5.0.0 version and chapter map used for the phase-specific security table.

### In-repository sources (opened this session)

- `.planning/phases/01-verified-example-practice/01-CONTEXT.md` — locked count-in sound behavior and open topics.
- `.planning/phases/01-verified-example-practice/01-UI-SPEC.md` — states, copy, score display, microphone, recovery, keyboard/accessibility contract.
- `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md` — owned requirements, phase boundaries, exit gate, risks.
- `.planning/codebase/STACK.md`, `ARCHITECTURE.md`, `CONCERNS.md`, `TESTING.md`, and `AGENTS.md` — current implementation, conventions, and lifecycle/test gaps.

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — current project stack was read in-repo; browser timing/lifecycle behavior was checked against official MDN/W3C documentation.
- Architecture: MEDIUM — one-fixture recommendations are scope-specific inferences; pause/divergence behavior remains undecided.
- Pitfalls: MEDIUM — browser API behavior is documented by MDN and current repo lifecycle risks are explicit in the concerns audit.

**Research date:** 2026-09-25  
**Valid until:** 2026-10-25 for the stable browser/API recommendations; recheck browser support if the target browser matrix changes.
