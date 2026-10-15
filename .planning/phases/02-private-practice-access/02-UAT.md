---
status: testing
phase: 02-private-practice-access
source: [02-VERIFICATION.md]
started: 2026-10-15T15:41:44Z
updated: 2026-10-15T15:41:44Z
---

## Current Test

number: 1
name: Account lifecycle and private navigation in a real browser
expected: |
  Pending accounts cannot open the workspace, confirmation does not sign in,
  first verified sign-in opens the example, later sign-in opens My space,
  recovery requires fresh sign-in and revokes every old session, and sign-out
  opens the equal-weight public welcome choices.
awaiting: user response

## Test Setup

Run through `$gsd-verify-work 2` with a connected real browser and microphone. Use disposable local accounts and an injected capture-email fixture to open confirmation/reset links privately. The ordinary `node server/index.mjs` process intentionally has no captured-mail inspector and does not print links; it cannot by itself complete this test's email steps. Do not add a public token endpoint or send real mail as a workaround.

For controlled expiry, the fixture can inject createApp's clock and advance it while the browser remains open; do not wait seven days or change the production lifetime. For the restart test, use a private persistent SQLite path and stable server secret, plus a persistent browser profile. The default CLI database is in memory and is unsuitable for persistence acceptance. HTTPS acceptance requires a configured production-like HTTPS origin; none was provisioned during implementation.

Automated evidence is already recorded: 96 passing tests, no skipped/TODO tests; two-account metadata/byte requests and old-cookie reset revocation pass. This UAT covers remaining real-browser observations, not a replay of completed source tasks.

## Tests

### 1. Account lifecycle and private navigation in a real browser
expected: Create two accounts in separate profiles using privately captured links. Before confirmation, workspace/direct private navigation requires sign-in and confirmation. Check resend, address correction and public-example escape. After confirmation, first sign-in opens the example with My space/Account; later sign-in opens the same private workspace. Account identity is rendered as text; only the example link and scores-coming note appear. Reset a forgotten password, require fresh sign-in to My space, and confirm both old browser sessions lose private access. Sign out to welcome with equally weighted Try the example and Sign in. Crafted ?mode=verified and ?mode=updated URLs show Sign in, not success.
result: [pending]

### 2. Real microphone practice through controlled account expiry
expected: Grant microphone permission and complete the public example without an account, singing different notes to change provisional observations. Repeat while signed in, advance the fixture clock past expiry during an attempt, and confirm capture, count-in/position and provisional observations continue without popup, redirect or focus theft. My space next requires sign-in. In an open workspace, expiry removes identity/content and shows the explicit session-ended prompt; signing in returns to My space. The exact quiet invitation appears near the example and once after an actual attempt, with no popup or repeated retry prompt.
result: [pending]

### 3. Keyboard, layout, zoom and spoken feedback
expected: Traverse signup, sign-in, pending/resend/correction, reset, workspace and welcome by keyboard. All labels, focus rings and recovery controls work; validation focuses the first invalid input, server errors retain error focus, Account Escape restores its trigger, and sign-out failure is focusable/retryable. At 320px, 600px, desktop and 200% zoom, long identity/errors/actions wrap without clipping or page overflow. With a screen reader, hear useful progress/error/expiry changes without credentials, redundant account identity, per-pitch or per-beat chatter. State remains understandable without color.
result: [pending]

### 4. Persistent restart and real HTTPS cookie enforcement
expected: With durable private SQLite and a stable server secret, sign in in a persistent browser profile, inspect the cookie's Max-Age=604800, HttpOnly and SameSite=Lax, restart the browser, and return to the same private workspace before expiry. On a configured HTTPS origin, confirm Secure is set and enforced by the browser. At controlled exact expiry, private requests fail and the visible workspace clears. Production-like storage/HTTPS setup is a prerequisite, not an observed result. This closes WINDOWS item 22 only after actual observations are recorded.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

No demonstrated implementation gap remains after the review fixes. All four tests await actual observations. An acknowledgment, approval of code, or prior automated pass is not a substitute for these results. Phase 2 and AUTH-01/AUTH-02 stay pending until the required acceptance is recorded.
