---
phase: 02-private-practice-access
verified: 2026-10-15T20:10:31Z
status: human_needed
score: 18/20 must-haves verified
covered_files:
  - .gitignore
  - .planning/REQUIREMENTS.md
  - .planning/ROADMAP.md
  - .planning/phases/02-private-practice-access/02-01-PLAN.md
  - .planning/phases/02-private-practice-access/02-01-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-02-PLAN.md
  - .planning/phases/02-private-practice-access/02-02-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-03-PLAN.md
  - .planning/phases/02-private-practice-access/02-03-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-04-PLAN.md
  - .planning/phases/02-private-practice-access/02-04-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-05-PLAN.md
  - .planning/phases/02-private-practice-access/02-05-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-06-PLAN.md
  - .planning/phases/02-private-practice-access/02-06-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-07-PLAN.md
  - .planning/phases/02-private-practice-access/02-07-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-08-PLAN.md
  - .planning/phases/02-private-practice-access/02-08-SUMMARY.md
  - .planning/phases/02-private-practice-access/02-UAT.md
  - .planning/phases/02-private-practice-access/02-CONTEXT.md
  - .planning/phases/02-private-practice-access/02-UI-SPEC.md
  - README.md
  - auth.html
  - client/auth.js
  - client/workspace.js
  - index.html
  - package-lock.json
  - package.json
  - script.js
  - scripts/push-verified-work.ps1
  - server/app.mjs
  - server/auth.mjs
  - server/db.mjs
  - server/email.mjs
  - server/index.mjs
  - server/owner-resources.mjs
  - tests/auth-flow.test.cjs
  - tests/auth-ui.test.cjs
  - tests/email-transport.test.cjs
  - tests/harness.test.cjs
  - tests/ownership.test.cjs
  - tests/session-security.test.cjs
  - tests/support/browser-harness.cjs
  - tests/support/capture-email.cjs
  - tests/support/server-fixture.cjs
  - welcome.html
  - workspace.html
covered_digest: "v1:sha256:4631c2adf3d8a8e86732f57af9e133bb75132efb20e7c7b604fe4a64175a5f92"
behavior_unverified: 2
overrides_applied: 0
decision_coverage:
  honored: 12
  total: 12
  not_honored: []
behavior_unverified_items:
  - truth: Corrected email is shown in My space after the repair
    test: UAT Test 14, fresh sign-in as alice.corrected@example.test
    expected: Signed in as shows the corrected verified email
    why_human: HTTP and actual-backend DOM regressions pass; the repaired physical-browser value needs confirmation
  - truth: Actual HTTPS Secure-cookie enforcement
    test: UAT Test 13 on a configured trusted HTTPS origin
    expected: Secure is set and enforced by the browser
    why_human: The available HTTP localhost fixture cannot establish this observation
human_verification:
  - test: Corrected email in My space after the repair
    expected: UAT Test 14 shows alice.corrected@example.test after fresh sign-in
    why_human: Targeted confirmation of the repaired browser-reported defect
  - test: Actual HTTPS Secure-cookie enforcement
    expected: UAT Test 13 passes on a configured trusted HTTPS origin
    why_human: Trusted HTTPS setup is missing; keep this prerequisite blocked
---

# Phase 2: Private Practice Access Verification

**Goal:** As a singer, I want to securely access my private practice space, so that my account stays private.

**Status:** human_needed. All eight plans are implemented and summarized. Plan 02-08 repairs the UAT identity defect and the bounded full suite passes 97 tests. Eleven browser checks passed. The targeted post-fix identity observation and actual HTTPS enforcement remain open. Phase 2 and AUTH-01/AUTH-02 stay pending; no override or acceptance was inferred.

Verification ran inline using the skills' Codex fallback. No independent verifier/sub-agent was spawned. Evidence comes from current implementation, actual HTTP/SQLite and DOM tests, not summary claims alone.

## User Flow Coverage

| Step | Expected | Actual evidence | Status |
| --- | --- | --- | --- |
| Public entry | Example usable without account | Unprotected asset routes, local audio controller, guest-expiry/startup tests | VERIFIED in automated seams; real device pending |
| Register/pending | Confirm before private access, resend/correct and guest escape | Auth HTTP tracer, correction/token tests, native forms and event-driven DOM checks | VERIFIED automatically; real browser UAT 1 |
| Confirm and sign in | No session on confirmation; first use to example, later use to My space | SQLite session assertions, conditional first-use update, server-selected landing, callback/URL-mode tests | VERIFIED automatically |
| Open private space | Real session identity; no upload/history claim | Authenticated no-store route and text-only workspace rendering; stale-result/expiry tests | VERIFIED automatically |
| Recover | One-use expiring reset, all devices signed out, fresh sign-in to workspace | Multi-cookie reset/expiry/concurrency tests and UI integration | VERIFIED automatically |
| Protect resources | Only current account can read metadata or injected bytes | Mandatory SQL owner filters; two-account HTTP and forged-owner/provider-call tests | VERIFIED |
| Sign out/expire | Server invalidation; clear private DOM; welcome or safe reauthentication | Session-security and account UI transition tests | VERIFIED automatically |
| Real browser/device acceptance | Usable microphone, rendered/accessibility flows and persistent HTTPS session | Eleven user-reported UAT passes; targeted repaired identity and HTTPS remain | PARTIAL |

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Roadmap SC1: register and return to the same private workspace after sign-out/sign-in | VERIFIED | auth-flow tracer and real server UI integration use the same database-backed user identity |
| 2 | Roadmap SC2: forgotten-password recovery regains access | VERIFIED | reset-password HTTP and UI flows require fresh login and reject old credentials |
| 3 | Roadmap SC3: a second account cannot read the first account's private resources | VERIFIED | ownership tests cover list/metadata/bytes and forged identity inputs |
| 4 | D-01: public example remains ownerless and provisional | VERIFIED automatically | public asset mapping, unchanged audio ownership, startup/practice/guest-expiry tests |
| 5 | D-02: quiet inline invitation and once-per-attempt-page placement | VERIFIED automatically | exact invitation/event and retry assertions |
| 6 | D-03: invitation uses locked copy and implies no PDF availability | VERIFIED | exact-copy test and index.html |
| 7 | D-04: pending verification blocks private access with resend/correction/guest escape | VERIFIED | credential-gated correction, revoked links, pending DOM states and direct 401 tests |
| 8 | D-05: first verified sign-in to example; later sign-in to workspace | VERIFIED | atomic first-use claim plus concurrent landing and UI assertions |
| 9 | D-07: simple private home with current verified email/example/scores-coming only | HUMAN RECHECK NEEDED | Plan 02-08 HTTP and actual-backend DOM regressions pass; UAT 14 pending |
| 10 | D-08: My space and modest Account/sign-out navigation | VERIFIED | signed-in example and disclosure/Escape tests |
| 11 | D-09: sign-out opens equal-weight welcome actions | VERIFIED | server invalidation, UI navigation and identical welcome action assertions |
| 12 | D-10 server portion: fixed seven-day sessions and cookie policy | VERIFIED | exact Max-Age and database lifetime, no refresh/cache, HTTPS-header and origin rejection tests |
| 13 | D-12: private expiry clears identity, rejects stale replies and returns safely after login | VERIFIED | 401/visibility/network/stale-generation DOM tests and safe landing logic |
| 14 | Resource authorization precedes byte access and all outcomes are no-store | VERIFIED | scoped SQL + provider-call counts, anonymous/foreign/expired/revoked and failure tests |
| 15 | Credentials and account links stay server-side; transport is private and bounded | VERIFIED | explicit static allowlist, negative browser storage test, capture/Resend timeout/sanitization tests |
| 16 | Approved package checkpoint and isolated test lifecycle are preserved | VERIFIED | recorded provenance approval/pinned dependency metadata and unique-database/capture/teardown test |
| 17 | No PDF byte persistence, private history or authoritative guest grade is introduced | VERIFIED | metadata-only schema/repository tests, no storage adapter, retained provisional practice contracts |
| 18 | Browser restart and actual HTTPS enforcement meet D-10 | PARTIAL — human needed | UAT 12 restart/HTTP cookies passed; HTTPS UAT 13 blocked |
| 19 | Physical microphone practice remains uninterrupted through expiry, D-01/D-11 | VERIFIED by user | Staged UAT 10 confirmed expiry, continuity and reauthentication |
| 20 | Keyboard, responsive/zoomed layout and spoken announcements meet the UI contract | VERIFIED by user | UAT 11 pass; no unperformed subchecks reported |

**Score:** 18/20 implementation/behavior truths fully verified; targeted repaired identity and HTTPS enforcement remain open. No truth is marked passed by override.

### Required Artifacts

| Artifact group | Exists/substantive/wired | Evidence |
| --- | --- | --- |
| server/app.mjs, auth.mjs, db.mjs | Yes | Executable startup, Better Auth callbacks, SQLite mutations and verified-session guards exercised by HTTP tests |
| server/owner-resources.mjs | Yes | Imported by app, migration invoked after auth migration, router requires a verified session; owner and provider ordering exercised |
| server/email.mjs, index.mjs | Yes | Capture/Resend injection, validated startup and explicit public asset allowlist exercised |
| auth.html, client/auth.js | Yes | Served explicit route/assets; native form event handlers call real endpoints and consume safe server continuation |
| workspace.html, welcome.html, client/workspace.js | Yes | Protected workspace page, authenticated data rendering, expiry clearing and public welcome navigation exercised |
| index.html, script.js integration | Yes | Quiet invitations, account navigation and attempt-ended event connect without moving auth into audio callbacks |
| Six Phase 2 test files/support helpers | Yes | 65 active tests in final suite; no disabled requirement tests or missing fixtures |
| Package provenance evidence | Yes | 02-02 recorded human checkpoint and pinned metadata; no new package installation |
| 02-REVIEW/VALIDATION/SECURITY/UI-REVIEW | Yes | Required execute/verify audits persisted with explicit browser limits |

The generic verify.artifacts query passes the object-style artifact declarations in Plans 01/03. Plan 02 is a checkpoint without an artifacts field. String-style lists in Plans 04–07 yield an empty CLI result, so these were checked directly for file content, imports/routes and tested behavior instead; an empty generic result is not treated as a successful artifact check.

### Key Links and Data Flow

| Source | Boundary | Sink / real data | Status |
| --- | --- | --- | --- |
| Form submit | Same-origin fetch and Origin/Host checks | Better Auth -> SQLite/captured email -> public response | WIRED and exercised |
| Session cookie | Fresh auth.api.getSession and emailVerified/expiry checks | Server session.user.email -> workspace identity; user.id -> resource owner | WIRED and exercised |
| Verified owner | Parameterized owner_user_id AND resource id lookup | Public metadata excludes internal owner/provider fields | WIRED and exercised |
| Authorized metadata | Await byteProvider only after scoped get succeeds | Injected sentinel Buffer -> attachment/nosniff/no-store response | WIRED and exercised; real storage explicitly out of scope |
| Confirmation/reset callbacks | Injected server transport | Private capture in tests or stub-verified HTTPS Resend request | WIRED; no live delivery claim |
| Workspace response | Generation and visibility/401 guards | Text content from authenticated identity, removed on expiry/failure | WIRED and exercised |
| Practice completion | Data-free attempt-ended event | Once-only quiet invitation | WIRED and exercised |

### Behavioral Checks and Gates

- Focused owner/session suite: **19 passed**, zero fail/skip/TODO.
- Focused Plan 02-08 account flow: **12 passed**; UI suite: **23 passed**, zero fail/skip/TODO.
- Final bounded source regression: **97 passed**, zero failed/cancelled/skipped/TODO, exit 0, **14,865.9425ms**, under 120-second timeout. Includes all **32 prior-phase tests**; no cross-phase regression.
- Account RED run reproduced the incorrect display name/address with two expected assertion failures before the one-line repair.
- Initial schema/UI gate invocations used a directory argument and failed phase lookup; both were rerun successfully with phase argument 02. The failed lookup outputs were not accepted as gate evidence.
- Browser source syntax and whitespace checks pass. No additional build is required for the served classic scripts.
- Schema drift: no blocking finding. UI safety gate: approved specification present, no block.
- Codebase map drift: advisory warn, nine structural elements, spawn_mapper=false; older maps remain stale.
- API coverage: 28 capabilities, one single-send integration, 27 reasoned opt-outs, passed.
- Decision gate: **12/12 honored**, none missing.

### Test Quality Audit

| Test file | Requirement | Active | Disabled | Circular | Strongest assertion | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| auth-flow.test.cjs | AUTH-01/02 | 12 | 0 | 0 | Multi-step HTTP/SQLite/session/token values | Covered |
| session-security.test.cjs | AUTH-01/02 | 9 | 0 | 0 | Old-cookie revocation, exact expiry, concurrency, hostile Origin/Host | Covered |
| auth-ui.test.cjs | AUTH-01/02, D-01–12 | 23 | 0 | 0 | Events -> fetch -> DOM/focus/navigation, including actual corrected-account backend rendering | Covered with browser limits |
| ownership.test.cjs | AUTH-01/02 | 10 | 0 | 0 | Two-owner lists, exact bytes/404/401, provider-call exclusion | Covered |
| email-transport.test.cjs | AUTH-01/02 | 10 | 0 | 0 | Exact HTTPS request, failure sanitization and callback integration | Covered; provider stubbed |
| harness.test.cjs | AUTH-01/02 foundation | 1 | 0 | 0 | Independent databases/mail and verified teardown | Covered |

Expected results are explicit independent account IDs, sentinel bytes, policy values and named state transitions. Temporary SQLite writes seed inputs rather than generate expected output from the implementation. The DOM helper intentionally cannot prove layout or speech; these are human items, not an automated pass.

### Requirements Coverage

| Requirement | Owning plans | Implementation evidence | Acceptance |
| --- | --- | --- | --- |
| AUTH-01 | 02-01 through 02-08 | Email/password signup, verification gate, correction/resend, repaired identity, UI and owner boundary | Targeted repaired identity browser recheck pending |
| AUTH-02 | 02-01 through 02-08 | Sign-in/recovery, fixed sessions, reset revocation, current workspace identity and two-account isolation | Targeted identity recheck and HTTPS pending; restart passed |

REQUIREMENTS checkboxes remain open. Summary traceability fields do not override phase acceptance.

### Anti-Patterns and Review Resolution

Review commit 0a97574 fixes URL-selected success states/inherited keys, error focus restoration and error color precedence. No production stub, client secret, disabled requirement test or known authorization bypass remains in the reviewed scope. The provider seam intentionally has no real storage adapter; tests inject inert bytes as the plan requires. The UI review notes a minor product-name line-height discrepancy and unobserved visuals; neither is silently represented as visual acceptance.

### Human Verification Required

The original acceptance groups are preserved as atomic checks in **02-UAT.md**. Eleven checkpoints passed, the original identity issue is retained with its implemented Plan 02-08 repair, HTTPS Test 13 remains blocked, and new Test 14 awaits confirmation of the repaired value. The local fixture has loaded the updated app module while preserving the private database, secret, capture transport and original eleven static handlers. This is readiness for browser UAT, not a new human pass.

## Gaps Summary

The stale-name root cause is fixed: GET /api/me/workspace reads the verified user's current email, preserving user.name and all guards/no-store/owner-by-user.id boundaries. Actual lifecycle tests prove the corrected address reaches the DOM. The phase remains human-needed for the targeted recheck and HTTPS setup. The user subsequently authorized GitHub publication and the verified branch was pushed. No merge, deployment or next-phase transition occurred.
