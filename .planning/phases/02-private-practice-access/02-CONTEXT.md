# Phase 2: Private Practice Access - Context

**Gathered:** 2026-09-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver email-and-password account creation, email confirmation, sign-in, password recovery, a private workspace, and owner-scoped access that another account cannot bypass through a direct request. The verified example practice remains available to guests. Personal PDF uploads and practice history arrive in later phases; Phase 2 must not imply that they work yet.

</domain>

<decisions>
## Implementation Decisions

### Guest practice and invitation
- **D-01:** Anyone may complete the verified example practice, including microphone use and live provisional pitch observation, without an account. Visitors may experiment with different sung notes while using that example; observations remain provisional, not grades.
- **D-02:** Offer a small, unobtrusive sign-up invitation near the example and repeat it once after an attempt. Do not interrupt practice with a popup.
- **D-03:** During Phase 2, use the invitation wording: “Create your private space. Your own scores are coming next.” Personal PDF uploads are Phase 3 work.

### Account setup and recovery
- **D-04:** Require email confirmation before a new account can enter its private workspace. While confirmation is pending, show a clear check-your-email state with resend and address-correction options, and let the singer continue using the guest example.
- **D-05:** After confirming email and completing the first sign-in, return the singer to the example practice with a way to reach their workspace. Later sign-ins open the workspace.
- **D-06:** Password recovery uses an email reset flow. After setting a new password, require a fresh sign-in, then return the singer to the private workspace. Revoke existing sessions on every device when the password is reset.

### Signed-in workspace and navigation
- **D-07:** The Phase 2 workspace is a simple personal home with account identity, a link to example practice, and a concise note that personal scores are coming next. Do not put an empty score library or a practice-history message on this home.
- **D-08:** Keep a persistent “My space” link in the header while a signed-in singer uses the example. Show an account icon or label on the main screen rather than prominently displaying the email address. Put Sign out in the account menu.
- **D-09:** Signing out goes to a public welcome page. Give “Try the example” and “Sign in” equal weight there.

### Session behavior
- **D-10:** Keep a singer signed in across browser restarts on the same device for a limited period. Research and planning should choose the exact session lifetimes and enforce expiry server-side.
- **D-11:** If sign-in expires during guest example practice, let the attempt continue uninterrupted. Require sign-in when the singer next tries to open private content.
- **D-12:** If sign-in expires while the private workspace is open, replace private content with a clear session-ended sign-in prompt. After successful sign-in, return to the workspace.

### Agent discretion
- The user chose the product behavior above. Exact timeout values, email provider, session implementation, auth storage, and visual styling remain for research and planning within the privacy and security constraints.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope and prior decisions
- `.planning/ROADMAP.md` § Phase 2 — phase goal, success criteria, and exit gate; Phase 3 and Phase 5 boundaries for PDF uploads and history.
- `.planning/REQUIREMENTS.md` § Accounts and Private Library — AUTH-01 and AUTH-02; privacy requirements owned by later phases.
- `.planning/PROJECT.md` — privacy, security, and browser constraints.
- `.planning/phases/01-verified-example-practice/01-CONTEXT.md` — guest example boundary and provisional feedback decisions.
- `.planning/phases/01-verified-example-practice/01-UI-SPEC.md` — existing example practice interface and accessibility contract.

### Existing application
- `AGENTS.md` — repository conventions and GSD workflow requirements.
- `index.html` — current example page and navigation insertion point.
- `script.js` — current example practice controller and pitch observation UI.
- `practice-audio.js` — browser audio and provisional pitch observation behavior.
- `package.json` — project scripts and dependencies.
- `.planning/codebase/INTEGRATIONS.md` — documented absence of auth, persistence, and backend; map predates Phase 1 and should be checked against current code.

No user-supplied external spec or ADR was referenced during this discussion.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The Phase 1 example already has a microphone check and displays `Pitch heard: …` during practice in `index.html`, `script.js`, and `practice-audio.js`; this supports guest pitch exploration without a new pitch tool.
- Existing example transport, score position, and accessibility behavior can remain accessible to guests and signed-in singers.

### Established Patterns
- The current application is a static browser page with vanilla JavaScript, browser microphone access, and node-based tests. It has no account system, server, persistent user data, or email integration.
- Phase 1 observations are provisional and practice attempts are not saved. The Phase 2 workspace must not claim score uploads, history, or authoritative grades.

### Integration Points
- `index.html` is the current public example entry. Add the quiet account invitation and signed-in navigation without interrupting practice.
- The new public welcome, account, and private workspace flows need server-checked identity and owner-scoped resource access before the Phase 3 PDF library connects.
- Sign-out, recovery, and session expiry must clear access to private content while preserving the public example practice path.

</code_context>

<specifics>
## Specific Ideas

- The user explicitly wants guests to play around with pitch in the example and wants the account invitation to be non-annoying.
- Use the approved invitation copy from D-03 until own-score upload becomes real in Phase 3.
- The public welcome page gives equal visual weight to trying the example and signing in.

</specifics>

<deferred>
## Deferred Ideas

- A separate free pitch playground outside the score-guided example. Its scope and placement belong in a future phase; Phase 2 only preserves pitch exploration within the existing example.

</deferred>

---

*Phase: 2-Private Practice Access*
*Context gathered: 2026-09-28*
