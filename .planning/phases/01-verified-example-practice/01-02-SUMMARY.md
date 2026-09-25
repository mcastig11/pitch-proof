---
phase: 01-verified-example-practice
plan: 02
subsystem: practice
tags: [browser-audio, score-position, confidence, recovery, node-test]

# Dependency graph
requires:
  - phase: 01-01
    provides: Verified fixture, local audio analysis, and scheduled count-in.
provides:
  - Retry-safe microphone readiness, stop, and retry lifecycle.
  - Confidence-aware position state with explicit ungraded uncertainty.
  - In-place selected-measure recovery using the existing count-in.
affects: [01-03-accessibility, phase-01-verification]

# Actuals measured against the realized plan diff (#2632, #3968)
actuals:
  tokens: 9074
  tasks: 2
  commits: 4
plan_head_before: c4330208f3a4e500a0e8ae447187137cf6636568

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Audio permission attempts use a generation guard and explicit lifecycle state.
    - Position confidence is tracked separately from microphone pitch observations.
    - Recovery starts a fresh timeline segment after the same scheduled count-in.

key-files:
  created:
    - tests/audio-session.test.cjs
    - tests/replay.test.cjs
  modified:
    - index.html
    - script.js
    - practice-fixture.js
    - practice-audio.js
    - package.json

key-decisions:
  - "Clock gaps, AudioContext suspension, visibility loss, and a singer-declared lost place downgrade position to ungraded uncertainty."
  - "Pitch and onset observations remain provisional and are never attached to written score notes."
  - "Recovery validates the chosen fixture measure and reuses the initial count-in scheduler."

requirements-completed: [PRAC-03, PRAC-04]

coverage:
  - id: D1
    description: "Microphone readiness, errors, stop, and retry release local resources safely."
    requirement: PRAC-03
    verification:
      - kind: unit
        ref: "tests/audio-session.test.cjs"
        status: pass
    human_judgment: false
  - id: D2
    description: "Uncertain position is visibly ungraded and can recover from a validated measure through count-in."
    requirement: PRAC-04
    verification:
      - kind: unit
        ref: "tests/replay.test.cjs"
        status: pass
      - kind: integration
        ref: "tests/practice-tracer.test.cjs"
        status: pass
    human_judgment: true
    rationale: "A real browser and microphone must confirm visibility and AudioContext transitions, count-in sound, and in-place recovery; the Phase 1 browser/device gate remains in Plan 03."

# Metrics
duration: 44m
completed: 2026-09-25
status: complete
---

# Phase 01 Plan 02: Retry-Safe Audio and Position Recovery Summary

Microphone setup now rejects duplicate or stale permission attempts and releases local resources on errors and stop. Score tracking downgrades to an explicit ungraded state when its clock becomes uncertain, then resumes from a valid measure with the same count-in.

## Performance

- **Duration:** 44 minutes
- **Started:** 2026-09-25T20:54:00Z (after Plan 01-01)
- **Completed:** 2026-09-25
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Made microphone permission checks single-flight and generation-guarded; late streams are stopped, failures release partial graphs, and repeated cleanup is safe.
- Added explicit audio session states and suspension handling; teardown cancels sampling, disconnects scheduled click nodes, stops tracks, and closes the context.
- Added confidence-aware timeline tracking for clock gaps, audio suspension, visibility loss, and a singer-declared lost place. The last confirmed marker is retained with a neutral dashed style, current-position claims are removed, and provisional observations are cleared.
- Added selected-measure recovery in place. It validates the fixture measure, blocks observations during recovery count-in, resumes at the next beat, and continues to avoid note grading or association.
- Replaced the placeholder npm test command with Node's built-in test runner.

## Task Commits

Each task followed a RED/GREEN sequence:

1. **Task 1 RED: microphone lifecycle tests** - `eda9685` (test)
2. **Task 1 GREEN: retry-safe microphone lifecycle** - `e80dbd9` (feat)
3. **Task 2 RED: confidence and recovery replay tests** - `2a5e222` (test)
4. **Task 2 GREEN: ungraded position recovery** - `afa2765` (feat)

**Plan metadata:** pending final execution-state commit.

## Files Created/Modified

- `practice-audio.js` - Explicit lifecycle state, permission-generation guard, safe cleanup, and audio suspension/resume support.
- `practice-fixture.js` - Pure position-confidence tracker with validated recovery and ungraded observations.
- `script.js` - UI status downgrade, visibility handling, lost-place action, and selected-measure recovery flow.
- `index.html` - Lost-place control and a neutral dashed style for the frozen, unconfirmed marker.
- `tests/audio-session.test.cjs` - Permission race, failure, retry, repeated stop, and resource-release cases.
- `tests/replay.test.cjs` - Pickup, silence, wrong-pitch, octave ambiguity, uncertainty, and recovery replay cases.
- `package.json` - `npm test` runs all built-in Node tests.

## Decisions Made

- Position trust uses fixture audio time and is independent of whether pitch is available or ambiguous.
- A loss of position clears current-position language and note association until recovery count-in completes.
- The initial measure remains the retry origin; recovery starts a new in-attempt timeline from the newly selected measure.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Preserve the tracer interface while resuming suspended audio**
- **Found during:** Task 2 verification
- **Issue:** Making `startPractice()` asynchronous broke the existing tracer and timeline callers.
- **Fix:** Kept count-in scheduling synchronous and added a separate guarded `resume()` step for the controller.
- **Files modified:** `practice-audio.js`, `script.js`
- **Verification:** `npm.cmd test` passed all 23 tests.
- **Committed in:** `afa2765` (part of Task 2 implementation)

**Total deviations:** 1 auto-fixed (Rule 1)
**Impact on plan:** Kept the established count-in API intact while enabling browser audio-context recovery.

## Issues Encountered

- PowerShell blocked the `npm` shim under its execution policy. Running `npm.cmd test` invoked the same configured test script successfully.
- Git writes were sandbox-blocked at first. Elevated access was granted for the scoped task commits and required plan ledger.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 03 can add the accessibility and browser/device checks. The UI exposes the uncertainty and recovery actions, while real browser and microphone behavior still needs the Phase 1 exit-gate review.

---
*Phase: 01-verified-example-practice*
*Completed: 2026-09-25*

## Self-Check: PASSED

- Task test and implementation commits exist: `eda9685`, `e80dbd9`, `2a5e222`, `afa2765`.
- Automated verification passed: 23 tests, 0 failures.
- Task implementation files are included in the measured plan diff from `plan_head_before`.
