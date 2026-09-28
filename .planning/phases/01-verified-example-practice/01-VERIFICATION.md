---
phase: 01-verified-example-practice
verified: 2026-09-28T04:14:50Z
status: passed
score: 8/8 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/01-verified-example-practice/01-01-PLAN.md
  - .planning/phases/01-verified-example-practice/01-01-SUMMARY.md
  - .planning/phases/01-verified-example-practice/01-02-PLAN.md
  - .planning/phases/01-verified-example-practice/01-02-SUMMARY.md
  - .planning/phases/01-verified-example-practice/01-03-PLAN.md
  - .planning/phases/01-verified-example-practice/01-03-SUMMARY.md
  - index.html
  - package.json
  - practice-audio.js
  - practice-fixture.js
  - script.js
  - tests/accessibility-contract.test.cjs
  - tests/audio-session.test.cjs
  - tests/fixture.test.cjs
  - tests/live-announcement.test.cjs
  - tests/page-startup.test.cjs
  - tests/practice-tracer.test.cjs
  - tests/replay.test.cjs
  - tests/timeline.test.cjs
covered_digest: "v1:sha256:52d9771a36245b710f02c525feabbd1e928de6da48433ac953604e6d9ca86d1e"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 3
  total: 3
  not_honored: []
---

# Phase 1: Verified Example Practice Verification

**Phase goal:** As a singer practicing at home, I want to rehearse one manually verified example score from a chosen measure with a working microphone, tempo, transport, and accessible score-position controls, so that I can keep my place and complete a guided attempt.

**Verdict:** Passed for the Phase 1 example-practice scope. This phase does not grade notes or accept PDF uploads.

## User Flow Coverage

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Open the example | One verified vocal part, tempo, meter, pickup, and valid starting measures appear | `loadFixture` and `drawScore` in `script.js`; fixture and page-startup tests; Chrome acceptance | Verified |
| Prepare | Select a starting measure, check microphone readiness, and see a usable status | Native controls in `index.html`; `checkMicrophone` in `script.js`; audio-session tests; Chrome acceptance | Verified |
| Sing | Hear the count-in, then see current score position and provisional pitch/onset observations | `startPractice` and `followPosition` in `script.js`; `createPracticeAudio` in `practice-audio.js`; tracer/timeline tests; Chrome acceptance | Verified |
| Regain place | See uncertainty as ungraded, select a measure, and resume with count-in | `enterPositionUncertain` and recovery path in `script.js`; replay tests; Chrome keyboard acceptance | Verified |
| Finish or retry | Stop, release the microphone, and retry from the original attempt measure | `endAttempt` and `retryAttempt` in `script.js`; audio-session tests; Chrome acceptance | Verified |
| Outcome | Keep place and complete a guided example attempt using keyboard-accessible, non-color status | Persistent position text and neutral uncertainty marker in `index.html`/`script.js`; accessibility tests; Chrome acceptance | Verified |

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The example presents its one part, tempo, meter, and valid start measures before practice | Verified | Fixture validation and selector population are implemented and covered by fixture, tracer, and startup tests. |
| 2 | A singer can check the microphone, hear count-in clicks aligned to the chosen measure, then start, stop, and retry | Verified | Web Audio scheduling and cleanup are covered by tracer/audio-session tests; the singer confirmed sound and transport in Chrome. |
| 3 | Score position follows the fixture audio clock through the pickup and measures | Verified | `createPositionTracker` maps scheduled audio time; timeline and replay tests cover pickup mapping; the singer saw the marker move in Chrome. |
| 4 | Pitch and onset input appears as provisional observations without grades or written-note attachment | Verified | `analyzeAudioFrame` produces descriptive text, `acceptObservation` rejects grading/association, and tracer/replay tests cover silence, wrong pitch, and octave ambiguity. |
| 5 | Clock or position uncertainty removes the current-position claim, marks the passage ungraded, and permits in-place recovery | Verified | Tracker and controller clear current claims and observations; replay tests exercise clock gaps, suspension, visibility, declared loss, and selected-measure recovery; Chrome acceptance confirmed the text. |
| 6 | Microphone lifecycle is safe across permission races, failures, stop, and retry; raw samples remain local | Verified | `createPracticeAudio` releases tracks and nodes and never calls a network or storage API; audio-session tests exercise races and cleanup. |
| 7 | Primary controls work by keyboard with visible focus and persistent text status | Verified | Native controls, focus CSS, and status text pass accessibility contract tests; the singer confirmed Tab focus, Space activation, stop, retry, and recovery in Chrome. |
| 8 | The page reflows at narrow and zoomed widths, while important transitions reach one polite status region without beat chatter | Verified | Responsive and live-region tests pass; the singer checked 320px, 600px, desktop, and 200% zoom in Chrome. |

**Score:** 8/8 truths verified. No behavior-dependent truth rests on symbol presence alone; the named tests exercise the relevant transitions.

## Artifacts and Wiring

| Link | Evidence | Status |
|------|----------|--------|
| `index.html` to fixture, audio, and controller | Classic scripts load in dependency order at the end of the document | Wired |
| Fixture to selectors and score | `loadFixture` validates the fixture, populates controls, and calls `drawScore`; startup and fixture tests exercise the path | Wired |
| Start control to Web Audio count-in and position tracker | `startPractice` supplies the chosen measure and scheduled start time to audio and tracker; tracer/timeline tests exercise the path | Wired |
| Microphone frames to provisional text | `analyzeAudioFrame` feeds `onObservation`; the tracker gates observations; no score-note grade path exists | Wired |
| Uncertainty and recovery to UI | Tracker state drives neutral cursor, explicit text, measure choice, and reused count-in; replay and Chrome acceptance exercise the path | Wired |
| Session transitions to accessible status | Controller updates `#live-announcement`; DOM interaction test confirms ready/count-in updates without per-beat changes | Wired |

## Requirements Coverage

| Requirement | Source plan | Result | Evidence |
|-------------|-------------|--------|----------|
| PRAC-01 | 01-01 | Satisfied for the verified fixture | Selectors, tempo display, fixture/startup tests |
| PRAC-02 | 01-01 | Satisfied for the fixed 96 BPM fixture | Scheduled count-in, timeline tests, Chrome sound check |
| PRAC-03 | 01-02 | Satisfied | Audio lifecycle tests and Chrome microphone/transport check |
| PRAC-04 | 01-02 | Satisfied for fixture-clock position | Replay/recovery tests and Chrome marker/uncertainty check |
| ACCESS-01 | 01-03 | Satisfied for keyboard and non-color feedback | Accessibility/announcement tests and Chrome keyboard/layout check |

All five Phase 1 requirement IDs appear in plan frontmatter and the requirement traceability table.

## Checks and Limits

- `npm.cmd test` passed 32/32 on 2026-09-28 UTC during verification. Tests contain no skipped cases or generated expected-output baselines.
- The singer's real-browser results are recorded in `01-03-ACCEPTANCE.md`, including microphone, count-in, keyboard, marker, uncertainty, retry, and responsive layout.
- The fixture uses a scheduled audio timeline. It does not infer score position from the singer's voice; pitch and timing observations remain provisional. Authoritative per-note evaluation belongs to Phase 4.
- Actual spoken screen reader announcements were not observed because no screen reader was available. The tested `role="status"`, `aria-live="polite"`, and DOM text transitions establish the available alternate evidence. Spoken output remains an accessibility follow-up, not a Phase 1 requirement failure.
- Chrome's exact selected audio endpoint names and reduced-motion emulation were not independently observed; the acceptance record identifies the available evidence.

### Decision Coverage

All 3 trackable `01-CONTEXT.md` decisions are honored by shipped artifacts, per `check.decision-coverage-verify`.

## Gaps Summary

No Phase 1 goal gaps were found. No additional human check is required to establish the stated keyboard and non-color acceptance criteria; the unobserved spoken output remains explicitly open for later assistive-technology testing.
