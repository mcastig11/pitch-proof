---
phase: 02-private-practice-access
plan: 06
subsystem: ui
tags: [auth, accessibility, express, guest-practice]
requires:
  - phase: 02-04
    provides: Verified sessions, recovery and pending-account controls
  - phase: 02-05
    provides: Server-side account email transport
provides:
  - Native account forms and verified sign-in continuation
  - Protected workspace with expiry clearing and public welcome
  - Discreet account navigation independent of guest audio
affects: [02-07, phase-03, account-acceptance]
actuals:
  tokens: 18270
  tasks: 3
  commits: 6
tech-stack:
  added: []
  patterns: [Native HTML forms, server-signed confirmation receipt, no-store private UI]
key-files:
  created: [auth.html, welcome.html, workspace.html, client/auth.js, client/workspace.js, tests/support/browser-harness.cjs]
  modified: [index.html, script.js, server/app.mjs, server/index.mjs, tests/auth-ui.test.cjs]
key-decisions:
  - Confirmation success requires a short-lived server-signed HttpOnly receipt.
  - Public auth routes and assets extend the explicit server allowlist.
  - Account refresh and expiry leave guest microphone observations independent.
patterns-established:
  - Clear private DOM on 401 and guard stale asynchronous results.
  - Account invitation is inline and appears once after a genuine attempt.
requirements-completed: [AUTH-01, AUTH-02]
coverage:
  - id: D1
    description: Account forms, confirmation, resend, correction and recovery states
    requirement: AUTH-01
    verification:
      - kind: automated_ui
        ref: tests/auth-ui.test.cjs#pending email state has clear confirmation copy, resend, and correction actions
        status: pass
    human_judgment: false
  - id: D2
    description: Private workspace clears on expiry and uses server-selected sign-in routing
    requirement: AUTH-02
    verification:
      - kind: automated_ui
        ref: tests/auth-ui.test.cjs#expired workspace session clears private content and offers sign-in
        status: pass
    human_judgment: false
  - id: D3
    description: Exact inline invitations and independent guest practice after account expiry
    verification:
      - kind: automated_ui
        ref: tests/auth-ui.test.cjs#D-03 invitation appears near practice and once after an attempt with exact copy
        status: pass
    human_judgment: true
    rationale: Real browser microphone and invitation/navigation behavior through expiry remain unobserved.
  - id: D4
    description: Keyboard, narrow and zoomed layout, focus and spoken status usability
    verification: []
    human_judgment: true
    rationale: DOM checks establish contracts but do not establish visual layout or assistive speech output.
duration: 16min implementation commit span; resumed metadata closeout
completed: 2026-10-13
status: complete
---

# Phase 2 Plan 6: Public Account and Private Workspace UI Summary

Native account forms, protected workspace expiry handling, and discreet account navigation keep the public example usable independently of sign-in.

## Performance

- Implementation commit span: 2026-10-09T01:07:23Z to 2026-10-09T01:23:24Z (16 minutes; not a claim of total active time).
- Metadata closeout resumed on 2026-10-13 after the user pause.
- Tasks: 3. Realized diff: 14 files, 785 insertions, 21 deletions; 18,270 characters/4 tokens, including RED evidence.
- Baseline: 840e4d1; final implementation: 41f2759. Six task commits; later pause metadata excluded.

## Accomplishments

- Signup, sign-in, verification, resend, address correction and password recovery use labeled native forms, generic account responses, safe continuation and focus handling.
- The private workspace shows identity and scores-coming copy, erases private content on expiry, handles stale responses, and offers fresh sign-in. Sign-out returns to a public welcome with equal-weight actions.
- The example displays the exact approved invitations and persistent signed-in navigation. Account expiry does not stop microphone capture, alter provisional observations, or steal practice focus.
- Keyboard/DOM contracts pass. Real browser layout, speech and microphone acceptance remain human-needed.

## Task Commits and TDD Gate Compliance

| Task | RED | GREEN |
| --- | --- | --- |
| 1: Account and recovery states | f98bec4 | d421980 |
| 2: Workspace and welcome | 95c9e40 | bdb7c26 |
| 3: Invitations and guest practice | a4e5c12 | 41f2759 |

Each persisted RED record names an intentional assertion failure for its task. GREEN results were collected before pause; no task replay was performed during closeout. No separate refactor was needed.

## Test Results

- Recorded focused UI/startup/accessibility/tracer set: 33 passed, 0 failed.
- Recorded full `npm.cmd test`: 90 total, 84 passed, 0 failed/cancelled/skipped, 6 ownership TODOs, exit 0, 12,849ms. The originating executor collected and closed the test session before pause.
- The six TODOs belong to Plan 02-07 and do not establish owner isolation. Mandatory wave gates run after this closeout.
- No real browser/microphone, restart, screen reader, live email, or deployment acceptance is claimed.

## Decisions Made

Server-signed confirmation receipts prevent forged callback flags from claiming verification. Explicit public file mappings let the new pages load without exposing repository files. Account state and local audio lifecycle remain independent. D-01 through D-12 retain their approved meaning.

## Deviations from Plan

**[Rule 2 - Security] Authenticate confirmation success.** Task 1 adds a short-lived HttpOnly signed receipt and restricts callback paths rather than trusting query flags. Files: server/app.mjs, client/auth.js; verification: callback and UI integration assertions; commit d421980.

**[Rule 3 - Blocker] Extend startup allowlist.** Tasks 1/2 add the public account/welcome routes and client asset mappings required by the standalone server. File: server/index.mjs; verification: startup regression; commits d421980/bdb7c26. No repository directory is made public.

Total deviations: 2 routine security/startup corrections; no product scope change or dependency installation.

## Threat Flags

Private workspace reads require verified sessions and no-store. Private content is cleared on expiry and stale responses cannot restore it. Browser extensions and local screen capture remain residual risks described in the plan. Production owner-resource authorization is delivered by Plan 02-07.

## Issues Encountered

The shell sandbox helper failed before startup; approved escalated reads succeeded. A server restart interrupted resume before any repository edit. Existing dispatch sentinel changes are preserved and excluded from commits.

## User Setup Required

Production account delivery still requires server-only credentials, verified sender, HTTPS and durable private storage as documented in README. No live service setup occurred here.

## Next Phase Readiness

Ready for Plan 02-07 owner-scoped metadata and injected-byte seam. AUTH-01/AUTH-02 remain open in REQUIREMENTS until complete phase acceptance; the frontmatter copies the plan's IDs for traceability, not an acceptance claim. WINDOWS 22 and browser/microphone/layout/speech acceptance remain pending.

## Self-Check: PASSED

All key created files and six task commits exist. The saved handoff matches implementation HEAD 41f2759 and no implementation replay was needed. Summary metrics use the original 840e4d1 baseline; task and regression evidence is preserved with its real-browser limits.
