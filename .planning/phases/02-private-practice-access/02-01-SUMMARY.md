---
phase: 02-private-practice-access
plan: 01
subsystem: testing
tags: [node:test, node:sqlite, http, email-capture]

# Dependency graph
requires:
  - phase: 01-verified-example-practice
    provides: Existing Node test suite and public example practice to preserve
provides:
  - Concurrent HTTP test fixtures with isolated SQLite databases and captured email
  - Auth-flow, ownership, session-security, and account UI test entry points
affects: [02-02, 02-03, 02-04, 02-06, 02-07, auth, ownership, session-security]

# Actuals measured from the realized diff and plan commit range
actuals:
  tokens: 2519
  tasks: 3
  commits: 3
plan_head_before: e047962038fa7553eff63e33e959047af6e0f315

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Injectable app factory with per-fixture SQLite and email capture
    - Node built-in test.todo scaffolds for planned account and security cases

key-files:
  created:
    - tests/support/server-fixture.cjs
    - tests/support/capture-email.cjs
    - tests/harness.test.cjs
    - tests/auth-flow.test.cjs
    - tests/ownership.test.cjs
    - tests/session-security.test.cjs
    - tests/auth-ui.test.cjs
  modified: []

key-decisions:
  - "Use Node's built-in SQLite and test runner so the Wave 0 harness adds no packages."
  - "Keep captured email per fixture and expose message/link lookup only through the test helper."
  - "Represent later account, ownership, session, and UI assertions as explicit scaffold-only todos."

patterns-established:
  - "Test server fixtures accept createApp dependencies and always close HTTP, SQLite, and temporary files."
  - "Captured messages remain in memory and are never written to test output."

requirements-completed: []

coverage:
  - id: D1
    description: Concurrent HTTP fixtures isolate SQLite and captured email and clean up after requests.
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: tests/harness.test.cjs#concurrent HTTP fixtures isolate SQLite, captured mail, and teardown
        status: pass
    human_judgment: false
  - id: D2
    description: Auth-flow, ownership, and session-security suites load with named future validation cases.
    requirement: AUTH-02
    verification:
      - kind: integration
        ref: node --test tests/auth-flow.test.cjs tests/ownership.test.cjs tests/session-security.test.cjs
        status: pass
    human_judgment: false
  - id: D3
    description: Account UI contract cases are discovered while all established Phase 1 tests remain in the normal test command.
    requirement: AUTH-01
    verification:
      - kind: other
        ref: npm.cmd test
        status: pass
      - kind: other
        ref: package.json test script unchanged; eight baseline test files remain present
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-09-30
status: complete
---

# Phase 2 Plan 01: Wave 0 Test Harness Summary

**Isolated loopback HTTP, SQLite, and captured-email fixtures with named auth, ownership, session, and account UI test scaffolds.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-30T05:59:00Z
- **Completed:** 2026-09-30T06:11:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Added concurrent test fixtures with unique temporary SQLite files, ephemeral loopback servers, injectable app factories, and private in-memory email capture.
- Added runnable auth-flow, owner-access, session-security, and account UI test entry points for later plans to complete.
- Kept the Phase 1 test files and `npm test` discovery script unchanged; the complete suite passes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create isolated HTTP, SQLite, and captured-email fixtures** - `55d35cb` (test)
2. **Task 2: Add auth-flow, ownership, and session-security test entry points** - `a60838c` (test)
3. **Task 3: Add the account UI contract test scaffold and preserve the Phase 1 suite** - `453005e` (test)

## Files Created/Modified

- `tests/support/server-fixture.cjs` - Isolated SQLite, app factory, loopback HTTP lifecycle, and teardown.
- `tests/support/capture-email.cjs` - Per-fixture in-memory message capture and link lookup.
- `tests/harness.test.cjs` - Concurrent isolation, live HTTP request, and cleanup smoke test.
- `tests/auth-flow.test.cjs` - Account creation, verification, routing, reset, and pending-account cases.
- `tests/ownership.test.cjs` - Unauthenticated and cross-account metadata and byte access cases.
- `tests/session-security.test.cjs` - Expiry, revocation, fixation, origin, rate-limit, and cache cases.
- `tests/auth-ui.test.cjs` - Pending email, account forms, navigation, expiry, invitation, and guest continuity cases.

## Decisions Made

- Used Node's built-in `node:sqlite` `DatabaseSync`, `node:test`, and HTTP APIs without adding packages.
- Exposed captured email only to the owning fixture through test helper methods; the helper never logs message data or links.
- Kept account and security behavior as explicit `test.todo` scaffolds for their implementation plans.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The sandbox initially denied Git index writes. Task commits succeeded after requesting the required elevated Git permission, using the repository's established author identity through process-local environment variables only.

## Known Stubs

The following `test.todo` cases are intentional Wave 0 scaffolds required by this plan. They do not claim behavior is implemented; their owning later plans must replace them with active assertions before Phase 2 validation.

- `tests/auth-flow.test.cjs:8-18` (11 cases): signup, captured verification, resend, corrected address, first/later sign-in routing, generic unknown/duplicate responses, concurrent signup, password reset, and pending-account cleanup.
- `tests/ownership.test.cjs:8-13` (6 cases): unauthenticated access, Alice-to-Bob metadata and byte reads, forged owner IDs, and owner-only list/read behavior.
- `tests/session-security.test.cjs:8-15` (8 cases): fixed expiry, sign-out, all pre-reset cookies, session fixation, origin checks, rate limits, generic account responses, and private no-store responses.
- `tests/auth-ui.test.cjs:8-15` (8 cases): pending-email actions, native form semantics, first/later landing, equal welcome choices, expired workspace clearing, account menu, exact D-03 invitation, and guest practice continuity.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The isolated harness and all planned test entry points are ready for the Phase 2 implementation plans. The named TODOs above remain coverage gaps until those plans activate the assertions. No application behavior was changed by this plan.

## Self-Check: PASSED

- All seven plan files exist.
- Task commits `55d35cb`, `a60838c`, and `453005e` exist.
- The measured plan commit count before the metadata commit is 3.

---
*Phase: 02-private-practice-access*
*Completed: 2026-09-30*
