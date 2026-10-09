---
phase: "02"
slug: "private-practice-access"
status: approved
reviewed_at: "2026-10-09T00:59:49.379Z"
shadcn_initialized: false
preset: none
created: "2026-10-08"
---

# Phase 02 — UI Design Contract

> Account access and a private personal home, with uninterrupted public example practice. This contract supplements the approved Phase 01 UI-SPEC and preserves all twelve locked Phase 02 decisions. Prepared within the existing execute-phase workflow for Plan 02-06; checker approval and the UI consideration probe belong to the orchestrator.

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none; native HTML elements |
| Icon library | none; use the text label Account |
| Font | system-ui, sans-serif |

Repository inspection on 2026-10-08 confirms vanilla HTML, inline CSS, and browser JavaScript. `package.json` has no React, Next.js, Vite, or UI component package; no `components.json`, Tailwind configuration, or project skill directory is present. Better Auth, Express, and esbuild support authentication and delivery, not a component design system. The shadcn initialization gate does not apply to this stack. Component Inventory is omitted because Tool is none. Introduce no new framework, component package, font download, illustration, or asset library.

Reuse Phase 01's `.page`, `.panel`, `.field`, `.muted`, `.primary`, and `.error` conventions. Extend native control styles to links, inputs, and the Account disclosure summary. Keep markup/styles in page HTML and browser orchestration in the existing or planned JavaScript files. Sources: approved `01-UI-SPEC.md`, current `index.html`, `script.js`, `package.json`, and `AGENTS.md`.

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Label-to-field and inline label gaps |
| sm | 8px | Button padding vertically, compact action gaps |
| md | 16px | Form field separation, status interiors, narrow page padding |
| lg | 24px | Card padding, section separation, medium page padding |
| xl | 32px | Header-to-content separation and desktop page padding |
| 2xl | 48px | Major vertical separation when needed |
| 3xl | 64px | Maximum page-level separation when needed |

Exceptions: none. Minimum interactive target dimensions are 44px, on the four-pixel grid. Inputs and buttons use 8px vertical and 16px horizontal padding; controls have 8px corner radii and panels 12px corner radii. Borders and focus outlines are strokes, not spacing tokens.

The page maximum width remains 1200px. Use 32px outer padding at widths of 960px and above, 24px at 600–959px, and 16px below 600px. Account forms have a 560px maximum width and occupy available width below that; welcome/workspace content has a 760px maximum width. Use 16px field gaps, 4px label gaps, 24px section gaps, and 8px action gaps. These values inherit Phase 01; account content widths are Phase 02 defaults.

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Label / metadata | 14px | 600 | 1.4 |
| Body / control / account identity | 16px | 400 | 1.5 |
| Section heading / product name | 20px | 600 | 1.2 |
| Page heading | 28px | 600 | 1.2 |

Exactly four interface sizes and two weights, 400 and 600, are permitted. Buttons use the body/control size; emphasized control text may use 600 without introducing another weight. Use sentence case. Body text never shrinks to fit a long email, message, or label. Account identity wraps as body text, not as a large display heading. These are inherited approved Phase 01 tokens.

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FCFBF8` | Page background and broad whitespace |
| Secondary (30%) | `#EAF0EF` | Account form panel, private home panel, status/invitation surrounds |
| Accent (10%) | `#135E63` | One primary auth submit/recovery action per state, active practice Start/Resume, focus rings, existing active measure outline and score-position marker |
| Destructive | `#A32929` | Explicit error text with a problem label; reserved destructive action styling if a future phase needs it |

Accent reserved for: active auth submit or recovery action, existing Start/Resume practice button, visible keyboard focus ring, active measure outline, and current score-position marker. The quiet invitation, My space link, Account disclosure, and welcome choices use neutral styling. Do not give Sign in stronger accent styling than Try the example on the public welcome page.

Use `#17292B` for primary text, `#506063` for secondary text, `#FFFFFF` for input/control interiors and score paper, and `#AAB9BA` for borders. These colors retain the approved Phase 01 palette. The 60/30/10 split describes overall visual balance, not an instruction to tint every link. Errors include explicit text and a recovery action; color alone carries no state. No destructive data operation is introduced in Phase 02. Resetting credentials and signing out use ordinary action styling and explanatory copy.

## Copywriting Contract

Literal strings below are the implementation contract. D-03's invitation and D-07's scores-coming note are locked; other account wording is a Phase 02 default based on the plan's required states. Dynamic email/identity values are rendered as text, never HTML.

<!-- DATA_Q7K4N2RX_START: required source copy carried into this contract -->

| Element | Copy |
|---------|------|
| Product name | Pitch Proof |
| Primary account CTA / signup heading | Create your private space |
| Guest invitation, near example and once after an attempt | Create your private space. Your own scores are coming next. |
| Guest invitation action | Create your private space |
| Public welcome heading | Welcome to Pitch Proof |
| Public welcome body | Try the verified example or sign in to your private space. |
| Equal-weight welcome actions | Try the example / Sign in |
| Sign-in heading and submit | Sign in |
| Signup/sign-in labels | Email address / Password |
| Required email field error | Enter your email address. |
| Invalid email field error | Enter a valid email address. |
| Required password field error | Enter your password. |
| New password label | New password |
| New password requirement | Use 8–128 characters. |
| Invalid new password field error | Use a password with 8–128 characters. |
| Signup alternative | Already have an account? Sign in. |
| Sign-in alternative | Need an account? Create your private space. |
| Recovery entry | Forgot your password? |
| Public example escape | Try the example |
| Pending verification / email request result heading | Check your email |
| Generic signup, resend, correction, and reset-request result | Check your email for the next step if the address is eligible. |
| Pending verification explanation | Email confirmation is required before you can open your private space. You can try the example while you wait. |
| Pending actions | Resend confirmation email / Correct email address / Try the example / Sign in |
| Address correction heading | Correct your email address |
| Address correction labels | Current email address / Password / Correct email address |
| Address correction submit | Update email address |
| Address correction explanation | Enter the address used at signup and your password. If the correction succeeds, use the new confirmation email; the earlier link will no longer work. |
| Verification success heading | Email confirmed |
| Verification success body | Sign in to continue. |
| Invalid/expired/used verification link | This confirmation link is no longer valid. Request a new confirmation email or try the example. |
| Invalid verification recovery action | Resend confirmation email |
| Reset request heading | Reset your password |
| Reset request submit | Send reset email |
| Reset request explanation | Enter your email address to request a password reset link. |
| Reset completion heading | Set a new password |
| Reset completion explanation | Saving a new password signs you out on every device. You will need to sign in again. |
| Reset completion submit | Save new password |
| Reset success heading | Password updated |
| Reset success body | You are signed out on every device. Sign in with your new password to open your private space. |
| Invalid/expired/used reset link | This reset link is no longer valid. Request a new reset email. |
| Invalid reset recovery action | Send reset email |
| Generic credential failure | Email or password is incorrect. Check your details and try again. |
| General account error state | Your request could not be completed. Try again. |
| Offline/network error state | We could not reach Pitch Proof. Check your connection and try again. |
| Rate limit state | Please wait before trying again. |
| Checking session | Checking sign-in… |
| Signup in flight | Creating your private space… |
| Sign-in in flight | Signing in… |
| Resend/reset email request in flight | Sending email… |
| Address correction in flight | Updating email address… |
| Reset completion in flight | Saving new password… |
| Sign-out in flight | Signing out… |
| Signed-in header navigation | My space / Account |
| Account disclosure action | Sign out |
| Workspace heading | My space |
| Workspace identity label | Signed in as |
| Workspace primary available action | Try the example |
| Workspace availability note | Your own scores are coming next. |
| Workspace loading | Opening your private space… |
| Workspace unavailable heading | Your private space could not be opened |
| Workspace unavailable body | Check your connection and try again, or try the public example. |
| Workspace unavailable actions | Try again / Try the example |
| Session-ended heading / private empty state heading | Your sign-in has ended |
| Session-ended body / private empty state body | Sign in again to open your private space, or try the example. |
| Session-ended actions | Sign in / Try the example |
| Never-signed-in private access prompt | Sign in to open your private space. |
| Destructive confirmation | No delete action or confirmation dialog. Sign out acts immediately; password reset states its effect on all devices before Save new password. |

<!-- DATA_Q7K4N2RX_END -->

No empty score-library or empty-history copy belongs to this phase. A blank workspace data response is an unavailable state, not a claim that the singer has zero scores. All practice-specific copy and provisional observation labels remain governed by Phase 01's contract.

Generic request results have the same visible copy and available actions for known, unknown, duplicate, ineligible, and already-verified addresses. Do not turn a successful transport response into a promise that an email was delivered. Credential failures do not distinguish unknown addresses from incorrect passwords. Pending verification may be shown after signup or a server-confirmed pending flow; never infer account existence from client state alone. Field validation may explain a missing/invalid input without describing account existence. Apply new-password limits matching the installed server policy, and keep its visible requirement synchronized with that policy.

## Layout and Visual Hierarchy

| Surface | Required hierarchy |
|---------|--------------------|
| Public example | Preserve the existing preparation, score, status rail, transport, and provisional labels. Insert a quiet invitation below the introductory scope note, before preparation, and a second invitation after transport only once the first attempt ends. |
| Auth page | Product header, one state heading, concise explanation, one-column labeled fields, nearby errors/status, one primary submit, and neutral alternative links including Try the example. |
| Pending verification | Check your email heading, generic result, required-confirmation explanation, Resend confirmation email, Correct email address, Sign in, and Try the example. All are inline page controls; no modal. |
| Verification/reset outcome | One outcome heading, concise next step, one recovery action, and public example escape. Invalid links never expose private identity or token text. |
| Public welcome | Product header, welcome heading and body, then Try the example and Sign in as two identical neutral outlined actions. |
| Private workspace | Product header with Account disclosure, My space heading, Signed in as with account identity, Try the example, then Your own scores are coming next. |
| Expired workspace | Remove the identity and other private DOM content, then show the session-ended heading/body, Sign in, and Try the example. |

The near-example invitation uses 16px body text with a 14px or 16px neutral action; it is subordinate to preparation and the Start practice button. The post-attempt invitation is one inline block after transport, revealed once per page visit after the first genuine stopped/completed attempt, then left in place without repeated announcements or additional copies on retries. It does not appear on microphone check alone, count-in ticks, or position recovery. Hide guest invitations after a verified sign-in is established. Never move focus to an invitation or cover the score/controls with it.

On the example, keep My space visible in the header whenever signed-in state is established, including during singing. Use an Account text disclosure, not the email as its trigger. Identity may be shown under Signed in as in the private home at normal body size. The account menu contains Sign out. A native `details`/`summary` disclosure is sufficient; do not use ARIA menu semantics unless the full corresponding keyboard behavior is implemented.

At 960px and above, the practice page retains its approved two-column 2fr/1fr score/rail layout. Auth pages remain a single column. Below 600px, welcome actions stack with equal full width, and form action rows stack. Headers wrap or stack; Account disclosure content stays inside the viewport. At 320px and 200% zoom, only the existing labeled score frame may scroll horizontally. Long identity, email, explanatory text, and button labels wrap; no email truncation hides the account being used. Inputs fit their container and may scroll their entered value internally. Controls retain full labels and at least 44px targets.

## Interaction Contract

| State / event | Visible behavior | Action and transition |
|---------------|------------------|-----------------------|
| Public page starts / session check pending | Practice controls remain usable independently; account area uses Checking sign-in without a private identity. | Guest may use microphone and practice immediately. Session result changes only account navigation. |
| Public session lookup offline or failed | Present neutral Sign in access and public example; show an inline account error only if a user-requested account action fails. | Do not stop, reset, disable, or restart microphone, metronome, score tracking, or provisional observations. |
| Blank or partial account form | Labeled empty fields are visible. On submit, explain missing/invalid fields adjacent to inputs and focus the first invalid input. | Keep valid entered non-secret data; allow editing and resubmission. Do not send an invalid request. |
| Valid form submitted | Use the documented in-flight label and polite status; disable duplicate submit and contradictory mutations only. | Keep a path to Try the example. Restore usable controls on failure; prevent stale responses from replacing a newer state. |
| Signup accepted, including generic duplicate response | Show Check your email with generic result, confirmation requirement, resend/correction, Sign in, and Try the example. | No signed-in navigation or private data until the server verifies identity and a sign-in succeeds. |
| Resend requested | Show Sending email; prevent repeated concurrent resend. | Return the same generic result independent of address existence; a 429 uses the rate-limit copy without a fabricated countdown. |
| Address correction requested | Show current address, password, corrected address labels and the correction explanation. | Submit credentials to the established correction endpoint; no session is created. On generic success show pending state; prior verification links no longer apply if correction succeeds. |
| Verification link succeeds | Show Email confirmed and Sign in to continue. | Verification never automatically signs in or opens the private workspace. |
| Verification link absent/invalid/expired/used | Show documented invalid-link recovery; never display the token. | Offer resend flow, Sign in, and public example. Missing/invalid callback state never renders a success claim. |
| First verified sign-in succeeds | Navigate to the public example with persistent My space and Account. | Use the server-selected destination; never use a browser first-use flag. |
| Later verified sign-in succeeds | Navigate to private workspace. | A concurrent/tab continuation uses server-authored routing, not an email in the URL. |
| Sign-in fails | Generic credential error or mapped network/rate-limit error; no private content. | Keep email field, clear password after failed server submission, and offer retry/recovery. |
| Reset request accepted | Show generic Check your email result regardless of address existence. | Offer Sign in and Try the example while waiting. No session is created. |
| Reset token valid | Show Set a new password, requirement, and all-devices sign-out effect before submit. | Save new password; no automatic sign-in. |
| Reset token absent/invalid/expired/used | Show documented reset-link failure and Send reset email. | Return to reset request; do not keep a usable completion form for a known invalid token. |
| Reset completion succeeds | Show Password updated, all-devices sign-out copy, and Sign in. Clear password fields and private client state. | Fresh sign-in returns to /workspace even if the account had not finished first use. |
| Private workspace initially loads | Show Opening your private space, without identity or placeholder private data. | Fetch authenticated no-store data. Render identity only after a valid verified-session response. |
| Workspace response succeeds | Show the real server-authenticated identity, example action, and scores-coming note. | No upload, score collection, history, recording, or saved-attempt action is presented. |
| Workspace response malformed/incomplete, network unavailable, or server error | Remove stale private identity/content and show the documented unavailable state with Try again and Try the example. | Retry authorization and data together. Do not invent an identity or declare the session expired solely because the network failed. |
| Workspace private request returns 401 / session expires | Clear all account-specific DOM nodes and in-memory private state before displaying the session-ended prompt. | Sign in uses safe /workspace return intent; Try the example stays public. No browser cache or stale async response may restore the cleared content. |
| Workspace becomes visible or is restored through browser navigation | Treat private authorization as unknown; conceal/clear previous private content and revalidate. | Keep private content hidden until the current no-store session/data request succeeds. Reject late results from prior loads. |
| Session expires while example attempt is running | Continue microphone capture, count-in, tracking, and provisional observations without a popup or forced redirect. | Next My space/private access requires sign-in. Changing account navigation never changes the active attempt. |
| Account disclosure opens | Show Sign out with native keyboard access. | Escape closes the disclosure and returns focus to Account; hidden content is not tabbable. Ordinary navigation links remain ordinary links. |
| Sign out chosen | Disable duplicate sign-out and show Signing out. Immediately clear local private identity/data; public audio may remain local until navigation. | Confirm server invalidation before reporting success and navigating to the public welcome route. |
| Sign out cannot complete | Show the documented request/network error and allow retry; do not claim server sessions were revoked. | Keep local private content cleared; allow public example access. Successful retry goes to welcome. |
| Public welcome after sign-out | Try the example and Sign in have equal weight, sizes, borders, spacing, and target dimensions. | Each link navigates directly to its respective public or auth route. |

The server enforces a fixed seven-day maximum session lifetime across browser restarts (604800 seconds), with no sliding refresh and no browser bearer-token storage. This policy is already implemented in Plans 02-03/02-04; the UI needs no persistence checkbox or countdown. Verification and reset links are time limited and one use; pending account cleanup after more than 30 days may require a fresh signup but must not reveal whether an address exists. Sources: `02-CONTEXT.md` D-01–D-12, `02-06-PLAN.md`, `02-RESEARCH.md`, current `server/auth.mjs` and `server/app.mjs`.

Current server behavior for address correction supersedes the research's earlier restart-signup assumption: credential verification updates an unverified account's address without issuing a session and revokes old verification links. The UI follows that endpoint. Return routes are same-origin and server approved. Do not reflect an arbitrary callback URL into navigation. Auth requests never run in an audio frame, observation callback, or microphone lifecycle.

## Accessibility and Feedback

- Use one page h1, semantic form elements, persistent visible labels linked to inputs, native links for navigation, and native buttons for mutations. Email fields use `type="email"` and `autocomplete="email"`; sign-in/correction passwords use `autocomplete="current-password"`, signup/reset use `autocomplete="new-password"`. Permit password manager filling and paste. Passwords are masked; no password or token is persisted in browser storage.
- Body text is 16px and metadata at least 14px. All links styled as actions, buttons, disclosure triggers, and fields are at least 44px high; compact standalone actions provide a 44px target. Extend the existing 2px accent focus ring with 2px offset to every new interactive element. Links remain underlined or otherwise identifiable without color.
- On navigation/state replacement, update the document title and focus the new state heading using temporary `tabindex="-1"`. On field errors set `aria-invalid` and `aria-describedby`, then focus the first invalid field. Form-level errors without a field target focus the error heading/summary. Async progress/result changes use one polite status region and do not move focus on every response.
- If an in-flight button must be disabled, retain its label/status and restore focus after completion when that control was focused. Following success to a different screen, focus that screen's heading. Session expiry in workspace focuses the session-ended heading after private content clears; session expiry on the example never steals practice focus.
- Distinguish progress, credential failure, required confirmation, offline failure, unavailable workspace, and session expiry with explicit text. Never communicate failure or signed-in status through a color/icon alone. Do not announce credentials, tokens, or account identity unnecessarily.
- Use a keyboard-operable Account disclosure; Escape closes and restores trigger focus. Sign out stays inside it. Do not trap focus. Hide collapsed or replaced controls from tab order and accessibility tree.
- Preserve Phase 01's accessible score summary, separate score-position text, non-color tracking uncertainty, selective polite announcements, and reduced-motion behavior. Do not announce frame updates, every pitch observation, or every metronome beat through account regions.
- At 320px, 600px, desktop, and 200% zoom, headings, errors, identity, and controls reflow without clipping or page horizontal overflow. Long email/identity uses `overflow-wrap: anywhere`; no raw dynamic value is interpreted as markup. Respect reduced motion; auth transitions need no animation or spinner to communicate progress.

These are inherited Phase 01 accessibility rules applied to the explicit form/focus acceptance requirements in Plan 02-06; autocomplete and focus destinations are Phase 02 defaults.

## UI Considerations

> Compiled probe completed after checker approval. The documented auto resolution mode uses author-reviewed kinds and concrete acceptance truths from the approved contract. Empty/error copy remains in Copywriting Contract.

Coverage: 25 applicable items; all resolved with explicit verification, zero backstop or unresolved.

| ID | Surface | Confirmed element kinds |
|----|---------|-------------------------|
| E1 | Signup, sign-in, pending correction, and password request/completion forms with labeled inputs and submit buttons | form, interactive-control |
| E2 | Pending verification, link outcomes, account status/recovery copy, resend buttons and recovery links | interactive-control, static-content, nav |
| E3 | Example header, My space navigation link, Account disclosure, and sign-out control | nav, interactive-control |
| E4 | Public welcome heading and body with equal-weight navigation actions | nav, static-content, interactive-control |
| E5 | Private workspace identity text, example link, expiry prompt and retry controls | interactive-control, static-content, nav |
| E6 | Quiet guest invitation text and signup link near the example and after the first attempt | static-content, interactive-control, nav |

| Category | Element | Status | Resolution / Reason |
|----------|---------|--------|---------------------|
| empty | E1 | resolved (explicit) | Blank forms retain visible labels; submitting focuses the first required missing field and sends no invalid request. |
| loading | E1 | resolved (explicit) | Each submitted mutation uses its documented progress label, prevents duplicate submission, and restores controls on completion/failure. Leaving a state, signing out, or receiving a newer request invalidates late async results so they cannot restore private identity or superseded form status. |
| error | E1 | resolved (explicit) | Missing/invalid fields get actionable adjacent errors; server credential/account-existence results remain generic; network and throttling have documented recovery copy. Signup/resend/correction/reset-request success and account-existence outcomes use identical generic wording and controls for known and unknown addresses. Successful reset creates no authenticated UI; fresh sign-in and workspace reauthentication honor server-authored safe /workspace continuation. |
| partial | E1 | resolved (explicit) | Incomplete input remains editable with valid non-secret values preserved; failed server submissions clear password fields and do not advance the flow. |
| long-text | E1 | resolved (explicit) | Labels, requirements, errors, and action text wrap; entered email scrolls within the input and never widens the page. |
| loading | E2 | resolved (explicit) | Resend and recovery actions show documented in-flight copy; outcomes are not announced as delivered email before a server result. Leaving a state, signing out, or receiving a newer request invalidates late async results so they cannot restore private identity or superseded form status. |
| error | E2 | resolved (explicit) | Invalid/expired/used links show the appropriate documented recovery action; tokens never appear in copy and no success/private identity is fabricated. Signup/resend/correction/reset-request success and account-existence outcomes use identical generic wording and controls for known and unknown addresses. |
| overflow | E2 | resolved (explicit) | Outcome and confirmation text wraps within the account column at 320px and 200% zoom. |
| long-text | E2 | resolved (explicit) | Long descriptions wrap with full action labels; generic account results retain their complete meaning. |
| loading | E3 | resolved (explicit) | Initial sign-in check changes only account navigation; public practice remains usable and no private identity is displayed before confirmation. Leaving a state, signing out, or receiving a newer request invalidates late async results so they cannot restore private identity or superseded form status. Session expiry or account status transitions during example practice never stop microphone capture, count-in, tracking, or provisional observations. |
| error | E3 | resolved (explicit) | Failed account lookup does not interrupt audio; failed sign-out offers retry and never claims successful server invalidation. |
| overflow | E3 | resolved (explicit) | Header navigation wraps/stacks and the disclosure stays in the viewport without horizontal page scrolling. Only the established score frame may scroll horizontally; account pages, headers, action rows, and private home reflow without page overflow. |
| long-text | E3 | resolved (explicit) | My space and Account remain complete labels; email is absent from the disclosure trigger and long content does not widen it. |
| loading | E4 | resolved (explicit) | Welcome links perform normal navigation; native destination loading adds no modal or private-content placeholder. |
| error | E4 | resolved (explicit) | A failed destination remains recoverable by browser navigation/retry; the public example does not require a successful auth fetch. |
| overflow | E4 | resolved (explicit) | Equal-width welcome actions stack below 600px and retain matching styles/targets without page overflow. Only the established score frame may scroll horizontally; account pages, headers, action rows, and private home reflow without page overflow. |
| long-text | E4 | resolved (explicit) | Welcome body and action labels wrap with identical sizing and no clipping or relative emphasis change. |
| loading | E5 | resolved (explicit) | Workspace shell shows Opening your private space with no identity until a verified authenticated no-store response succeeds. Leaving a state, signing out, or receiving a newer request invalidates late async results so they cannot restore private identity or superseded form status. |
| error | E5 | resolved (explicit) | Network/server/malformed response uses the unavailable state; 401 uses session-ended state after every private DOM node and private state is cleared. Workspace visibility restoration revalidates authorization before revealing identity; expiry never leaves account-specific content visible or restorable through stale client results. Successful reset creates no authenticated UI; fresh sign-in and workspace reauthentication honor server-authored safe /workspace continuation. |
| overflow | E5 | resolved (explicit) | Account identity and availability note wrap inside the private panel; all recovery controls remain accessible at 320px and 200% zoom. Only the established score frame may scroll horizontally; account pages, headers, action rows, and private home reflow without page overflow. |
| long-text | E5 | resolved (explicit) | Long server-provided identity/email is rendered as wrapping text, never markup, an ellipsis, or a prominent header label. |
| loading | E6 | resolved (explicit) | Invitations are static inline content; opening signup uses ordinary navigation and does not block microphone or score loading. The post-attempt invitation is revealed once after the first ended attempt per page visit, never repeated on retry or presented as a popup. |
| error | E6 | resolved (explicit) | A failed signup navigation or account request never changes the public practice attempt; the singer can keep using or return to the example. |
| overflow | E6 | resolved (explicit) | Invitation body and neutral action wrap in normal document flow without overlaying transport or score. |
| long-text | E6 | resolved (explicit) | The locked invitation remains fully visible and unchanged near the example and in the single post-attempt block. |

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None | None | Not applicable: no shadcn initialization, external registry, or third-party UI block; repository/package inspection on 2026-10-08. |

No registry content is introduced, so registry view/vetting is inapplicable. Authentication package provenance was handled by the existing Phase 02 package checkpoint; it does not establish a UI component inventory.

## Decision Provenance and Phase Boundary

| Source | Decisions used |
|--------|----------------|
| `02-CONTEXT.md` D-01–D-03 | Public microphone/pitch example, discreet invitation twice at most in its specified positions, exact invitation wording, no popup. |
| `02-CONTEXT.md` D-04–D-06 | Required confirmation, resend/correction/guest escape, first verified sign-in to example, later to workspace, email reset with fresh login and all-session revocation. |
| `02-CONTEXT.md` D-07–D-09 | Simple personal home, moderate account identity, upcoming-score note, persistent My space and Account menu, Sign out to equal-weight public welcome. |
| `02-CONTEXT.md` D-10–D-12 | Bounded persistence across restart, uninterrupted example during expiry, workspace replacement and return after reauthentication. |
| Approved `01-UI-SPEC.md` and current `index.html` | Seven-value spacing scale, four sizes/two weights, palette, breakpoints, native controls, target/focus dimensions, score/public-audio accessibility and provisional feedback contract. |
| `02-06-PLAN.md` | Required auth screens, keyboard/focus/status states, generic account-existence copy, no-store workspace reads and 401 removal, safe continuation, public audio separation. |
| `02-RESEARCH.md`, completed plans/current server | Vanilla presentation, same-origin server identity, fixed seven-day sessions, verification without auto-login, reset fresh login, authenticated pending correction and token revocation. |
| `REQUIREMENTS.md`, `ROADMAP.md`, `PROJECT.md`, `AGENTS.md` | AUTH-01/AUTH-02 scope, owner-private access, browser operation, future upload/history/recording boundaries, server-only secrets, GSD workflow and code conventions. |
| Phase 02 defaults | Account content widths, routine page/form/recovery copy, native disclosure behavior, input autocomplete, exact focus destinations, once-per-page post-attempt invitation, failure/revalidation layout. |

All twelve locked account decisions are retained. No new user answer is needed. No upload, empty score library, saved practice history, recording retention, standalone pitch playground, or authoritative grade is introduced. Owner-scoped resource fixtures and direct-request authorization checks are backend seams, not visible score items. Do not copy superseded claims of a backend-free prototype from older project mapping into the product UI.

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS

**Approval:** All seven checker dimensions passed; compiled UI consideration coverage is resolved. Implementation and browser acceptance remain pending.
