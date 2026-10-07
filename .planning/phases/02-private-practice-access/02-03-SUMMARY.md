---
phase: 02-private-practice-access
plan: 03
subsystem: auth
tags: [better-auth, express, sqlite, http-integration, tdd]
requires:
  - phase: 02-private-practice-access
    provides: Wave 0 HTTP harness and approved Better Auth 1.7.6 provenance
provides:
  - Exact reviewed server/auth and browser-build dependency pins
  - Verified email/password accounts and fixed seven-day database sessions
  - Atomic first-sign-in routing and session-derived protected workspace API
affects: [02-04, 02-05, 02-06, 02-07]
tech-stack:
  added: [better-auth@1.7.6, express@5.2.1, better-sqlite3@13.0.3, esbuild@0.28.2]
  patterns: [injectable ESM server factory, library-owned auth migrations, atomic compare-and-set onboarding]
key-files:
  created: [server/app.mjs, server/auth.mjs, server/db.mjs, .planning/phases/02-private-practice-access/02-03-RED.json, .planning/WINDOWS.md]
  modified: [package.json, package-lock.json, tests/auth-flow.test.cjs]
key-decisions:
  - "Keep identity and firstSignInCompleted server-owned; claim first use with a conditional SQLite update keyed by verified user.id."
  - "Use fixed 604800-second database sessions and persistent cookies, with refresh and cookie caching disabled."
  - "Require HTTPS outside explicit development/test loopback origins; require a server-only production auth secret."
requirements-completed: []
coverage:
  - id: D1
    description: Pending signup and verification create no private session; only verified sign-in allows workspace access.
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: "tests/auth-flow.test.cjs#verified account HTTP tracer enforces confirmation and atomic first-use routing"
        status: pass
    human_judgment: false
  - id: D2
    description: Exactly one concurrent landing request claims first use; later sign-in routes to the workspace.
    requirement: AUTH-02
    verification:
      - kind: integration
        ref: "tests/auth-flow.test.cjs#verified account HTTP tracer enforces confirmation and atomic first-use routing"
        status: pass
    human_judgment: false
  - id: D3
    description: Persistent session cookies match the seven-day database lifetime and enforce HTTPS versus loopback HTTP policy.
    requirement: AUTH-02
    verification:
      - kind: integration
        ref: "tests/auth-flow.test.cjs#HTTPS auth cookies remain secure outside production"
        status: pass
      - kind: integration
        ref: "tests/auth-flow.test.cjs#insecure remote origins and production HTTP are rejected before database setup"
        status: pass
    human_judgment: false
actuals:
  tokens: 19520
  tasks: 2
  commits: 3
commits: 3
plan_head_before: 87582728ee5415b7af7141859d60ecacfca524de
duration: 65min
completed: 2026-10-07
status: complete
---

# Phase 2 Plan 03: Verified Account HTTP Tracer Summary

**Better Auth signup, captured email verification, fixed seven-day sessions, and atomic first-use routing run through Express and a real temporary SQLite database.**

## Performance

- **Duration:** 65 min (including platform approval waits)
- **Started:** 2026-10-07T04:41:18.159Z
- **Completed:** 2026-10-07T05:46:24.879Z
- **Tasks:** 2
- **Application/package/test files:** 6
- **Actual token scale:** 19520 = ceiling of realized diff characters / 4 across the six planned application/package/test files; excludes planning metadata.

## Accomplishments

- Installed only the four reviewed exact pins; retained CommonJS package metadata and the existing Node test script. Registry versions matched, native SQLite loaded, and npm audit reported zero vulnerabilities.
- Mounted the Express 5 named-wildcard auth handler before JSON parsing. Better Auth owns password handling, verification, database sessions, and schema migrations.
- Proved signup remains unverified, issues no private session, and ignores a client-supplied onboarding flag. Confirmation changes the intended account without signing it in.
- Proved anonymous/pending requests cannot read private workspace data. Workspace identity comes from the verified server session and responses include no-store.
- Proved two concurrent landing requests return exactly one public-example first-use result and one workspace result. Later sign-in routes to the workspace.
- Proved session cookies use Max-Age=604800, HttpOnly, and SameSite=Lax; database expiry matches that lifetime. HTTPS always uses Secure, and insecure remote or production HTTP origins fail before opening storage.

## Task Commits

1. **Task 1: Exact dependency installation** — `2b0d2d0` (chore).
2. **Task 2 RED: Failing verification/private-access tracer** — `fe12b1b` (test).
3. **Task 2 GREEN: Verified account tracer and atomic first-use routing** — `a835ff0` (feat).

Summary and progress metadata are committed separately after task commits.

## Verification

- `npm.cmd ls --depth=0 better-auth express better-sqlite3 esbuild`: exact pins, valid dependency tree.
- Pre-feature `npm.cmd test`: 33 active passes, 33 expected TODO scaffolds.
- RED command: named tracer failed intentionally on anonymous workspace HTTP 200 versus required 401; persisted evidence returned `RED_EVIDENCE_OK`.
- GREEN and post-commit tracer feedback `node --test tests/auth-flow.test.cjs`: 3 active passes, 7 pre-existing future-plan TODO scaffolds, no failures.
- Full `npm.cmd test`: 36 active passes, 29 expected future-plan TODO scaffolds, no failures; approximately 1.5 seconds.
- `git diff --check`: passed. No planned verification was skipped.

## Files Created/Modified

- `package.json`, `package-lock.json`: exact dependency pins.
- `server/app.mjs`: injectable Express app, verified-session middleware, private workspace read, and landing claim.
- `server/auth.mjs`: origin and secret checks, verification callback, server-owned onboarding field, fixed session/cookie policy.
- `server/db.mjs`: private SQLite connection, Better Auth migrations, atomic first-sign-in claim.
- `tests/auth-flow.test.cjs`: real HTTP tracer, HTTPS cookie and insecure-origin checks, Windows-safe connection teardown.
- `02-03-RED.json`: intentional assertion failure evidence.
- `.planning/WINDOWS.md`: one entry for each remaining auth-flow TODO assigned to Plan 02-04.

## Decisions Made

- Authenticated landing is POST `/api/me/landing`, returning `{ destination, firstSignIn }`; workspace read is GET `/api/me/workspace`, returning session-derived identity.
- Keep normalized-email uniqueness as the explicit concurrency assumption to falsify in Plan 02-04.
- Production requires a configured server-only auth secret; local tests/development can use an ephemeral random secret. Stable sessions across server restarts require configuring BETTER_AUTH_SECRET.
- AUTH-01 and AUTH-02 remain open until recovery, browser UI, and full-phase acceptance are complete.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Close the native SQLite connection before Windows fixture cleanup**
- **Found during:** Task 2 GREEN verification.
- **Issue:** The production connection held the fixture SQLite file open during deletion, causing EBUSY and masking assertions.
- **Fix:** Close the app-owned database in the fixture callback's finally block before the shared harness removes its temporary directory.
- **Files modified:** tests/auth-flow.test.cjs.
- **Verification:** All three active auth-flow tests and the full suite pass.
- **Commit:** a835ff0.

## Known Stubs

These are retained Wave 0 test scaffolds assigned to Plan 02-04, not missing tracer functionality.

| File / line | Remaining test | Resolution |
|---|---|---|
| tests/auth-flow.test.cjs:172 | Verification resend response | 02-04 |
| tests/auth-flow.test.cjs:173 | Corrected-address signup | 02-04 |
| tests/auth-flow.test.cjs:174 | Unknown-account generic sign-in | 02-04 |
| tests/auth-flow.test.cjs:175 | Duplicate signup generic response | 02-04 |
| tests/auth-flow.test.cjs:176 | Concurrent duplicate signup | 02-04 |
| tests/auth-flow.test.cjs:177 | Password reset flow | 02-04 |
| tests/auth-flow.test.cjs:178 | Pending-account cleanup cutoff | 02-04 |

Each appears in WINDOWS.md. No production stub blocks this plan's HTTP tracer goal.

## TDD Gate Compliance

- RED: fe12b1b precedes GREEN and records the named behavior assertion failure.
- GREEN: a835ff0 passes the complete tracer and full suite.
- REFACTOR: unnecessary; no separate refactor commit.
- Violations: none. Phase-wide MVP/TDD enforcement is disabled in project config; this tracer still followed the task-level RED/GREEN contract.

## Issues Encountered

- Sandboxed npm registry access returned EACCES; the required elevated retries succeeded. Git writes required platform approval because .git is read-only in the sandbox.
- npm reported unapproved install-script notices for native packages; native SQLite loaded successfully and the reviewed esbuild installer matches its platform binary setup.

## User Setup Required

No live mail credentials were required for the tracer. Production secret, HTTPS hosting, durable storage, and live mail setup remain later-plan/release requirements.

## Next Phase Readiness

Plan 02-04 can add recovery, generic responses, rate/origin hardening, and duplicate-signup falsification. Plans 02-05 through 02-07 can connect production email, browser account flows, and owner-scoped resources. Preserve the server's database cleanup hook when adding the process entry point.

## Self-Check: PASSED

- All three server modules and the RED evidence file exist.
- Task commits 2b0d2d0, fe12b1b, and a835ff0 exist.
- The post-commit tracer feedback gate passed.
