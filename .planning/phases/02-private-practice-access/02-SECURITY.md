---
phase: "02"
slug: private-practice-access
status: verified
threats_open: 0
asvs_level: 1
block_on: high
register_authored_at_plan_time: true
threats_total: 16
created: "2026-10-15"
---

# Phase 02 — Security

## Plan 02-08 addendum

Reviewed the repaired workspace identity and both new regression paths. The response still requires a fresh verified session and no-store; caller fields do not select identity, resource owner checks still use user.id, and the client still uses textContent. The plan's reused T-02-11/T-02-12 mitigations remain enforced. No new open threat was identified. This does not establish browser Secure-cookie enforcement on the unconfigured HTTPS origin.

Authored threat mitigations were checked at ASVS Level 1 depth against source and passing tests. This is a repository mitigation audit, not ASVS certification or production acceptance. The 22 plan-register occurrences collapse to 16 distinct controls when the repeated package checkpoint is counted once. Reused IDs with different meanings retain their plan namespace below.

## Trust Boundaries

| Boundary | Sensitive data and control |
| --- | --- |
| Browser to account server | Credentials, cookie sessions, untrusted callback and owner claims; same-origin mutation checks and verified-session guards |
| Server to SQLite | Parameterized identity-bound lookups, fixed-expiry session records, atomic token/first-use operations |
| Server to byte provider | Internal inert key only after owner-authorized metadata lookup; no public path adapter |
| Server to email | Server-only credential and token-bearing account message; HTTPS, bounded request and fixed diagnostics |
| Test fixture to storage/mail | Unique temporary database and per-fixture in-memory sink, finally teardown |

## Threat Register

| Threat / plan | Category | Component | Severity | Disposition | Mitigation evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T-02-01 / 01 | Disclosure | Captured messages | medium | mitigate | tests/support/capture-email.cjs per-fixture memory; harness isolation test | closed |
| T-02-02 / 01 | Tampering | Test database | low | mitigate | server-fixture.cjs mkdtemp plus finally closure/removal; harness test checks removal | closed |
| T-02-SC / 01–07 | Tampering | Package provenance | high | mitigate | 02-02-SUMMARY records explicit approval and signed provenance/SRI/archive checks before pinned install; package.json retains exact reviewed server versions; no dependency added during resume | closed |
| T-02-01 / 03 | Privilege | Verification/workspace | high | mitigate | server/app.mjs verifiedSession and requireVerifiedSession; anonymous/pending denial tests | closed |
| T-02-05 / 03 | Disclosure | Signup/workspace | medium | mitigate | Server-derived identity, generic public outcomes, no-store; auth-flow/session-security tests | closed |
| T-02-03 / 04 | Spoofing | Reset/verification | high | mitigate | One-use expiring tokens, digest revocation, verified-email gate, all-session reset revocation; concurrency/expiry tests | closed |
| T-02-04 / 04 | Privilege | Session lifetime | high | mitigate | 604800-second fixed database expiry, refresh/cache disabled, cookie rotation; session-security tests | closed |
| T-02-05 / 04 | Disclosure | Account responses | high | mitigate | Same Origin/Host mutation checks, normalized bounded IP/account throttles, padded generic outcomes, no-store; response-parity tests | closed |
| T-02-06 / 05 | Disclosure | Mail secrets/links | high | mitigate | server/email.mjs HTTPS Bearer request, injected transport, sanitized exceptions and fixed auth diagnostics; email tests | closed |
| T-02-07 / 05 | Denial of service | Email adapter | medium | mitigate | Request and response parsing bounded to 10 seconds, abort signal, auth rate limits; hung-fetch/body tests | closed |
| T-02-08 / 06 | Spoofing | Forms/continuation | high | mitigate | Server landing decision, same-origin safe return targets, signed confirmation receipt, URL entry allowlist after 0a97574, no browser bearer storage; auth UI and callback tests | closed |
| T-02-09 / 06 | Disclosure | Workspace expiry | high | mitigate | No-store verified reads, immediate private DOM clearing, visibility/bfcache refresh and stale-generation guards; transition tests | closed |
| T-02-10 / 06 | Denial of service | Guest example | medium | mitigate | Audio callbacks independent of auth, no auth polling in audio loop; guest-expiry test and Phase 1 regression. Physical microphone confirmation remains UAT | closed |
| T-02-02 / 07 | Disclosure | Private resource reads | critical | mitigate | session.user.id exclusively scopes mandatory SQL list/get; two-account direct HTTP tests | closed |
| T-02-11 / 07 | Privilege | Forged owner inputs | high | mitigate | Query/body/header/extra-path owner claims cannot alter session owner; forged-owner tests | closed |
| T-02-12 / 07 | Disclosure | Provider/cache | high | mitigate | Authorize before provider call; internal keys never returned, sanitized failures, attachment/nosniff/no-store; provider-call and response tests | closed |

## Accepted Risks Log

No new accepted risks or waived controls. No user risk acceptance was inferred.

Existing documented residuals: extensions/local screen capture can observe a user's rendered data; provider acceptance cannot guarantee inbox delivery; a shared rate limiter is required before multiple replicas; Phase 3's real storage provider must preserve ownership ordering. Production HTTPS, durable private storage, stable secret, verified sender and live delivery remain operator prerequisites. The audit does not claim those are configured. Browser persistence, actual Secure-cookie enforcement and device acceptance remain UAT items rather than silently accepted risks.

## Security Audit Trail

| Audit date | Controls | Closed | Blocking open | Run by |
| --- | --- | --- | --- | --- |
| 2026-10-15 | 16 (22 plan occurrences) | 16 | 0 | Codex inline, authored-register L1 short-circuit |

## Sign-Off

- [x] All planned threats have a disposition and source/test evidence.
- [x] No new accepted risk was introduced.
- [x] threats_open: 0 at the configured high threshold.
- [x] status: verified applies to authored implementation mitigations.
- [ ] Real-browser and deployment acceptance, tracked in 02-UAT.md / README.
