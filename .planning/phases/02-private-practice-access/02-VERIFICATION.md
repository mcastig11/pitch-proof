---
phase: 02-private-practice-access
verified: 2026-10-15T15:45:50Z
status: human_needed
score: 17/20 must-haves verified
covered_files:
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
covered_digest: "v1:sha256:b4dac4a9ed8a4762831bb25dd82cf1d98a56df8cf8b37bd72f1cc53a86f9faf1"
behavior_unverified: 3
overrides_applied: 0
decision_coverage:
  honored: 12
  total: 12
  not_honored: []
behavior_unverified_items:
  - truth: Sign-in survives real browser restart and actual HTTPS cookie enforcement
    test: Persistent profile, durable database and stable secret; restart before fixed expiry and inspect HTTPS cookies
    expected: Same workspace before expiry, Secure enforced on HTTPS, private denial at expiry
    why_human: HTTP cookie headers do not exercise browser persistence or HTTPS enforcement
  - truth: Real microphone practice survives sign-in expiry without interruption
    test: Sing through a controlled fixture-clock expiry during an example attempt
    expected: Capture, score position and provisional observations continue without redirect or focus theft
    why_human: Automated audio and auth seams use substituted browser/device APIs
  - truth: Rendered keyboard, layout and spoken accessibility meet the UI contract
    test: Keyboard and screen-reader traversal at required narrow widths and zoom
    expected: Usable focus, no clipping and useful selective announcements
    why_human: DOM harness does not model rendered layout or actual assistive speech
human_verification:
  - test: Account lifecycle and private navigation in a real browser
    expected: Confirmation, resend/correction, first/later landing, reset revocation, sign-out and private identity behave as described in UAT test 1
    why_human: Browser navigation, focus and understandable recovery transitions remain unobserved
  - test: Real microphone practice through controlled account expiry
    expected: Public capture and provisional observations continue; next private access requires sign-in and workspace expiry clears content
    why_human: Requires real microphone permission and audio device
  - test: Keyboard, layout, zoom and spoken feedback
    expected: All flows work at 320px, 600px, desktop and 200 percent zoom with useful screen-reader announcements
    why_human: Requires rendered browser and assistive technology observations
  - test: Persistent restart and real HTTPS cookie enforcement
    expected: Persistent verified session works after browser restart before fixed expiry; Secure is enforced on HTTPS
    why_human: Requires persistent browser profile, durable private storage, stable secret and configured HTTPS origin
---

# Phase 2: Private Practice Access Verification

**Goal:** As a singer, I want to securely access my private practice space, so that my account stays private.

**Status:** human_needed. All seven plans are implemented and summarized. No demonstrated implementation gap remains after review fixes. Three real-browser/device truths and four acceptance groups remain unverified. Phase 2 and AUTH-01/AUTH-02 stay pending; no override or user acceptance was inferred.

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
| Real browser/device acceptance | Usable microphone, rendered/accessibility flows and persistent HTTPS session | No live browser/device observation in this run | HUMAN NEEDED |

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
| 9 | D-07: simple private home with identity/example/scores-coming only | VERIFIED | authenticated identity response and text-only renderIdentity |
| 10 | D-08: My space and modest Account/sign-out navigation | VERIFIED | signed-in example and disclosure/Escape tests |
| 11 | D-09: sign-out opens equal-weight welcome actions | VERIFIED | server invalidation, UI navigation and identical welcome action assertions |
| 12 | D-10 server portion: fixed seven-day sessions and cookie policy | VERIFIED | exact Max-Age and database lifetime, no refresh/cache, HTTPS-header and origin rejection tests |
| 13 | D-12: private expiry clears identity, rejects stale replies and returns safely after login | VERIFIED | 401/visibility/network/stale-generation DOM tests and safe landing logic |
| 14 | Resource authorization precedes byte access and all outcomes are no-store | VERIFIED | scoped SQL + provider-call counts, anonymous/foreign/expired/revoked and failure tests |
| 15 | Credentials and account links stay server-side; transport is private and bounded | VERIFIED | explicit static allowlist, negative browser storage test, capture/Resend timeout/sanitization tests |
| 16 | Approved package checkpoint and isolated test lifecycle are preserved | VERIFIED | recorded provenance approval/pinned dependency metadata and unique-database/capture/teardown test |
| 17 | No PDF byte persistence, private history or authoritative guest grade is introduced | VERIFIED | metadata-only schema/repository tests, no storage adapter, retained provisional practice contracts |
| 18 | Browser restart and actual HTTPS enforcement meet D-10 | UNCERTAIN — human needed | Cookies/expiry tested at HTTP level; persistent browser/HTTPS observations missing |
| 19 | Physical microphone practice remains uninterrupted through expiry, D-01/D-11 | UNCERTAIN — human needed | Automated local-audio seam passes; actual browser/device was not observed |
| 20 | Keyboard, responsive/zoomed layout and spoken announcements meet the UI contract | UNCERTAIN — human needed | Source/DOM contracts pass; rendered and speech observations missing |

**Score:** 17/20 implementation/behavior truths verified; three explicitly unverified browser/device truths. No truth is marked passed by override.

### Required Artifacts

| Artifact group | Exists/substantive/wired | Evidence |
| --- | --- | --- |
| server/app.mjs, auth.mjs, db.mjs | Yes | Executable startup, Better Auth callbacks, SQLite mutations and verified-session guards exercised by HTTP tests |
| server/owner-resources.mjs | Yes | Imported by app, migration invoked after auth migration, router requires a verified session; owner and provider ordering exercised |
| server/email.mjs, index.mjs | Yes | Capture/Resend injection, validated startup and explicit public asset allowlist exercised |
| auth.html, client/auth.js | Yes | Served explicit route/assets; native form event handlers call real endpoints and consume safe server continuation |
| workspace.html, welcome.html, client/workspace.js | Yes | Protected workspace page, authenticated data rendering, expiry clearing and public welcome navigation exercised |
| index.html, script.js integration | Yes | Quiet invitations, account navigation and attempt-ended event connect without moving auth into audio callbacks |
| Six Phase 2 test files/support helpers | Yes | 64 active tests in final suite; no disabled requirement tests or missing fixtures |
| Package provenance evidence | Yes | 02-02 recorded human checkpoint and pinned metadata; no new package installation |
| 02-REVIEW/VALIDATION/SECURITY/UI-REVIEW | Yes | Required execute/verify audits persisted with explicit browser limits |

The generic verify.artifacts query passes the object-style artifact declarations in Plans 01/03. Plan 02 is a checkpoint without an artifacts field. String-style lists in Plans 04–07 yield an empty CLI result, so these were checked directly for file content, imports/routes and tested behavior instead; an empty generic result is not treated as a successful artifact check.

### Key Links and Data Flow

| Source | Boundary | Sink / real data | Status |
| --- | --- | --- | --- |
| Form submit | Same-origin fetch and Origin/Host checks | Better Auth -> SQLite/captured email -> public response | WIRED and exercised |
| Session cookie | Fresh auth.api.getSession and emailVerified/expiry checks | Server session.user.id -> workspace identity | WIRED and exercised |
| Verified owner | Parameterized owner_user_id AND resource id lookup | Public metadata excludes internal owner/provider fields | WIRED and exercised |
| Authorized metadata | Await byteProvider only after scoped get succeeds | Injected sentinel Buffer -> attachment/nosniff/no-store response | WIRED and exercised; real storage explicitly out of scope |
| Confirmation/reset callbacks | Injected server transport | Private capture in tests or stub-verified HTTPS Resend request | WIRED; no live delivery claim |
| Workspace response | Generation and visibility/401 guards | Text content from authenticated identity, removed on expiry/failure | WIRED and exercised |
| Practice completion | Data-free attempt-ended event | Once-only quiet invitation | WIRED and exercised |

### Behavioral Checks and Gates

- Focused owner/session suite: **19 passed**, zero fail/skip/TODO.
- Focused post-review account UI suite: **22 passed**, zero fail/skip/TODO.
- Final bounded full regression: **96 passed**, zero failed/cancelled/skipped/TODO, exit 0, **12,788ms**, under 120-second timeout. Includes all **32 prior-phase tests**; no cross-phase regression.
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
| auth-ui.test.cjs | AUTH-01/02, D-01–12 | 22 | 0 | 0 | Events -> fetch -> DOM/focus/navigation, plus real server integration | Covered with browser limits |
| ownership.test.cjs | AUTH-01/02 | 10 | 0 | 0 | Two-owner lists, exact bytes/404/401, provider-call exclusion | Covered |
| email-transport.test.cjs | AUTH-01/02 | 10 | 0 | 0 | Exact HTTPS request, failure sanitization and callback integration | Covered; provider stubbed |
| harness.test.cjs | AUTH-01/02 foundation | 1 | 0 | 0 | Independent databases/mail and verified teardown | Covered |

Expected results are explicit independent account IDs, sentinel bytes, policy values and named state transitions. Temporary SQLite writes seed inputs rather than generate expected output from the implementation. The DOM helper intentionally cannot prove layout or speech; these are human items, not an automated pass.

### Requirements Coverage

| Requirement | Owning plans | Implementation evidence | Acceptance |
| --- | --- | --- | --- |
| AUTH-01 | 02-01 through 02-07 | Email/password signup, verification gate, correction/resend, generic responses, UI and private owner boundary | Automated behavior covered; browser UAT pending |
| AUTH-02 | 02-01 through 02-07 | Sign-in/recovery, fixed sessions, all-device reset revocation, private workspace and two-account isolation | Automated behavior covered; browser/restart/HTTPS UAT pending |

REQUIREMENTS checkboxes remain open. Summary traceability fields do not override phase acceptance.

### Anti-Patterns and Review Resolution

Review commit 0a97574 fixes URL-selected success states/inherited keys, error focus restoration and error color precedence. No production stub, client secret, disabled requirement test or known authorization bypass remains in the reviewed scope. The provider seam intentionally has no real storage adapter; tests inject inert bytes as the plan requires. The UI review notes a minor product-name line-height discrepancy and unobserved visuals; neither is silently represented as visual acceptance.

### Human Verification Required

Four detailed groups are saved in **02-UAT.md**: account lifecycle/navigation; real microphone through expiry; keyboard/layout/zoom/speech; persistent browser restart/HTTPS. Production prerequisites in README are unconfigured, and the standalone local CLI cannot expose captured links. Use an injected private capture fixture for UAT rather than adding public token access.

## Gaps Summary

No demonstrated implementation blocker remains. The phase goal is not accepted yet because real-browser/device evidence is missing. This is a human-needed result, not phase completion. No push, merge, deploy or next-phase transition occurred.
