---
status: testing
phase: 02-private-practice-access
source: [02-VERIFICATION.md]
started: 2026-10-15T15:41:44Z
updated: 2026-10-15T16:46:40Z
---

## Current Test

number: 6
name: Confirm the second account and check separate workspace identities
expected: |
  Open [Confirm Bob's email](C:/Users/casti/AppData/Local/Temp/pitch-proof-browser-uat-1xCAgs/confirm-bob-email.url).
  You should see Email confirmed without automatic sign-in.
  The shortcut may open in your default profile; confirmation alone should leave Alice's session unchanged.
  Switch back to Bob's SECOND profile or private window for the sign-in step.
  Open http://localhost:31317/auth?mode=signin and sign in as bob@example.test with Bob's local-test password.
  Bob's first sign-in should open the example. Select My space; it should show Bob's identity.
  In Alice's original profile, open http://localhost:31317/workspace; it should still show Alice's identity.
  Each profile should retain its own account without switching the other profile's identity.
awaiting: user response

## Test Setup

Browser-test fixture started on 2026-10-15 at http://localhost:31317, bound to 127.0.0.1. It uses the unchanged standalone server, a separate private temporary SQLite database and a stable in-memory test secret. Account messages stay in the fixture's private capture transport; no real mail or public token inspector is used. The controlling agent holds the Node session for confirmation/reset links and controlled stored-session expiry. Check server health before resuming after an interruption. No connected browser was exposed to automation; the user performs the browser actions.

The original four acceptance groups are preserved below. The account lifecycle group is split into seven observable checks, giving ten checkpoints in total. Second-account signup and confirmation are separate so a captured link can be prepared between them. No result was inferred during restructuring.

Run through `$gsd-verify-work 2` with a connected real browser and microphone. Use disposable local accounts and an injected capture-email fixture to open confirmation/reset links privately. The ordinary `node server/index.mjs` process intentionally has no captured-mail inspector and does not print links; it cannot by itself complete this test's email steps. Do not add a public token endpoint or send real mail as a workaround.

For controlled expiry, the fixture can inject createApp's clock and advance it while the browser remains open; do not wait seven days or change the production lifetime. For the restart test, use a private persistent SQLite path and stable server secret, plus a persistent browser profile. The default CLI database is in memory and is unsuitable for persistence acceptance. HTTPS acceptance requires a configured production-like HTTPS origin; none was provisioned during implementation.

Automated evidence is already recorded: 96 passing tests, no skipped/TODO tests; two-account metadata/byte requests and old-cookie reset revocation pass. This UAT covers remaining real-browser observations, not a replay of completed source tasks.

## Tests

### 1. Create an account and see the pending-confirmation state
expected: At http://localhost:31317/auth?mode=signup create alice@example.test with a local-test-only password. See Check your email, required-confirmation copy, Resend confirmation email, Correct email address, and Try the example. Before confirmation, opening /workspace must not reveal private home content. No real email is sent; the confirmation link will be opened from the private capture fixture later.
result: pass

### 2. Resend, correct an address and continue to the public example
expected: Resend shows the generic check-email outcome without a duplicate request. Address correction requires the pending account's current email and password and returns to the pending state for the corrected address. The old confirmation link no longer works, the new link remains usable, and Try the example returns to public practice without requiring account access. The agent retrieves only this fixture's captured links as needed.
result: pass

### 3. Confirm email and complete the first verified sign-in
expected: Open the current private captured confirmation link. See Email confirmed and Sign in to continue without automatic private access. First verified sign-in opens the public example with My space and Account navigation. Crafted /auth?mode=verified and /auth?mode=updated URLs show Sign in, not a fabricated success result.
result: pass

### 4. Open private space in another tab and sign out
expected: A new tab in the same browser profile opens /workspace without another sign-in. My space shows the same authenticated identity, Try the example and the scores-coming note, with no empty score library or saved-history claim. Account contains Sign out; signing out returns to equally weighted public welcome actions. Signing in again opens My space directly; other tabs in that profile share the valid session.
result: pass

### 5. Create a second account in a separate browser profile
expected: Keep Alice signed in in the original profile. In a separate profile or private-browsing window, create bob@example.test with a different local-test-only password. That browser must not inherit Alice's cookies or show Alice's identity. Bob reaches the pending-confirmation screen and cannot open private content before confirmation. The agent prepares Bob's captured link for the next checkpoint.
result: pass

### 6. Confirm the second account and check separate workspace identities
expected: Open Bob's captured confirmation in the second profile and sign in as bob@example.test. First sign-in opens the example; My space shows Bob's identity. In the original profile, Alice's My space continues to show Alice's identity. Neither profile's identity changes to the other's; no private metadata or bytes from the other account are exposed. Direct resource isolation is additionally covered by the automated two-account tests.
result: [pending]

### 7. Recover a forgotten password and end old sessions
expected: With the same account signed in in two browser profiles, request recovery and open its private captured reset link. Set a new local-test-only password yourself. See Password updated and a fresh Sign in step; both old browser sessions lose private access. The old password no longer works. Fresh sign-in with the new password opens My space, and a used reset link cannot reset again. Do not share either password in chat.
result: [pending]

### 8. Real microphone practice through controlled account expiry
expected: Grant microphone permission and complete the public example without an account, singing different notes to change provisional observations. Repeat while signed in, advance the fixture clock past expiry during an attempt, and confirm capture, count-in/position and provisional observations continue without popup, redirect or focus theft. My space next requires sign-in. In an open workspace, expiry removes identity/content and shows the explicit session-ended prompt; signing in returns to My space. The exact quiet invitation appears near the example and once after an actual attempt, with no popup or repeated retry prompt.
result: [pending]

### 9. Keyboard, layout, zoom and spoken feedback
expected: Traverse signup, sign-in, pending/resend/correction, reset, workspace and welcome by keyboard. All labels, focus rings and recovery controls work; validation focuses the first invalid input, server errors retain error focus, Account Escape restores its trigger, and sign-out failure is focusable/retryable. At 320px, 600px, desktop and 200% zoom, long identity/errors/actions wrap without clipping or page overflow. With a screen reader, hear useful progress/error/expiry changes without credentials, redundant account identity, per-pitch or per-beat chatter. State remains understandable without color.
result: [pending]

### 10. Persistent restart and real HTTPS cookie enforcement
expected: With durable private SQLite and a stable server secret, sign in in a persistent browser profile, inspect the cookie's Max-Age=604800, HttpOnly and SameSite=Lax, restart the browser, and return to the same private workspace before expiry. On a configured HTTPS origin, confirm Secure is set and enforced by the browser. At controlled exact expiry, private requests fail and the visible workspace clears. Production-like storage/HTTPS setup is a prerequisite, not an observed result. This closes WINDOWS item 22 only after actual observations are recorded.
result: [pending]

## Summary

total: 10
passed: 5
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

No demonstrated implementation gap remains after the review fixes. Tests 1–5 passed on the user's browser reports; five checkpoints remain pending. Test 4 includes shared sign-in across tabs and later landing; Test 5 confirms that a separate profile does not inherit Alice's session and that Bob remains blocked before confirmation. The fixture independently confirmed Bob is unverified and has a captured confirmation link. The five-pass checkpoint is saved before continuing. Phase 2 and AUTH-01/AUTH-02 stay pending until the remaining acceptance is recorded.

## Session Notes

- After passing Test 3, the user asked whether each newly opened tab requires sign-in. Clarified that tabs in the same browser profile share the valid cookie session; separate profiles/private browsing have separate cookie stores. Explicit crafted auth URLs display sign-in forms to test safe state selection and do not sign the user out. This was a question, not a reported failure. Test 4 now observes shared sign-in across tabs directly.
