# Phase 2: Private Practice Access - Discussion Log

> **Audit trail only.** Planning, research, and execution use `02-CONTEXT.md` for decisions. This file records alternatives considered.

**Date:** 2026-09-27 to 2026-09-28
**Phase:** 2-Private Practice Access
**Areas discussed:** Practice entry, Account setup and recovery, Signed-in workspace, Session behavior

---

## Practice entry

| Question | Options presented | Selected |
|----------|-------------------|----------|
| What can visitors do before creating an account? | Full example practice; view the example only; sign in first; other | Full example practice |
| What does playing around with pitch mean? | Explore pitch during the example; separate playground; both; other | Both, with separate playground deferred |
| When should the invitation to sign in appear? | Quiet visible invitation and one reminder after an attempt; after attempt only; before practice; other | Quiet visible invitation and one reminder |
| How should Phase 2 describe future score uploads? | “Create your private space. Your own scores are coming next.”; sign up to get ready; account-only message; other | First wording |

**User notes:** Guests should be able to play around with pitch. The sign-in invitation must not be annoying. The approved pitch exploration within the example uses live provisional observations; a separate playground is deferred.

---

## Account setup and recovery

| Question | Options presented | Selected |
|----------|-------------------|----------|
| When can a new account enter its workspace? | After confirming email; immediately with later confirmation; other | After confirming email |
| What can someone do while waiting for confirmation? | Continue guest example with resend and address correction; stay on confirmation screen; other | Continue guest example |
| What happens after setting a new password? | Sign in with new password; automatic sign-in; other | Sign in with new password |
| Where should the singer land after confirmation and first sign-in? | Workspace; example practice; where they started; other | Example practice |

**User notes:** Return to the private workspace after password recovery and fresh sign-in. Returning sign-ins were clarified separately below.

---

## Signed-in workspace

| Question | Options presented | Selected |
|----------|-------------------|----------|
| What should Phase 2 workspace show? | Simple personal home; empty score library; minimal account page; other | Simple personal home |
| Where should later sign-ins start? | Example practice; private workspace; last page; other | Private workspace |
| Should the workspace explain that history is not saved yet? | Brief explanation; leave it out; other | Leave it out |
| Where should sign-out take someone? | Guest example; sign-in page; public welcome page; other | Public welcome page |
| What should the welcome page emphasize? | Example first; sign-in first; equal weight; other | Equal weight |
| How should a signed-in singer reach their workspace from the example? | Header link; link near practice; both; other | Persistent header link |
| How should the main screen show account identity? | Email on home; email in account menu; account icon or label only; other | Account icon or label only |
| Where should Sign out appear? | Account menu; workspace home; both; other | Account menu |

**User notes:** The workspace home links to example practice and says personal scores are coming next. Keep the main screen clear of a practice-history notice and prominent email address.

---

## Session behavior

| Question | Options presented | Selected |
|----------|-------------------|----------|
| Should sign-in survive closing and reopening the browser? | Yes for a limited period; no; user choice at sign-in; other | Yes for a limited period |
| What happens when sign-in expires during example practice? | Continue example; quiet expiry notice; pause practice; other | Continue example |
| What happens to other-device sessions after password reset? | End all sessions; ask during reset; other | End all sessions |
| What appears if a session expires in the private workspace? | Clear sign-in prompt and return; public welcome page; quiet sign-in form; other | Clear sign-in prompt and return |

**Security reference consulted for session choices:** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) and [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). These informed the presented options; the product decisions above were selected by the user.

## Agent discretion

The user did not delegate product choices. Research and planning may select technical mechanisms and specific expiry values within the locked behavior and project constraints.

## Deferred ideas

- Separate free pitch playground outside score-guided example practice; future phase or backlog.
