---
status: complete
phase: 02-private-practice-access
source: [02-VERIFICATION.md]
started: 2026-10-15T15:41:44Z
updated: 2026-10-15T22:36:28.345Z
diagnosis: complete
---

## Current Test

[testing complete: fourteen passing checkpoints, zero unresolved issues or blocks]

## Test Setup

Browser-test fixture started on 2026-10-15 at http://localhost:31317, bound to 127.0.0.1. It uses the unchanged standalone server, a separate private temporary SQLite database and a stable in-memory test secret. Account messages stay in the fixture's private capture transport; no real mail or public token inspector is used. The controlling agent holds the Node session for confirmation/reset links and controlled stored-session expiry. Check server health before resuming after an interruption. No connected browser was exposed to automation; the user performs the browser actions.

The original four acceptance groups are preserved below. The account lifecycle group is split into nine observable checks. Microphone, accessibility, browser restart/cookies and HTTPS enforcement give thirteen checkpoints in total. Second-account signup/confirmation and reset request/completion were separated so captured links could be prepared between them. The original final group is split into the observed HTTP restart/cookie check and the blocked HTTPS check; no result was inferred during restructuring.

Test 14 was added as the targeted post-repair identity recheck. It and the repaired original checkpoint pass. Test 13 subsequently passed in actual installed Chrome over trusted local HTTPS; all fourteen entries now pass.

Run through `$gsd-verify-work 2` with a connected real browser and microphone. Use disposable local accounts and an injected capture-email fixture to open confirmation/reset links privately. The ordinary `node server/index.mjs` process intentionally has no captured-mail inspector and does not print links; it cannot by itself complete this test's email steps. Do not add a public token endpoint or send real mail as a workaround.

For controlled expiry, the fixture can inject createApp's clock and advance it while the browser remains open; do not wait seven days or change the production lifetime. For the restart test, use a private persistent SQLite path and stable server secret, plus a persistent browser profile. The default CLI database is in memory and is unsuitable for persistence acceptance. HTTPS acceptance was completed at https://localhost:31318 using a current-user-trusted, seven-day localhost certificate and the same private database. TLS files and the stable HTTPS secret remain outside the repository.

Automated evidence is already recorded: 97 passing tests, no skipped/TODO tests; two-account metadata/byte requests, old-cookie reset revocation and the corrected-email HTTP/backend-to-DOM regressions pass. This UAT covers remaining real-browser observations, not a replay of completed source tasks.

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
result: pass

### 7. Request password recovery with two active Alice sessions
expected: Keep Alice signed in in the original profile. Sign Bob out in the second profile, then sign Alice in there too. Both profiles open Alice's private workspace. From /auth?mode=reset-request request recovery for alice.corrected@example.test. See Check your email with the generic response; requesting recovery alone leaves both existing sessions usable. The agent prepares the captured reset link next.
result: pass
initial_result: issue
reported: "when i sign into alice.corrected, the my space says i am signed in as alice@example.test. other than that tests pass"
severity: minor
notes: "Original report retained above. Recovery submission and completion passed in Tests 8–9. Plan 02-08 repaired the stale identity, and the user confirmed the corrected browser value in Test 14. This checkpoint is now passing after repair, not an erased historical issue."

### 8. Send Alice's password-reset request
expected: With Alice signed in in both profiles, open /auth?mode=reset-request, submit alice.corrected@example.test through Send reset email and see Check your email with the generic result. Refreshing both workspaces still permits access because requesting recovery alone does not revoke sessions. The agent retrieves the privately captured reset link for completion next.
result: pass
notes: "User reported pass. No reset message or reset verification row was present in the fixture when checked. The agent then submitted one local HTTP reset request for the known corrected test account: HTTP 200 and one captured reset message. The private shortcut is ready; three stored Alice sessions remain before completion. The original browser request's missing capture is unexplained; browser submission-to-delivery is not independently confirmed."

### 9. Recover a forgotten password and end old sessions
expected: With the same account signed in in two browser profiles, request recovery and open its private captured reset link. Set a new local-test-only password yourself. See Password updated and a fresh Sign in step; both old browser sessions lose private access. The old password no longer works. Fresh sign-in with the new password opens My space, and a used reset link cannot reset again. Do not share either password in chat.
result: pass
notes: "User reported pass. The fixture independently confirms the reset verification was consumed, all three retained pre-reset session IDs are absent, and one fresh Alice session exists."

### 10. Real microphone practice through controlled account expiry
expected: Grant microphone permission and complete the public example without an account, singing different notes to change provisional observations. Repeat while signed in, advance the fixture clock past expiry during an attempt, and confirm capture, count-in/position and provisional observations continue without popup, redirect or focus theft. My space next requires sign-in. In an open workspace, expiry removes identity/content and shows the explicit session-ended prompt; signing in returns to My space. The exact quiet invitation appears near the example and once after an actual attempt, with no popup or repeated retry prompt.
result: pass
stage: complete
notes: "User passed guest microphone/invitation observations and signed-in microphone preparation. Two existing Alice fixture sessions now have stored expiry 2026-10-15T17:40:05.000Z, five seconds after the requested practice start. No production lifetime or source changes. The full test remains pending until the user observes an attempt spanning that expiry, workspace clearing and fresh sign-in."
observation: 'User reported: it shows both create your private space and below it it shows what it would show if i were signed in, it says "attempt ended. can retry."'
clarification: "The reported attempt-ended text is unconditional public practice status in script.js, not private account content. Coexistence with the guest invitation is expected. At 17:42:57Z the fixture confirms both scheduled old session IDs are absent and no Alice sessions remain. Practice continuity, visible workspace clearing and fresh sign-in still await confirmation; no additional implementation gap inferred from this observation."
completion: "User subsequently reported pass for practice continuity across scheduled expiry, cleared private identity/session-ended prompt and fresh sign-in returning to My space. Prior pending wording in notes and clarification describes the intermediate checkpoint."

### 11. Keyboard, layout, zoom and spoken feedback
expected: Traverse signup, sign-in, pending/resend/correction, reset, workspace and welcome by keyboard. All labels, focus rings and recovery controls work; validation focuses the first invalid input, server errors retain error focus, Account Escape restores its trigger, and sign-out failure is focusable/retryable. At 320px, 600px, desktop and 200% zoom, long identity/errors/actions wrap without clipping or page overflow. With a screen reader, hear useful progress/error/expiry changes without credentials, redundant account identity, per-pitch or per-beat chatter. State remains understandable without color.
result: pass
notes: "User reported pass to the full keyboard/layout/spoken-feedback checkpoint and did not identify unperformed checks."

### 12. Persistent browser restart and HTTP cookie settings
expected: With durable private SQLite and a stable server secret, sign in in a persistent browser profile, inspect the cookie's Max-Age=604800, HttpOnly and SameSite=Lax, restart the browser, and return to the same private workspace without another sign-in before expiry.
result: pass
notes: "User reported pass to the explicitly limited HTTP restart/cookie checkpoint. Controlled expiry was observed in Test 10. This result does not establish HTTPS Secure-cookie enforcement."

### 13. Real HTTPS Secure-cookie enforcement
expected: On a configured production-like HTTPS origin, confirm the session cookie has Secure enabled and the browser enforces secure transport. Production-like HTTPS setup is a prerequisite; this closes the remaining portion of WINDOWS item 22 only after actual observations.
result: pass
verified_at: 2026-10-15T22:36:28.345Z
method: installed Chrome automation in an isolated persistent profile
evidence: .planning/quick/261015-lp9-set-up-trusted-local-https-and-verify-se/HTTPS-EVIDENCE.json
notes: "Chrome 154.0.8037.98 accepted TLS 1.3 at https://localhost:31318 with securityState=secure and no certificate-error bypass. Real form sign-in returned __Secure-better-auth.session_token with Secure, HttpOnly, SameSite=Lax, Path=/ and Max-Age=604800. Chrome stored those attributes and a persistent seven-day expiry. JavaScript could not read the session token; authenticated workspace access and the identical session survived full browser shutdown/relaunch. The standalone helper exited 0. No raw cookie, password or captured link is recorded. This observes trusted HTTPS and the browser Secure flag; it does not claim a separate non-localhost HTTP negative test."

### 14. Corrected email in My space after the repair
expected: After the fixed server is loaded and Alice signs in freshly with alice.corrected@example.test, My space shows that corrected verified address under Signed in as. The retained display name must not substitute the abandoned signup address.
result: pass
notes: "User reported pass after the fixed app was reloaded with Alice's same private test database. The browser now shows the corrected verified address. The 97-test automated suite also covers the HTTP and backend-to-DOM lifecycle."

## Summary

total: 14
passed: 14
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-02-7
  truth: "My space identifies the current verified account without displaying an abandoned signup address as the signed-in email."
  status: resolved
  resolved_by: 02-08-PLAN.md
  resolved_at: 2026-10-15
  browser_verified_at: 2026-10-15T20:31:31Z
  reason: "User reported: when i sign into alice.corrected, the my space says i am signed in as alice@example.test. other than that tests pass"
  severity: minor
  test: 7
  root_cause: "Signup initializes user.name from the submitted email. Address correction updates user.email without changing user.name, while /api/me/workspace supplies session.user.name as the Signed in as identity. The live fixture confirms email=alice.corrected@example.test and name=alice@example.test on the same verified account."
  artifacts:
    - path: client/auth.js
      issue: "Signup sets name to the email address, so it can become stale after correction."
    - path: server/db.mjs
      issue: "Correction correctly changes the account email while retaining the old display name."
    - path: server/app.mjs
      issue: "Workspace returns user.name for a Signed in as identity instead of the current verified account email."
    - path: client/workspace.js
      issue: "Labels that stale display value Signed in as."
  missing:
    - "Use the current verified account email in the Signed in as identity while preserving any separate display-name field."
    - "Add a corrected-address sign-in/workspace regression that verifies the displayed identity after correction and fresh login."
  debug_session: .planning/debug/corrected-email-workspace-identity.md
  implementation_fixed_by: 02-08-PLAN.md
  implementation_commit: 5ece2db
  browser_recheck: 14

## Session Notes

- G-02-7 is resolved by executed Plan 02-08 and user-confirmed Test 14. Test 7 retains the original report and is now passing after repair. All fourteen checkpoints pass, including actual HTTPS Test 13. There are no unresolved implementation issues, pending tests or acceptance blocks.
- Trusted HTTPS acceptance is observed and WINDOWS item 22 is fixed. The canonical UAT gate passed all fourteen entries, then phase.complete marked Phase 2 and AUTH-01/AUTH-02 complete on 2026-10-15. Publication is authorized and noon/8 PM Central pushes are scheduled. No merge or deployment occurred.
- After passing Test 3, the user asked whether each newly opened tab requires sign-in. Clarified that tabs in the same browser profile share the valid cookie session; separate profiles/private browsing have separate cookie stores. Explicit crafted auth URLs display sign-in forms to test safe state selection and do not sign the user out. This was a question, not a reported failure. Test 4 now observes shared sign-in across tabs directly.
