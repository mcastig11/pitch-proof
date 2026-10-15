---
phase: 02-private-practice-access
plan: 08
subsystem: auth
tags: [email-correction, verified-identity, regression]
requires:
  - phase: 02-06
    provides: Account correction and protected workspace UI
  - phase: 02-07
    provides: Session-derived resource ownership boundary
provides:
  - Workspace identity uses the current verified email
  - Corrected-address HTTP and actual-backend DOM regressions
affects: [phase-03, account-identity]
plan_head_before: d68f2a8
commits: 3
actuals:
  tokens: 1726
  tasks: 2
  commits: 3
tech-stack:
  added: []
  patterns: [Separate account email identity from display name]
key-files:
  created: []
  modified:
    - server/app.mjs
    - tests/auth-flow.test.cjs
    - tests/auth-ui.test.cjs
key-decisions:
  - Signed in as identifies the current verified email; a separate display name is retained.
  - Existing corrected accounts are repaired by the response source without a data migration.
requirements-completed: [AUTH-01, AUTH-02]
coverage:
  - id: D1
    description: Corrected and verified email is returned after fresh sign-in without overwriting the display name
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: tests/auth-flow.test.cjs#corrected-address signup invalidates prior links and signs in with the current workspace email
        status: pass
    human_judgment: false
  - id: D2
    description: Actual signup and correction forms render the current email in My space through the real backend
    requirement: AUTH-02
    verification:
      - kind: automated_ui
        ref: tests/auth-ui.test.cjs#real corrected-email signup renders the current verified email in My space
        status: pass
    human_judgment: false
duration: 3min implementation and test interval; orchestration time excluded
completed: 2026-10-15
status: complete
gap_closure: true
gap_ids: [G-02-7]
---

# Plan 02-08: Current verified workspace email

My space now identifies the signed-in account by its current verified email, including accounts whose retained display name still contains an abandoned signup address.

## Task commits

1. Task 1 RED: cd01f26 — account-flow assertions reproduced both the display-name contract and corrected-address failures.
2. Task 1 GREEN: 5ece2db — workspace response reads verified session.user.email.
3. Task 2: 1ec83f8 — actual-backend UI regression follows signup, correction, confirmation and fresh login through workspace rendering.

Measured from base d68f2a8 to implementation head 1ec83f8: three commits, three source/test files, 6,901 diff characters / 4 rounded up = 1,726 estimate-scale tokens. This is not model token usage.

## Validation

- RED account suite: 10 passed, 2 expected assertion failures, exit 1. The corrected-address failure returned typo@example.test instead of correct@example.test.
- GREEN account suite: 12 passed, zero failed/skipped/TODO, 15,034.7367ms.
- UI suite: 23 passed, zero failed/skipped/TODO, 5,637.6539ms.
- Bounded full regression: 97 passed, zero failed/cancelled/skipped/TODO, exit 0, 14,865.9425ms. This includes all 32 prior-phase tests.
- Schema and UI gates pass with phase argument 02. Older codebase mapping drift remains a nonblocking warn directive, with no mapper dispatch.

## Scope and decisions

The production change is one response-field source. Existing requireVerifiedSession, no-store, user.id owner scoping and textContent rendering are retained. Neither signup defaults nor stored display names were rewritten. No dependency or external API changed.

Task 1 extended the existing correction lifecycle rather than duplicating its signup/token fixture. Task 2 adds one UI integration case after the HTTP repair; it validates the actual HTTP-to-DOM connection. No additional production UI edit was necessary.

## Acceptance remaining

The prior UAT has eleven passing browser checks. The targeted post-fix My space observation still needs the reloaded fixture and user confirmation. Production-like HTTPS Secure-cookie enforcement remains blocked on trusted HTTPS setup. Requirement IDs above record plan implementation traceability; AUTH-01/AUTH-02 and Phase 2 remain pending acceptance.

The user subsequently authorized GitHub pushes, including a twice-daily cadence. The earlier local-only instruction is superseded for publishing verified commits; no force push or merge was requested.

## Self-Check: PASSED

All three modified files exist, both tasks and all acceptance assertions have automated coverage, the task commits are present, and the full regression passed. This self-check does not claim a new physical-browser observation or HTTPS acceptance.
