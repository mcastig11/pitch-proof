---
phase: 01-verified-example-practice
plan: 01
subsystem: practice
tags: [browser-audio, score-timeline, node-test]

# Dependency graph
requires: []
provides:
  - Original validated vocal fixture with a one-beat pickup and four ordered measures.
  - Local microphone analysis for provisional pitch and onset observations.
  - Audio-clock count-in and pickup-aware score position mapping.
affects: [01-02-session-recovery, 01-03-accessibility, phase-01-verification]

# Actuals measured against the realized plan diff (#2632, #3968)
actuals:
  tokens: 18517
  tasks: 2
  commits: 3
plan_head_before: cb2717daa96a9946d79d3391afed55b3645812fe

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dual CommonJS/browser-global exports keep pure fixture and audio helpers directly testable.
    - Web Audio input connects only to an analyser; count-in tones are separately scheduled to the output.
    - The AudioContext clock drives both count-in display and fixture position mapping.

key-files:
  created:
    - practice-fixture.js
    - practice-audio.js
    - tests/practice-tracer.test.cjs
    - tests/fixture.test.cjs
    - tests/timeline.test.cjs
  modified:
    - index.html
    - script.js

key-decisions:
  - "The example is an original in-repository exercise with one voice part, one pickup beat, four 4/4 measures, and a fixed 96 BPM tempo."
  - "Count-in clicks use an equal-gain accent tone on the first beat, stop at the count-in boundary, and have no separate start cue."
  - "Practice reports only provisional heard-pitch and nearby-onset observations; it never grades or associates input with written notes."

patterns-established:
  - "Fixture validation, selectable measure derivation, score-time mapping, and nearest-beat mapping are separate pure exports."
  - "Audio teardown is repeatable and releases tracks and partial audio graphs after setup errors."

requirements-completed: [PRAC-01, PRAC-02]

coverage:
  - id: D1
    description: "Review the verified one-part score, fixed tempo and meter, and valid starting measures."
    requirement: PRAC-01
    verification:
      - kind: unit
        ref: "tests/fixture.test.cjs"
        status: pass
    human_judgment: false
  - id: D2
    description: "Start at a selected measure with count-in beats and follow pickup-aware score timing."
    requirement: PRAC-02
    verification:
      - kind: integration
        ref: "tests/practice-tracer.test.cjs"
        status: pass
      - kind: unit
        ref: "tests/timeline.test.cjs"
        status: pass
    human_judgment: true
    rationale: "Automated tests use a fake Web Audio clock; real browser output and microphone timing are checked in the later browser/device plan."
  - id: D3
    description: "Show pitch and onset observations derived from synthetic microphone input without grades or note association."
    verification:
      - kind: integration
        ref: "tests/practice-tracer.test.cjs"
        status: pass
    human_judgment: false

duration: 21m
completed: 2026-09-25
status: complete
---

# Phase 01 Plan 01: Selected-Measure Practice Tracer Summary

Implemented the verified example practice path with a local-only audio analyser, a count-in scheduled on the Web Audio clock, and ungraded input observations. The fixture supplies the score metadata and timeline, including its one-beat pickup.

## Accomplishments

- Replaced the prototype screen with the approved preparation, score, microphone status, observation, count-in, and transport layout.
- Added an original vocal exercise with one part, one pickup beat, four 4/4 measures, notes and a rest, and 96 BPM tempo.
- Added local pitch and RMS-onset analysis. Synthetic A4 input yields “Pitch heard: A4”; silence remains in the listening/no-onset state.
- Added a distinct first count-in tone at the same gain as other clicks. The score-following state begins on the next beat, with no additional cue.
- Added pure validation, valid start-measure derivation, pickup-aware position mapping, and nearest-beat mapping.
- Added deterministic tests for the synthetic input path, count-in schedule, track cleanup, fixture validation, rests, and pickup timeline.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected octave selection for a clean synthetic A4 tone**
- **Found during:** Task 1 tracer verification
- **Issue:** Selecting the highest autocorrelation peak returned A2 for a 440 Hz buffer.
- **Fix:** Use normalized correlation and select the earliest strong periodic peak; the synthetic A4 test now reports A4.
- **Files modified:** `practice-audio.js`
- **Commit:** `6828728`

**2. [Rule 1 - Bug] Map onset observations to the nearest displayed fixture beat**
- **Found during:** Task 2 timeline verification
- **Issue:** The initial mapper exposed a global beat index where the UI contract expects the beat number within the nearest displayed measure.
- **Fix:** Round to the nearest absolute score beat, then return that measure's displayed beat number. Event validation also rejects gaps and fractional beat spans.
- **Files modified:** `practice-fixture.js`
- **Commit:** `906cb8d`

**3. [Rule 2 - Missing critical functionality] Release microphone resources when audio setup fails**
- **Found during:** Task 2 tracer verification
- **Issue:** A stream granted before an `AudioContext` setup error could remain active.
- **Fix:** Clean up partial audio graphs and stop every granted stream track on initialization failure; teardown continues even if an individual disconnect or track stop fails.
- **Files modified:** `practice-audio.js`, `tests/practice-tracer.test.cjs`
- **RED test commit:** `aaa81a2`
- **GREEN implementation commit:** `906cb8d`

## Verification

- `node --check script.js practice-audio.js practice-fixture.js` — passed as individual checks.
- `node --test tests/practice-tracer.test.cjs tests/fixture.test.cjs tests/timeline.test.cjs` — 13 tests passed.
- `git diff --check` — passed.
- The real browser, microphone-device, keyboard, and responsive-layout checks remain in the later Phase 1 browser/device plan.

## Known Stubs

None.

## Threat Flags

None. Microphone input stays in memory and is connected only to the analyser. The score is rendered with DOM text/SVG nodes; no network, storage, recording, or note-grading path was added.

## Self-Check: PASSED

- SUMMARY file exists at the required phase path.
- Task commits `6828728`, `aaa81a2`, and `906cb8d` exist in git history.
- No task changes remain uncommitted.
