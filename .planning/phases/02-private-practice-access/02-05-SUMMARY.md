---
phase: 02-private-practice-access
plan: 05
subsystem: auth
tags: [resend, email, capture, fetch, configuration, node-test]
status: complete
requires:
  - phase: 02-04
    provides: Hardened account callbacks, pending confirmation, recovery, and generic public responses
provides:
  - Private local capture and server-only transactional Resend transports behind the same mail callback
  - Sanitized delivery errors, account-existence parity, and bounded HTTPS provider requests
  - Validated executable server configuration and production email prerequisites
affects: [02-06, 02-07, production-setup]
tech-stack:
  added: []
  patterns: [injected fetch, private in-memory mail capture, public asset allowlist, environment validation before storage]
key-files:
  created:
    - server/email.mjs
    - server/index.mjs
    - tests/email-transport.test.cjs
    - .planning/phases/02-private-practice-access/02-05-T1-RED.json
  modified:
    - server/auth.mjs
    - README.md
    - .planning/phases/02-private-practice-access/COVERAGE.md
key-decisions:
  - Provider adapters reject sanitized failures; auth callbacks log only a fixed server diagnostic and preserve generic public responses so delivery outages cannot reveal account existence.
  - Development/test startup captures mail only on local origins; production requires HTTPS, private durable SQLite storage, a stable auth secret, and valid server-only Resend settings.
  - AUTH-01 and AUTH-02 remain open for UI, ownership, and full phase acceptance.
requirements-completed: []
requirements-covered: [AUTH-01, AUTH-02]
coverage:
  - id: D1
    description: Capture and Resend transports deliver confirmation/reset messages through the same account callbacks without real network mail in tests.
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: tests/email-transport.test.cjs#capture transport and Resend are interchangeable at verification and reset callbacks
        status: pass
    human_judgment: false
  - id: D2
    description: HTTPS email requests validate acceptance, timeout, redirect handling, message scope, and fixed private diagnostics.
    verification:
      - kind: unit
        ref: tests/email-transport.test.cjs
        status: pass
    human_judgment: false
  - id: D3
    description: Production prerequisites fail closed, local capture remains private, and the public server excludes private files and email inspectors.
    verification:
      - kind: integration
        ref: tests/email-transport.test.cjs#production startup rejects missing mail settings and unsafe origins without exposing values
        status: pass
      - kind: integration
        ref: tests/email-transport.test.cjs#local startup captures mail and exposes only declared public assets
        status: pass
    human_judgment: false
  - id: D4
    description: Resend service scope declares one integration and reasoned exclusions for every other API family.
    verification:
      - kind: other
        ref: api-coverage.verify-pre .planning/phases/02-private-practice-access
        status: pass
    human_judgment: false
actuals:
  tokens: 9893
  tasks: 2
  commits: 3
commits: 3
plan_head_before: ed3ad73c4f8c728be38eea7a59715c9ceb02ff18
duration: 8min
completed: 2026-10-09
---

# Phase 2 Plan 5: Server Account Email Summary

**Injectable private capture and Resend account mail with bounded HTTPS delivery, sanitized failures, validated startup, and explicit production prerequisites.**

## Performance

- Recorded implementation start: 2026-10-09T00:49:49Z.
- Production tasks completed: 2026-10-09T00:57:17Z; approximately eight minutes, excluding initial context reads.
- Two tasks complete; seven application/test/coverage/evidence files changed.
- Actual tokens are ceil(realized git diff characters / 4) over the seven task files from the persisted baseline. Three commits were measured before summary/progress closeout.

## Accomplishments

- D-04/D-06: confirmation and password-reset callbacks accept the same injected send interface. Capture messages remain private in process memory; tests inspect only their own transport instance.
- Resend sends one recipient one message through the documented [HTTPS email endpoint](https://resend.com/docs/api-reference/emails/send-email), using a server-only Bearer key, configured sender, text and escaped HTML. Redirects, unsuccessful responses, malformed acceptance bodies, unsupported message kinds, unsafe links, and malformed recipients are rejected.
- Request and response-body waits are bounded to 10 seconds, with an abort signal. All failures discard raw provider exceptions and produce a fixed error message/code with no cause, address, key, or token-bearing link.
- Auth callbacks record fixed server diagnostics for delivery failures while retaining identical public signup/resend/reset outcomes. Mail failure never creates a pending-account session; users can request another message.
- Startup validates production settings before opening storage. Production requires an HTTPS public origin, durable absolute SQLite path, a stable auth secret, and Resend key/sender. Local capture is limited to local development/test origins and has no public inspector.
- The executable server serves only declared public browser assets. README documents guest practice, Phase 1 checks, local capture, private persistence, [sender verification](https://resend.com/docs/dashboard/domains/introduction), [key permissions](https://resend.com/docs/dashboard/api-keys/introduction), HTTPS proxy Host behavior, and later production prerequisites.
- The complete current Resend capability matrix has 28 rows: one single-send integration and 27 justified opt-outs, including inbox agent settings.

## Task Commits and TDD Gate Compliance

| Task | Commit | Result |
| --- | --- | --- |
| 1 RED: Account email request behavior | 4ac386f | Named assertion failed intentionally: zero requests instead of one; saved record returned RED_EVIDENCE_OK |
| 1 GREEN: Injected capture/Resend delivery | f954897 | All 20 focused email/auth tests passed |
| 2: Startup, documentation, and API scope | df32a07 | All 22 focused tests, full regression, and coverage checks passed |

Task 1 explicitly enables TDD although phase-wide tdd_mode is false. No separate refactor was required. Initial integration checks exposed two test-fixture assumptions: reset tokens are in a path, and Node fetch derives Host from its connection URL. Assertions now follow the existing reset contract and use the HTTP fixture's explicit proxy Host.

## Test Results

- Focused command: node --test --test-reporter=tap tests/email-transport.test.cjs tests/auth-flow.test.cjs. **22 passed**, 0 failed, 0 skipped, 0 TODO, exit 0.
- Full command: npm.cmd test. **64 active tests passed**, 0 failed, 14 pre-existing TODOs, 78 total, exit 0. Guest fixture, audio, position, startup, accessibility, auth, and security regressions passed.
- Coverage command: node C:/Users/casti/.codex/gsd-core/bin/gsd-tools.cjs check api-coverage.verify-pre .planning/phases/02-private-practice-access. Passed: 28 capabilities, one integrate, 27 opt-outs, no blocking findings.
- Whitespace check passed. Product source has no TODO, FIXME, unfinished mail implementation, or private UI data stub. No live provider call or real email was made.

## Decisions Made

No dependency was installed. Built-in fetch implements the verified [Resend request contract](https://resend.com/docs/api-reference/emails/send-email), and the existing [Better Auth email callbacks](https://better-auth.com/docs/concepts/email) remain the injection boundary. API configuration and messages never enter browser assets.

AUTH-01/AUTH-02 remain incomplete until UI, ownership, and full phase acceptance are complete. Existing WINDOWS items 8-21 cover the future UI/ownership TODOs; item 22 retains the human browser-restart and production-like Secure-cookie check. No new skipped verification or stub was introduced.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Privacy] Delivery failures must preserve account-existence parity.**
- Found during Task 1 integration design: propagating callback failures would distinguish a known address whose delivery failed from an unknown address that sends no mail.
- The adapter still rejects a sanitized failure as planned. Auth callbacks catch it, emit only the fixed server error code, and preserve generic public outcomes so retries remain possible.
- File: server/auth.mjs; commit: f954897. The known/unknown failure parity test passes with an intentionally failing injected transport.

**2. [Rule 2 - Security] Replaced obsolete browser-key setup instructions.**
- Found during Task 2: README still instructed inserting an Anthropic key into browser code and described the obsolete coaching/recording prototype.
- Replaced it with accurate current guest/Phase 1 practice instructions and server-only email setup. The working static example command is retained; no client key instruction remains.
- File: README.md; commit: df32a07.

## Threat Flags

| Flag | File | Description |
| --- | --- | --- |
| threat_flag: public-file-access | server/index.mjs | Startup also exposes the existing guest browser assets through a fixed allowlist; repository directories, configuration, private modules, and mail inspectors return 404 in integration tests. |

## Issues Encountered

The default shell helper failed before process startup with helper_unknown_error/setup refresh errors. Necessary approved elevated shell calls succeeded. No auth gate, install, push, merge, or deployment occurred. The unrelated dispatch sentinel and separately prepared UI contract were excluded from task commits.

## User Setup Required

Only later real production delivery requires Resend account/domain verification and server environment credentials. README lists the exact required fields. These prerequisites did not block capture/stub tests; this work provisioned no host, secret, domain, or live mail.

## Next Phase Readiness

Plan 02-06 can use the account server and email callbacks. Its public UI routes and bundled assets must be added to server/index.mjs's explicit asset/routes mapping. Local standalone capture has no public token inspector; test/browser fixtures must inject and inspect their own transport when exercising account confirmation.

The default local database is in memory and disappears on restart; choose a private SQLite path plus a stable auth secret for local persistence. Production needs a configured host, HTTPS, durable storage, verified sending domain, and operator delivery monitoring before real accounts are exposed. Provider acceptance cannot establish inbox delivery. Existing process-local auth throttles require a shared limiter before multiple replicas.

## Self-Check: PASSED

All four created files exist and all three task commits exist. The persisted baseline measures three task commits before metadata closeout. Required focused, regression, and API checks pass with no new deferred defect. Remaining browser and future-plan checks are explicitly retained above.
