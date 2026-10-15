---
status: diagnosed
phase: 02-private-practice-access
gap_id: G-02-7
created: 2026-10-15
goal: find_root_cause_only
execution_mode: inline-codex-fallback
---

# Corrected email shown incorrectly in My space

User report: "when i sign into alice.corrected, the my space says i am signed in as alice@example.test. other than that tests pass"

Expected: After correcting and verifying an address, fresh sign-in identifies the current account by its corrected email in the workspace's Signed in as field.

## Evidence

- client/auth.js signup sends name equal to the submitted email.
- server/db.mjs correctPendingEmail changes user.email and invalidates confirmation records, while retaining user.name.
- server/app.mjs GET /api/me/workspace is guarded by requireVerifiedSession but serializes session.user.name as identity.
- client/workspace.js renderIdentity labels the received value Signed in as.
- The live private fixture query returned email=alice.corrected@example.test, name=alice@example.test and emailVerified=1 for the same account. No password, session token or captured-link token was queried or printed.
- tests/auth-flow.test.cjs currently expects the display name Test Singer as workspace identity. Its correction test ends at verification without a corrected-account login/workspace assertion.

## Root cause

The workspace uses a display-name field as an email identity. Signup defaults that field to the original email, so correcting the actual login email leaves a stale address in the workspace. This is a presentation contract defect; the verified account email and session owner remain correct.

## Fix direction

Return the current verified session user's email as workspace identity. Preserve any independent display name. Add a real signup/correction/verification/sign-in/workspace regression and update the older display-name expectation to the explicit email contract. Retain session guards, no-store responses, owner-by-user.id access and textContent rendering.

## Scope and remaining acceptance

Diagnosis only; no production source changed. The missing HTTPS fixture is a separate prerequisite block and does not justify a code-gap plan. Password recovery, reset session revocation, microphone continuity, accessibility and browser restart have user-reported passing observations recorded in 02-UAT.md.
