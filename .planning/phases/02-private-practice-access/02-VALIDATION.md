---
phase: "02"
slug: "private-practice-access"
status: validated
nyquist_compliant: false
wave_0_complete: true
automated_gaps: 0
human_acceptance: partial
audited: "2026-10-15"
created: "2026-09-28"
---

# Phase 02 — Validation Strategy

> The pre-UAT automated suite passed. Browser UAT now records eleven passing checkpoints, one diagnosed identity display defect with gap plan 02-08 ready, and one HTTPS prerequisite block. The existing sign-off contract requires the exit gate before nyquist_compliant can become true, so that field remains false.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Existing Node.js `node:test` plus HTTP integration tests against an ephemeral local server and isolated temporary SQLite database |
| Config file | `package.json`; isolated HTTP, temporary SQLite and capture-mail fixtures are implemented |
| Quick run command | `node --test tests/auth-flow.test.cjs tests/ownership.test.cjs` |
| Full suite command | `npm.cmd test` plus real-browser account, expiry, and guest-practice checks |
| Measured runtime | Final full suite 12,788ms; owner/session focused 14,748ms; account UI focused 21,455ms in a prior run |

## Sampling Rate

- **After every task commit:** Run the task's focused `node --test ...` command; run the existing example tests after any page/audio edit.
- **After every plan wave:** Run `npm.cmd test` and the auth client build check.
- **Before `$gsd-verify-work`:** Full automated suite must pass, followed by two-account browser/direct-request acceptance.
- **Max feedback latency:** A focused automated check should finish within one minute locally.

## Per-Task Verification Map

| Task / plan assignment | Requirement | Threat Ref | Secure behavior | Test type | Automated command | File exists | Status |
|------------------------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-03 account tracer | AUTH-01, AUTH-02 | T-02-01 | Pending signup denied; verified first/later routing uses server identity | HTTP integration | `node --test tests/auth-flow.test.cjs` | Yes | Pass — 12 active tests |
| 02-07 Tasks 1-2: ownership seam | AUTH-01, AUTH-02 | T-02-02 | Two accounts cannot cross-read metadata/bytes or forge owner identity | HTTP integration/repository | `node --test tests/ownership.test.cjs` | Yes | Pass — 10 active tests |
| 02-04 Task 1 and 02-06 Task 1: recovery and sessions | AUTH-02 | T-02-03 | One-use reset, fresh sign-in, all-session revocation and fixed expiry | HTTP integration | `node --test tests/auth-flow.test.cjs tests/session-security.test.cjs` | Yes | Pass |
| 02-03/02-04 cookie policy | AUTH-02 | T-02-03/T-02-04 | Fixed Max-Age=604800, HttpOnly, SameSite=Lax, HTTPS Secure and remote HTTP rejection | HTTP integration | `node --test tests/auth-flow.test.cjs tests/session-security.test.cjs` | Yes | Pass — real-browser restart/HTTPS remains manual |
| 02-06 Tasks 1-3 plus review fixes | AUTH-01, AUTH-02 | T-02-04 | Guest audio independence, private clearing, safe success states, focus and D-01–D-12 | DOM/server integration | `node --test tests/auth-ui.test.cjs tests/page-startup.test.cjs` | Yes | Pass — 22 active auth UI cases; physical/layout/speech manual |
| 02-04 Task 2: abuse controls | AUTH-01, AUTH-02 | T-02-05 | Origin/Host rejection, bounded throttles, generic account outcomes, no-store | HTTP integration | `node --test tests/session-security.test.cjs` | Yes | Pass — 9 active tests |
| 02-05 Tasks 1-2: email | AUTH-01, AUTH-02 | T-02-06 | Capture/stubbed HTTPS transport, sanitized errors and validated configuration | HTTP adapter/integration | `node --test tests/email-transport.test.cjs tests/auth-flow.test.cjs` | Yes | Pass — 10 active email tests; no live mail |
| 02-01 harness | AUTH-01, AUTH-02 | 01:T-02-01/02 | Unique databases, private captured links and complete teardown | Integration | `node --test tests/harness.test.cjs` | Yes | Pass — 1 active test |
| 02-02 provenance checkpoint | AUTH-01, AUTH-02 | T-02-SC | Human package approval precedes pinned install | Recorded checkpoint | `02-02-SUMMARY.md`; pinned package metadata | Yes | Previously approved; no new install |

## Wave 0 Requirements

- [x] Account, ownership, session and UI test files exist and run against isolated fixtures.
- [x] Server factory and private capture transport are implemented; all former TODO cases are active.
- [x] Email adapter tests cover capture and stubbed production HTTP without live mail.
## Manual-Only Verifications

| Behavior | Requirement | Why manual | Test instructions |
|----------|-------------|------------|-------------------|
| Guest microphone and pitch exploration remain usable | AUTH-01 | Browser permission and audio device behavior | In a real browser, complete the example without signing in, sing different notes, and confirm provisional pitch text updates. |
| Email and recovery flow are understandable | AUTH-01, AUTH-02 | Wording, keyboard focus, and link transitions | Create two accounts in separate browser profiles; use locally captured links; inspect pending/resend/correction/reset states and keyboard navigation. |
| Persistent sign-in and expiry behavior | AUTH-02 | Browser persistence, HTTPS cookie behavior, and visible session-ended state | On localhost with a persistent browser profile, inspect Max-Age=604800, HttpOnly, and SameSite=Lax, restart the browser and confirm the session works before expiry; use the injected clock/test expiry to verify server denial at expiry. On a production-like HTTPS origin, confirm Secure is present. |
| Production readiness before public accounts | AUTH-01, AUTH-02 | Real hosting and mail credentials are external to the repository | Confirm HTTPS, durable database/object storage, a verified sending domain, and server-only secrets before exposing real users. |

## Validation Sign-Off

- [x] Every implementation task has a focused automated check; provenance remains a recorded human gate.
- [x] No three consecutive tasks lack verification.
- [x] Wave 0 fixtures exist; no missing test infrastructure remains.
- [x] Final one-shot suite is bounded by a 120-second timeout.
- [x] Actual final feedback time: 12,788ms; 96 passed, no failed/cancelled/skipped/TODO.
- [ ] Set `nyquist_compliant: true` only after the Phase 2 tests and exit gate pass.

**Approval:** automated coverage validated; manual exit-gate approval pending in 02-UAT.md. AUTH-01/AUTH-02 remain pending in REQUIREMENTS.

**UAT update:** Browser restart and HTTP cookie settings passed. G-02-7 requires the corrected-email regression and repair in Plan 02-08. HTTPS Secure-cookie enforcement still needs a configured HTTPS fixture. The measurements in the audit below describe the pre-UAT suite, not a regression for this newly discovered defect.

**Plan 02-08 execution:** The identity repair and HTTP/backend-to-DOM regressions now pass. Latest bounded source regression: 97 passed, zero failed/cancelled/skipped/TODO, 14,865.9425ms. Phase 2 now has 65 active tests plus the existing 32 prior-phase tests. The corrected-email physical-browser recheck and HTTPS prerequisite remain pending; nyquist_compliant remains false.

## Validation Audit 2026-10-15

| Metric | Count |
| --- | --- |
| Requirements with automated behavioral coverage | 2/2 |
| Automated gaps found | 0 |
| Missing/disabled/circular requirement tests | 0 |
| Phase 2 active tests | 64 |
| Prior-phase active tests in full regression | 32 |
| Manual acceptance groups | 4, pending |

The audit found no new automated gap, so the workflow's no-gap branch required no new Nyquist test generation. The two review regression tests were added to fix concrete defects, not to inflate coverage. Existing manual-only checks remain explicit; neither source checks nor a passing Node suite establish physical microphone, rendered layout, speech or browser persistence.
