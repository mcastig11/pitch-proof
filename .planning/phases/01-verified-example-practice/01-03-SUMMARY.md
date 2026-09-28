---
phase: 01-verified-example-practice
plan: 03
subsystem: practice-ui
tags: [accessibility, responsive-layout, browser-audio, node-test]
requires:
  - phase: 01-02
    provides: Retry-safe microphone flow and confidence-aware score-position recovery.
provides:
  - Keyboard-operable practice controls, visible focus, and persistent text equivalents for position and uncertainty.
  - Polite transition status with no per-beat announcements.
  - Responsive score and control layout with recorded browser acceptance evidence.
affects: [phase-01-verification, future-accessibility-uat]
actuals:
  tokens: 5869
  tasks: 2
  commits: 3
tech-stack:
  added: []
  patterns:
    - Session transitions update one polite status region while sample and beat updates stay out of it.
    - Browser acceptance records distinguish user observations, DOM tests, and unobserved assistive-technology output.
key-files:
  created:
    - tests/page-startup.test.cjs
    - tests/live-announcement.test.cjs
    - .planning/phases/01-verified-example-practice/01-03-ACCEPTANCE.md
  modified:
    - index.html
    - script.js
    - tests/accessibility-contract.test.cjs
key-decisions:
  - "Keep microphone pitch and timing observations provisional and separate from written-note grades."
  - "Use DOM transition and live-region semantics as the available alternate check; spoken screen-reader output remains unverified."
  - "Explicitly remove the SVG hidden attribute so Chrome renders the example score."
requirements-completed: [ACCESS-01]
coverage:
  - id: D1
    description: "Labeled native controls, visible keyboard focus, and text status support the complete practice flow."
    requirement: ACCESS-01
    verification:
      - kind: unit
        ref: "tests/accessibility-contract.test.cjs"
        status: pass
      - kind: manual_procedural
        ref: "01-03-ACCEPTANCE.md#keyboard-focus-and-activation"
        status: pass
    human_judgment: true
    rationale: "The singer confirmed keyboard control and the score-frame focus outline in Chrome."
  - id: D2
    description: "Microphone-ready and count-in-start transitions reach the polite status without announcing every beat."
    requirement: ACCESS-01
    verification:
      - kind: unit
        ref: "tests/accessibility-contract.test.cjs#transition-announcements"
        status: pass
      - kind: integration
        ref: "tests/live-announcement.test.cjs"
        status: pass
    human_judgment: true
    rationale: "No screen reader was available; spoken output remains unobserved despite verified live-region semantics and DOM updates."
  - id: D3
    description: "Narrow and zoomed layouts keep controls readable and horizontal scrolling inside the score frame."
    requirement: ACCESS-01
    verification:
      - kind: unit
        ref: "tests/accessibility-contract.test.cjs#responsive-layout"
        status: pass
      - kind: manual_procedural
        ref: "01-03-ACCEPTANCE.md#320px-600px-desktop-and-200-percent-zoom"
        status: pass
    human_judgment: true
    rationale: "The singer inspected 320px, 600px, desktop, and 200% zoom in Chrome."
duration: "2d 4h elapsed across a pause; active time not recorded"
completed: 2026-09-27
status: complete
---

# Phase 01 Plan 03: Accessible Controls and Browser Verification Summary

The example practice flow now has keyboard focus and text status that the singer checked in Chrome, with responsive layout and a polite region whose transitions are covered by an interaction test.

## Performance

- **Elapsed:** About 2 days 4 hours across a pause; active execution time was not recorded.
- **Started:** 2026-09-25T17:26:16-05:00
- **Completed:** 2026-09-27
- **Tasks:** 2
- **Files created or modified:** 6

## Accomplishments

- Added labeled native controls, a score-frame focus outline, persistent position and ungraded text, and one polite transition region.
- Kept microphone observations provisional and detached from score notes, including silence, wrong pitch, octave ambiguity, and uncertain position.
- Recorded user-observed Chrome keyboard, microphone, count-in, recovery, score, and responsive-layout checks in `01-03-ACCEPTANCE.md`.
- Added DOM interaction coverage for microphone-ready and count-in-start status changes and fixed SVG visibility and staff note placement discovered during browser acceptance. The full Node suite passes 32/32.

## Task Commits

1. **Task 1: Expose accessible controls and state announcements** — `dcb14a6`.
2. **Task 2: Verify responsive layout and full accessible practice flow** — `dda2b07`, `69def0e`.

## Decisions and Limitations

- A screen reader was unavailable to the singer and no connected browser surface was available for independent assistive-technology inspection. `role="status"`, `aria-live="polite"`, actual transition text updates, and absence of beat chatter passed automated checks. Spoken announcements remain unverified and should be checked in a later accessibility UAT.
- Chrome's exact selected audio endpoint names and a running-browser version were not independently confirmed. The acceptance record identifies the installed Chrome version, the user's laptop microphone report, and Windows' listed input and output endpoints without equating these to Chrome selections.
- Reduced-motion browser emulation was not performed. The CSS has no pulse animation, contains a reduced-motion override, and the singer saw count-in numbers.

## Deviations from Plan

Chrome kept the SVG hidden after setting its `hidden` property to false. Removing the attribute explicitly made the verified score visible; a page-startup test now covers that behavior. Staff note placement and the score-frame focus outline were corrected after browser inspection.

## Verification

- `npm.cmd test`: 32 passed, 0 failed on 2026-09-27.
- `git diff --check`: no whitespace errors.
- Real-browser observations and their limits: `01-03-ACCEPTANCE.md`.

## Next Step

Run Phase 1 verification and retain the unobserved spoken-announcement check as an explicit follow-up.
