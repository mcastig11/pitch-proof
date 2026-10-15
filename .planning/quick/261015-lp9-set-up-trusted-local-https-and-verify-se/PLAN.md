---
type: quick
status: complete
autonomous: true
files_modified:
  - scripts/setup-local-https.ps1
  - scripts/local-https.mjs
  - scripts/verify-local-https.mjs
  - README.md
---

# Trusted local HTTPS and Secure-cookie acceptance

User explicitly requests a local HTTPS test address, actual Secure-cookie verification, recorded results and Phase 2 completion only if required checks pass.

1. Create a seven-day localhost-only server certificate using Windows PKI, trust its public certificate for the current user, and protect keys/secrets outside the repository with a user-only directory ACL. Preserve the existing accounts.sqlite and start a loopback HTTPS proxy to the unchanged application configured with its exact HTTPS origin. No certificate-error bypass or new dependency.
2. In a fresh Chrome profile, run the real account sign-in path over trusted TLS. Inspect the browser's stored session cookie through the Chrome DevTools Protocol, emitting only name and attributes, never token/password values. Verify Secure, HttpOnly, SameSite=Lax, seven-day expiry, private workspace access, JavaScript exclusion and persistence after a browser restart. Keep account creation/confirmation in the private capture fixture.
3. Record sanitized evidence in the quick summary, UAT Test 13 and canonical verification. Run applicable tests/gates and close WINDOWS item 22. Mark Phase 2 complete through the canonical predicate only if no required check remains; commit and push.

Use installed Chrome and a private profile; leave existing user browser tabs untouched. TLS files stay under the user's local application-data directory. Document restart and certificate removal/renewal procedures.
