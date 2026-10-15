---
phase: 02-private-practice-access
plan: 07
subsystem: auth
tags: [sqlite, express, ownership, private-resources]
requires:
  - phase: 02-06
    provides: Account forms and protected private workspace
provides:
  - Mandatory owner-scoped inert resource metadata repository
  - Session-authorized metadata and injected-byte HTTP routes
  - Two-account direct-request isolation tests
affects: [phase-03, private-storage]
actuals:
  tokens: 6723
  tasks: 2
  commits: 4
tech-stack:
  added: []
  patterns: [Mandatory SQL owner predicates, authorization before provider access]
key-files:
  created:
    - server/owner-resources.mjs
  modified:
    - server/db.mjs
    - server/app.mjs
    - tests/ownership.test.cjs
key-decisions:
  - Session user.id is the sole private owner identity.
  - Provider references are inert internal keys and never public paths.
  - Byte responses are attachments with nosniff and no-store.
patterns-established:
  - Foreign and absent resources have indistinguishable 404 responses.
  - No byte provider call occurs before metadata ownership succeeds.
requirements-completed: [AUTH-01, AUTH-02]
coverage:
  - id: D1
    description: List and metadata repository reads require an exact owner ID
    requirement: AUTH-02
    verification:
      - kind: unit
        ref: tests/ownership.test.cjs#repository list and get always scope metadata to the required owner
        status: pass
    human_judgment: false
  - id: D2
    description: Two accounts cannot cross-read private metadata or bytes, including forged owner input
    requirement: AUTH-02
    verification:
      - kind: integration
        ref: tests/ownership.test.cjs#forged owner identifiers cannot bypass server-side ownership checks
        status: pass
      - kind: integration
        ref: tests/ownership.test.cjs#Alice cannot read Bob resource bytes
        status: pass
    human_judgment: false
  - id: D3
    description: Pending, expired and revoked sessions fail closed before byte access
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: tests/ownership.test.cjs#pending, expired and revoked sessions cannot read any private resource
        status: pass
    human_judgment: false
  - id: D4
    description: Inert provider failures and invalid bytes preserve private no-store responses
    verification:
      - kind: integration
        ref: tests/ownership.test.cjs#byte provider failure and invalid results disclose no private bytes and remain no-store
        status: pass
    human_judgment: false
duration: 31h02 elapsed including inactive approval intervals; active time not measured
completed: 2026-10-14
status: complete
---

# Phase 2 Plan 7: Owner-Scoped Private Resource Boundary Summary

Session-derived owner predicates isolate private metadata and injected sentinel bytes across two accounts without introducing PDF storage.

## Performance

- First RED commit: 2026-10-13T20:30:06Z; final GREEN: 2026-10-15T03:32:28Z (31h02 elapsed including inactive intervals).
- Tasks: 2; commits: 4; realized diff: 6 files, 372 insertions, 10 deletions, 6,723 characters/4 tokens.
- Baseline fa9a464, final implementation 24c7f7b. No dependency install.

## Accomplishments

- SQLite metadata stores resource ID, canonical owner user ID, MIME type, byte length and inert provider key. Foreign keys cascade account deletion; an owner/resource index supports mandatory scoped lookups.
- Verified sessions authorize list, metadata and byte requests. Caller owner claims in query, body, headers and extra URL segments cannot change ownership. Foreign/missing resources return the same 404; anonymous, unverified, expired and revoked sessions return 401.
- The injected provider runs only after ownership succeeds. It returns validated byte buffers, with attachment/nosniff/no-store headers. Provider errors return fixed messages. Provider keys and owner IDs are excluded from public metadata.
- Ten active ownership tests replace all six ownership TODOs and add repository, session-state and provider-failure coverage. Guest practice stays public/provisional and ownerless.

## Task Commits and TDD Gate Compliance

| Task | RED | GREEN |
| --- | --- | --- |
| 1: Mandatory owner-scoped repository | 93998b1 | f585f19 |
| 2: Direct metadata and byte isolation | ba3cd98 | 24c7f7b |

Both saved RED records returned RED_EVIDENCE_OK. Task 1 failed on the absent repository export; Task 2 failed on missing authorization routes (404 instead of 401). Both GREEN checks passed. No separate refactor commit was required.

## Test Results

- `node --test --test-reporter=tap tests/ownership.test.cjs tests/session-security.test.cjs`: 19 passed, no failure, skip or TODO, exit 0, 14,748ms.
- `npm.cmd test`: 94 passed, no failure/cancellation/skip/TODO, exit 0, 32,316ms. Phase 1 audio, fixture, timing, startup and accessibility regressions pass.
- `git diff --check`: passed.
- The earlier Wave 4 suite passed 84 tests with six ownership TODOs; those are now active passing assertions.

## Decisions Made

Followed D-01/D-07: the guest example has no private owner identity and the empty workspace makes no upload/history claim. Phase 3 must inject a real private byte provider behind this same authorization boundary and retain the two-account tests. The standalone app has no provider or seeded private resources by default.

## Deviations from Plan

**[Rule 2 - Security] Validate injected bytes and response type.** Task 2 rejects non-byte or wrong-length provider results and forces attachment/nosniff headers. This prevents accidentally returning active provider content or private diagnostics. Files: server/owner-resources.mjs, tests/ownership.test.cjs; verified by owner-byte and provider-failure assertions; commit 24c7f7b.

Total deviations: 1 security hardening within the planned byte boundary. No PDF ingest, persisted bytes, private history or client identity source was introduced.

## Threat Flags

T-02-02/T-02-11: fresh verified session plus owner-scoped SQL defeats guessed IDs and forged owner claims. T-02-12: metadata authorization precedes provider access; all private outcomes are no-store; errors do not echo provider details. Phase 3 storage must preserve this ordering. Package provenance checkpoint remains intact; no package was added.

## Issues Encountered

Sandbox process initialization remains unavailable; approved escalated shell operations succeeded. Inactive approval intervals span two local dates. All source tasks ran sequentially; unrelated dispatch sentinel changes are excluded.

## User Setup Required

No setup for the inert seam. Real account deployment still needs the production email/HTTPS/durable-storage configuration in README and human acceptance.

## Next Phase Readiness

All seven Phase 2 plans have implementation summaries. Phase review, validation/security/UI audits and real-browser acceptance remain required. AUTH-01/AUTH-02 remain open pending phase acceptance despite their copied traceability IDs above. Do not advance to Phase 3 on implementation tests alone.

## Self-Check: PASSED

Created module and all four task commits exist. Both task RED checks and focused/full GREEN results are recorded. No skipped tests or ownership TODOs remain; no real storage provider or live email call was made.
