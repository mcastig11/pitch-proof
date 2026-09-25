# Phase 1: Verified Example Practice - Context

**Gathered:** 2026-09-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a short score-guided practice attempt using one manually verified example score. A singer selects its one vocal part and a valid starting measure, checks microphone readiness, hears a count-in, and follows score position with provisional pitch and timing observations. Tracking uncertainty is visibly ungraded and can be recovered without restarting the app. PDF upload, accounts, history, and authoritative per-note grading remain in later phases.

</domain>

<decisions>
## Implementation Decisions

### Metronome behavior
- **D-01:** The audible click plays during the count-in only, then stops for the singing portion. Apply the same count-in behavior when recovering position, consistent with the approved UI contract.
- **D-02:** Accent the first count-in beat with a different tone at about the same volume as the other beats.
- **D-03:** Do not add a separate "sing now" cue. Move into the practice state on the next beat after the count-in.
- Keep the visible beat number and score-position indication defined by the approved UI contract; the user decision concerns audible clicks and the transition cue.

### the agent's Discretion
- The user did not delegate choices explicitly. Details not discussed remain open for research/planning recommendations rather than user-approved defaults.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope and acceptance
- `.planning/ROADMAP.md` § Phase 1 — phase goal, success criteria, and exit gate.
- `.planning/REQUIREMENTS.md` § Live Practice and ACCESS-01 — requirements owned by this phase.
- `.planning/PROJECT.md` — core value, product constraints, and boundary between provisional and authoritative feedback.
- `.planning/STATE.md` — validation risks for score following and device timing.

### Approved design and codebase
- `.planning/phases/01-verified-example-practice/01-UI-SPEC.md` — approved visual and interaction contract, including count-in, beat display, microphone, uncertainty, and accessibility states.
- `.planning/codebase/STACK.md` — browser-only vanilla JavaScript stack and lack of test/build framework.
- `.planning/codebase/ARCHITECTURE.md` — current DOM, microphone, audio-analysis, and session structure.
- `.planning/codebase/CONCERNS.md` — known audio lifecycle, performance, and validation risks.
- `AGENTS.md` — repository conventions and hard constraints.
- `index.html` — current page and inline styling.
- `script.js` — current browser audio capture and pitch-analysis prototype.
- `package.json` — available scripts and dependencies.
- `README.md` — local serving instructions and prototype setup notes.

No external specs or ADRs were referenced during this discussion.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `script.js` already requests browser microphone access and builds a Web Audio graph using `AudioContext`, `AnalyserNode`, and `getUserMedia`.
- `detectPitch()` and `freqToNote()` provide prototype frequency/note estimates that may inform provisional observations, subject to the known accuracy limits.
- Existing DOM status updates in `script.js` can inform the browser-facing integration point.

### Established Patterns
- The app is a static HTML page with inline CSS and one imperative browser script; there is no UI framework or state-management library.
- Audio capture, analysis, UI rendering, recording, and feedback currently share module-level state in `script.js`.
- No score representation, notation renderer, score follower, metronome, build system, or automated test framework currently exists.

### Integration Points
- `index.html` is the current composition root and loads `script.js`.
- Microphone setup and teardown are centered on `startRecording()` and `stopRecording()`; their asynchronous lifecycle has known cleanup and race risks.
- The new count-in/metronome behavior must align with the score position and attempt state defined in the approved UI-SPEC.

</code_context>

<specifics>
## Specific Ideas

- Count-in clicks stop before the singer begins the attempt. The first beat is distinguished by tone rather than extra loudness, and there is no separate post-count-in cue.
- The user selected only the metronome area. Example-score content and the follower's behavior when the singer pauses or diverges were offered for discussion but were not selected; no preference on those topics is locked here.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.
</deferred>

---

*Phase: 1-Verified Example Practice*
*Context gathered: 2026-09-25*
