# API Coverage — Resend

> Full coverage by default. Opt-outs are explicit, reasoned decisions.

Scope: the server uses only Resend's transactional single-email send operation to deliver account confirmation and password-reset messages. This matrix was derived from the official [Resend API Reference](https://resend.com/docs/api-reference/introduction), checked 2026-09-29. The adapter uses HTTPS, a server-side Bearer API key, a User-Agent, and checked HTTP status responses.

| capability | decision | reason |
|---|---|---|
| Send one transactional email (`POST /emails`) | INTEGRATE | Required for account confirmation and password-reset links. |
| Send batch emails | OPT-OUT | Phase 2 sends one security message to one account at a time; it has no bulk-mail workflow. |
| Retrieve and list sent emails | OPT-OUT | The app needs provider acceptance for the send operation, not an in-app delivery history. |
| Update, cancel, or share sent emails | OPT-OUT | Auth messages are sent immediately and are not user-editable or shareable content. |
| Retrieve/list sent-email attachments and metrics | OPT-OUT | Auth messages contain no attachments, and message analytics are outside account access. |
| Retrieve/list received emails and their attachments | OPT-OUT | Pitch Proof does not receive or display inbound email. |
| Inboxes CRUD | OPT-OUT | The product has no managed mailbox feature. |
| Inbox labels CRUD | OPT-OUT | No mailbox or labeling workflow exists. |
| Inbox threads list/read/update/delete/reply/forward | OPT-OUT | No inbound conversation workflow exists. |
| Inbox drafts create/read/update/delete/send | OPT-OUT | Account email callbacks generate their own one-recipient messages; there is no inbox draft surface. |
| Broadcasts create/send/cancel/duplicate/read/update/delete and recipient/click reports | OPT-OUT | Phase 2 sends security messages only; it has no newsletter or campaign feature. |
| Automations CRUD, duplicate/stop, and run history | OPT-OUT | Signup and reset messages are triggered directly by Better Auth callbacks, not provider campaigns. |
| Events create/send/read/list/update/delete | OPT-OUT | No marketing event or automation trigger is required. |
| Templates create/read/list/update/delete/publish/duplicate | OPT-OUT | The app supplies the account email content directly; it does not manage provider templates. |
| Contacts CRUD and segment/topic membership | OPT-OUT | Pitch Proof does not maintain provider marketing contacts or mailing lists. |
| Contact properties CRUD | OPT-OUT | No contact CRM data is synchronized to Resend. |
| Contact imports create/read/list | OPT-OUT | There is no bulk contact import. |
| Segments CRUD, contact listing, and metrics | OPT-OUT | No audience segmentation or marketing analytics are in scope. |
| Topics CRUD | OPT-OUT | No subscription preference or broadcast topic is offered in Phase 2. |
| Deprecated audiences create/read/list/delete | OPT-OUT | The product does not manage audiences; this deprecated surface is not needed for transactional delivery. |
| Domains create/claim/verify/read/list/update/delete | OPT-OUT | An operator provisions and verifies the sender domain outside the app; the app does not administer DNS or provider domains. |
| Logs read/list and account usage | OPT-OUT | Provider dashboards remain the operator's diagnostic surface; the app does not expose provider logs or usage. |
| API keys create/list/update/delete | OPT-OUT | Operators provision a least-privilege key out of band; application users cannot manage provider credentials. |
| Suppressions add/read/list/remove, including batch operations | OPT-OUT | The account flow does not administer provider suppression records; provider send errors are surfaced without changing suppression state. |
| Authorized app grants list/revoke | OPT-OUT | The adapter authenticates with one server-held API key and does not use Resend OAuth grants. |
| Webhooks create/read/list/update/delete, rotate secrets, inspect/replay events and attempts | OPT-OUT | Provider delivery events are not needed to establish account verification or password reset; the user can request another message. |
| OAuth client registration, authorization, token, and revocation | OPT-OUT | The server uses an operator-managed API key and does not connect user Resend accounts. |
