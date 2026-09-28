---
phase: "02"
slug: "private-practice-access"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-28"
---

# Phase 02 — Validation Strategy

> Tests and browser checks required before Phase 2 can claim private practice access. Plan/task IDs will be bound after plan decomposition.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Existing Node.js `node:test` plus HTTP integration tests against an ephemeral local server and isolated temporary SQLite database |
| Config file | `package.json`; server/test harness and temporary database fixtures are Wave 0 work |
| Quick run command | `node --test tests/auth-flow.test.cjs tests/ownership.test.cjs` after Wave 0 creates these files |
| Full suite command | `npm.cmd test` plus real-browser account, expiry, and guest-practice checks |
| Estimated runtime | Set after the first complete run; quick checks should remain practical after every task |

## Sampling Rate

- **After every task commit:** Run the task's focused `node --test ...` command; run the existing example tests after any page/audio edit.
- **After every plan wave:** Run `npm.cmd test` and the auth client build check.
- **Before `$gsd-verify-work`:** Full automated suite must pass, followed by two-account browser/direct-request acceptance.
- **Max feedback latency:** A focused automated check should finish within one minute locally.

## Per-Task Verification Map

| Task / plan assignment | Requirement | Threat Ref | Secure behavior | Test type | Automated command | File exists | Status |
|------------------------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| Assign during planning: account tracer | AUTH-01, AUTH-02 | T-02-01 | Unverified signup has no private access; verified first sign-in reaches example and later sign-in reaches workspace | HTTP integration | `node --test tests/auth-flow.test.cjs` | No — Wave 0 | Pending |
| Assign during planning: ownership seam | AUTH-01, AUTH-02 | T-02-02 | A second account receives no private metadata or bytes through direct resource requests | HTTP integration | `node --test tests/ownership.test.cjs` | No — Wave 0 | Pending |
| Assign during planning: recovery and sessions | AUTH-02 | T-02-03 | Reset link is one-use, requires fresh sign-in, and revokes all pre-reset cookies; sign-out and fixed expiry deny private reads | HTTP integration | `node --test tests/auth-flow.test.cjs tests/session-security.test.cjs` | No — Wave 0 | Pending |
| Assign during planning: public/private UI | AUTH-01, AUTH-02 | T-02-04 | Guest practice survives expired sign-in; workspace clears private content on 401; invite and navigation follow D-01–D-12 | DOM/browser contract | `node --test tests/auth-ui.test.cjs tests/page-startup.test.cjs` | No — Wave 0 for auth UI | Pending |
| Assign during planning: abuse controls | AUTH-01, AUTH-02 | T-02-05 | Cross-origin mutation rejected, auth routes rate-limited, account existence responses generic, no private caching | HTTP integration | `node --test tests/session-security.test.cjs` | No — Wave 0 | Pending |

## Wave 0 Requirements

- [ ] `tests/auth-flow.test.cjs` — isolated server/database and captured-email fixtures; signup, confirmation, sign-in, reset, resend, address correction.
- [ ] `tests/ownership.test.cjs` — two users and inert owner-bound metadata/object records; direct request matrix.
- [ ] `tests/session-security.test.cjs` — expiry, sign-out, all-session reset revocation, origin and rate-limit checks.
- [ ] `tests/auth-ui.test.cjs` — public example, workspace, navigation, and session-ended behavior.
- [ ] Server factory and local capture email transport to make tests deterministic without production credentials.

## Manual-Only Verifications

| Behavior | Requirement | Why manual | Test instructions |
|----------|-------------|------------|-------------------|
| Guest microphone and pitch exploration remain usable | AUTH-01 | Browser permission and audio device behavior | In a real browser, complete the example without signing in, sing different notes, and confirm provisional pitch text updates. |
| Email and recovery flow are understandable | AUTH-01, AUTH-02 | Wording, keyboard focus, and link transitions | Create two accounts in separate browser profiles; use locally captured links; inspect pending/resend/correction/reset states and keyboard navigation. |
| Persistent sign-in and expiry behavior | AUTH-02 | Browser cookie persistence and visible session-ended state | Restart the browser, confirm a still-valid session; use a shortened test lifetime to observe expiry in workspace and while the example is active. |
| Production readiness before public accounts | AUTH-01, AUTH-02 | Real hosting and mail credentials are external to the repository | Confirm HTTPS, durable database/object storage, a verified sending domain, and server-only secrets before exposing real users. |

## Validation Sign-Off

- [ ] Every plan task has a focused automated check or an explicit Wave 0 dependency.
- [ ] No three consecutive tasks lack automated verification.
- [ ] Wave 0 creates all missing test files and fixtures.
- [ ] No watch-mode command is used as a verification gate.
- [ ] Run and record the actual feedback time.
- [ ] Set `nyquist_compliant: true` only after the Phase 2 tests and exit gate pass.

**Approval:** pending execution and verification.
