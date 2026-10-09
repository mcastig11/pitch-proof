---
phase: 02-private-practice-access
plan: 04
subsystem: auth
tags: [better-auth, sqlite, sessions, verification, concurrency, node-test]
status: complete
requires:
  - phase: 02-03
    provides: Pinned Better Auth server, verified account tracer, and atomic first-use claim
provides:
  - Fixed seven-day database sessions and one-hour one-use password recovery with all-session revocation
  - Same-origin auth mutations, bounded IP/account throttles, generic public responses, and no-store headers
  - Credential-authenticated pending address correction and one-use revocable verification links
  - Normalized unique signup and bounded 30-day pending-account cleanup
affects: [02-05, 02-06, 02-07, private-library]
tech-stack:
  added: []
  patterns: [SQLite conditional updates, verification token digests, normalized-email uniqueness, injected-clock cleanup]
key-files:
  created:
    - .planning/phases/02-private-practice-access/02-04-T1-RED.json
    - .planning/phases/02-private-practice-access/02-04-T2-RED.json
    - .planning/phases/02-private-practice-access/02-04-T3-RED.json
  modified:
    - server/auth.mjs
    - server/db.mjs
    - server/app.mjs
    - tests/session-security.test.cjs
    - tests/auth-flow.test.cjs
    - .planning/WINDOWS.md
key-decisions:
  - Pending address correction verifies the existing email and password without issuing a private session; SQLite checks current email, verification state, and password hash atomically.
  - Verification links have a fresh nonce and a SHA-256 digest in the existing verification table bound to the user ID; correction, first use, expiry, and cleanup revoke them.
  - Pending cleanup removes at most 100 accounts per startup/auth mutation, strictly older than 30 days; exact-boundary and verified accounts remain.
  - AUTH-01 and AUTH-02 remain open until UI, ownership, and phase acceptance are complete.
requirements-completed: []
requirements-covered: [AUTH-01, AUTH-02]
coverage:
  - id: D1
    description: One-use one-hour password recovery revokes all issued cookies and requires fresh sign-in to the workspace.
    requirement: AUTH-02
    verification:
      - kind: integration
        ref: tests/session-security.test.cjs
        status: pass
    human_judgment: false
  - id: D2
    description: Auth mutations enforce Origin/Host, bounded throttling, session rotation, generic public responses, and no-store headers.
    verification:
      - kind: integration
        ref: tests/session-security.test.cjs
        status: pass
    human_judgment: false
  - id: D3
    description: Pending singers can resend confirmation and correct an address with credentials; abandoned links cannot verify a reused address.
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: tests/auth-flow.test.cjs#corrected-address signup creates a usable pending account and invalidates prior links
        status: pass
    human_judgment: false
  - id: D4
    description: Parallel normalized signup and first-use requests produce one account and one first-use claim.
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: tests/auth-flow.test.cjs#concurrent signup requests cannot create duplicate accounts or first-use claims
        status: pass
    human_judgment: false
  - id: D5
    description: Startup and auth activity remove only pending accounts strictly older than 30 days, including their credentials and links.
    verification:
      - kind: integration
        ref: tests/auth-flow.test.cjs#pending accounts are removed only after the exact cleanup cutoff on startup and auth activity
        status: pass
    human_judgment: false
  - id: D6
    description: Session persistence across a real browser restart and Secure cookies on a production-like HTTPS origin.
    requirement: AUTH-02
    verification:
      - kind: integration
        ref: tests/auth-flow.test.cjs#HTTPS auth cookies remain secure outside production
        status: pass
      - kind: manual_procedural
        ref: 02-04 Task 1 human-check; WINDOWS item 22
        status: unknown
    human_judgment: true
    rationale: HTTP tests establish cookie flags and server expiry, but do not establish persistence through a real browser restart.
actuals:
  tokens: 13544
  tasks: 3
  commits: 7
commits: 7
plan_head_before: 8679e94a365076a6993e1cc1319eb26b7fc5fc0d
duration: 18h44 elapsed including pause
completed: 2026-10-09
---

# Phase 2 Plan 4: Recovery, Sessions, and Pending Accounts Summary

**Fixed seven-day sessions, all-device reset revocation, hostile-request controls, and credential-authenticated pending correction with atomic one-use verification.**

## Performance

- First task RED committed: 2026-10-08T05:49:53Z.
- Task 3 GREEN committed: 2026-10-09T00:33:03Z; resumed GREEN segment approximately 10 minutes.
- Elapsed plan interval includes the user-requested pause and is not an active-compute measurement.
- Three tasks complete; five application/test files modified, three RED evidence records created, and the defect ledger reconciled.
- Actual tokens are `ceil(realized git diff characters / 4)` over the five application/test files and three RED evidence records from the persisted original baseline. The measured seven commits include six TDD task commits plus the mid-plan pause commit. Summary/progress commits follow this measurement.

## Accomplishments

- D-04/D-06/D-10: unverified accounts receive no private session; fixed 604800-second persistent cookies match server-enforced expiry, and resetting a password consumes the one-hour token and revokes every existing session.
- Auth requests enforce exact Origin/Host, independent bounded IP and normalized-account limits, generic signup/resend/reset responses, fresh session identifiers, and `Cache-Control: no-store`.
- D-04/D-05: pending correction checks the password through Better Auth's installed crypto API and conditionally changes the pending account without a session. A target-address collision keeps both accounts intact and returns the generic outcome.
- Verification links carry random nonces, and only stored token digests can be consumed. SQLite atomically claims the link and confirms its user. Correction deletes prior verification/reset records; first verification revokes sibling confirmation links. The abandoned address can be reused without resurrecting its old link.
- A normalized unique SQLite email index remains the creation gate. Concurrent creation conflicts become the same public confirmation response; concurrent verified first-use requests retain the existing conditional update and produce one example landing.
- Startup and subsequent auth mutations run bounded cleanup for unverified accounts strictly older than 30 days. Verified accounts and the exact 30-day boundary survive; old credentials and verification rows are removed.

## Task Commits and TDD Gate Compliance

| Task | RED | GREEN | Evidence |
|------|-----|-------|----------|
| 1: Reset and fixed session lifecycle | `93a6177` | `f86e54b` | Reset replay/expiry, every old cookie, fresh routing, and seven-day expiry pass |
| 2: Hostile requests and enumeration | `e2475a5` | `209aa52` | Origin/Host, throttles, parity, rotation, and no-store tests pass |
| 3: Atomic and recoverable pending accounts | `088012b` | `3913fdb` | Preserved RED record returned `RED_EVIDENCE_OK`; missing correction endpoint returned 404 instead of credential-denial 401 |

`1b1cdcd` preserved the user-requested pause between Task 3 RED and GREEN. Tasks 1-2 and the Task 3 RED commit were reconciled without replay. No separate refactor was required. Task attributes enable TDD even though phase-wide `tdd_mode` is false.

## Test Results

- Focused command: node --test --test-reporter=tap tests/auth-flow.test.cjs tests/session-security.test.cjs. **21 tests passed**, 0 failed, 0 skipped, 0 TODO, exit 0.
- `npm.cmd test`: **54 active tests passed**, 0 failed, 14 pre-existing TODOs, 68 total, exit 0. The TODOs are eight UI checks assigned to Plan 02-06 and six ownership checks assigned to Plan 02-07.
- Additional focused coverage confirms distinct links issued within one second, one winner under concurrent verification, expiry at one hour, protection of verified and existing target accounts, credential cascade deletion, and origin rejection on correction.
- `git diff --check` passed. Created/modified plan files contain no TODO, FIXME, skipped-test, or UI-data stubs. No live email was sent; isolated capture transports were used.

## Decisions Made

The installed Better Auth 1.7.6 implementation signs email-address links without database consumption. Its documented [email callbacks](https://better-auth.com/docs/concepts/email) are retained for delivery, and the existing verification table supplies revocation and atomic consumption without a new table or dependency installation. Password hashing/verification remains the library's responsibility.

AUTH-01/AUTH-02 are covered by this plan but remain incomplete requirements: the public UI, owner-scoped resource seam, and phase acceptance have not yet shipped.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Auth-activity cleanup needed the original Express path.**
- Found during Task 3's exact-cutoff HTTP test: Express stripped the mount prefix from `request.path`, so startup cleanup worked but activity cleanup did not run.
- Fixed by checking `request.originalUrl`; the exact millisecond boundary and restart tests pass. File: `server/app.mjs`; commit: `3913fdb`.

**2. [Rule 2 - Privacy] Suppressed library credential-state logging.**
- Installed signup code logs existing email addresses and duplicate constraint details. Disabled the library logger; application errors continue to log only sanitized failure codes. File: `server/auth.mjs`; commit: `3913fdb`.

## Deferred Validation and Ledger

- WINDOWS items 1-7 are fixed: all seven formerly pending auth-flow tests are active and passing.
- WINDOWS items 8-15 track the eight existing `tests/auth-ui.test.cjs:8-15` TODOs assigned to Plan 02-06.
- WINDOWS items 16-21 track the six existing `tests/ownership.test.cjs:8-13` TODOs assigned to Plan 02-07.
- WINDOWS item 22 remains open: **Persistent browser restart on localhost and production-like HTTPS Secure cookie checks remain human-needed at Phase 2 acceptance; HTTP cookie output and seven-day server expiry passed.** These browser checks were not performed or represented as passing here.

## Issues Encountered

The shell sandbox helper failed before process creation (`helper_unknown_error: setup refresh had errors`). Necessary elevated retries ran successfully. This infrastructure error was not classified as an application failure. No authentication gate, package installation, live email, push, merge, or deployment occurred.

## Next Phase Readiness

Plans 02-05 and 02-06 can use the hardened server. Address correction posts `{ email, password, newEmail }` to `/api/auth/correct-pending-email`; resend uses `/api/auth/send-verification-email`. Both preserve the guest example and issue no pending session. UI must use the HTTP verification route so the digest registry remains authoritative.

The process-local limiter requires a shared backend before multiple replicas are exposed. Cleanup is limited to 100 stale pending accounts per invocation, with remaining stale rows removed by subsequent activity. Production email and real browser persistence remain phase acceptance work.

## Self-Check: PASSED

All three RED evidence files and this summary exist. All six TDD task commits and the pause commit exist. The persisted original baseline measures seven commits before summary/progress closeout. Focused and full automated suites pass as recorded above; remaining human checks and future-plan TODOs are explicitly tracked.
