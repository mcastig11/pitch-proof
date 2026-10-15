# Phase 3: Corrected PDF Score - Context

**Gathered:** 2026-10-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a private library for supported printed PDF scores, processing progress or actionable failure, and recognized notation that the singer can compare against its original PDF, correct and confirm. The singer can edit the full score while selecting one vocal part and a reviewed measure range for confirmation. Confirmed versions reopen with their original PDF and can be replayed through the Phase 1 timeline. Unsupported or unconfirmed passages remain visibly ungraded and ineligible for authoritative feedback.

The Phase 3 exit gate still requires a permissioned corpus of representative digital PDFs and eligible scans, a published supported-notation contract, measured recognition/correction/source correspondence against gold annotations, and resolution of the chosen OMR deployment license. This discussion did not select the supported subset or an OMR tool. Measured live singing feedback, comparable attempt history and optional recording remain in later phases.
</domain>

<decisions>
## Implementation Decisions

### Correction controls
- **D-01:** Edit notation directly on the staff. Move notes up/down to change pitch and use a toolbar for rhythm changes. Provide keyboard equivalents.
- **D-02:** To insert a missing note or rest, choose the note/rest tool and duration, then click its intended position in the score.
- **D-03:** When an edit leaves too many or too few beats in a measure, automatically redistribute surrounding notes across measure boundaries. Highlight the resulting changes for review. The user chose this over retaining the edit in place with only a beat-mismatch warning.
- **D-04:** The whole score is editable, including every vocal part. Highlight the part selected for practice; do not lock all other parts simply because one practice part is selected. Practice still evaluates one singer and one selected melodic part.

### Review workflow
- **D-05:** Show the original PDF beside editable notation. Selecting a measure automatically scrolls the PDF to and highlights its corresponding source area.
- **D-06:** Highlight passages flagged as uncertain and provide a Next issue control. Allow free browsing and editing rather than requiring a sequential guided walkthrough.
- **D-07:** Preserve usable recognition when only part of a PDF succeeds. Open recognized sections for correction and clearly mark missing or unsupported sections as unavailable; do not require a successful complete reprocessing before any editing is possible.
- **D-08:** Use an explicit Save draft button for unfinished review/corrections, with a warning before leaving unsaved changes. The user chose explicit saves over automatic draft saving. Draft saving is distinct from confirmation and does not authorize practice feedback.

### Confirmation and revisions
- **D-09:** Confirmation may cover specific reviewed measures of one vocal part. Other portions of the PDF can remain drafts or unavailable; do not require every part or the entire selected part to be completed before confirming a usable section.
- **D-10:** Require the singer to mark each measure as reviewed against the PDF before confirming its selected section. A single undifferentiated confirmation without measure review tracking is insufficient.
- **D-11:** Editing a confirmed section creates a new draft revision. Preserve the prior confirmed version and its availability while the new changes are reviewed and confirmed separately.
- **D-12:** An edit requires renewed review of every affected measure, including neighbors changed by automatic redistribution. Do not clear unaffected measure review marks just because another measure changed. Apply this together with D-03 so automatic changes cannot silently retain a reviewed status.

### Carry-forward constraints
- Private score metadata and bytes must retain Phase 2's session-derived ownership checks, including direct requests. Owner identity comes from user.id; workspace identity uses the current verified email.
- Keep the public example available to guests and preserve its existing audio lifecycle and count-in decisions. Personal upload/review enters the signed-in workspace once implemented.
- Confirmation identifies a trustworthy reference for later measurement; it does not make Phase 3 microphone observations authoritative. Retain the Phase 1 provisional-feedback boundary until Phase 4 passes its measurement gate.

### Research and planning discretion
- No explicit "you decide" answer was given. D-01 through D-12 are the user's selected product behavior; do not substitute the recommendations they rejected.
- Supported score types/scans were offered as a separate discussion area and were not selected. Exact notation coverage, corpus composition and input limits remain open for evidence-based research; none is approved by this discussion.
- OMR engine/license, notation editor/renderer, source mapping, cloud byte storage, job processing, data structures, detailed keyboard gestures, visual styling and error copy remain implementation choices to research and plan within the existing constraints.
- Research must account for source correspondence after cross-measure redistribution and determine all measures affected by structural, tempo or part-assignment edits. Do not claim a moved or inserted symbol has a precise original-PDF location without evidence.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and acceptance
- `.planning/ROADMAP.md` section Phase 3 - goal, success criteria, permissioned corpus, measured support boundary, source correspondence, timeline replay and deployment-license gate.
- `.planning/REQUIREMENTS.md` - LIB-01 and SCORE-01 through SCORE-04; Phase 4/5/6 and v2 boundaries.
- `.planning/PROJECT.md` - core value, privacy, browser, correction and confidence-aware accuracy constraints. Its older Context paragraphs predate Phase 2; use current source for implementation facts.
- `.planning/STATE.md` - current position and pending OMR/corpus/feedback risks.
- `AGENTS.md` - repository constraints and GSD workflow requirements.

### Prior phase decisions and evidence
- `.planning/phases/01-verified-example-practice/01-CONTEXT.md` - count-in behavior and guest/provisional example boundary.
- `.planning/phases/01-verified-example-practice/01-UI-SPEC.md` - existing score, transport and accessibility contract.
- `.planning/phases/02-private-practice-access/02-CONTEXT.md` - guest access, session behavior, account navigation and the intentionally temporary scores-coming workspace.
- `.planning/phases/02-private-practice-access/02-VERIFICATION.md` - completed account/ownership foundation and actual HTTPS acceptance.

### Current implementation
- `server/app.mjs` - verified-session guard, protected workspace and private resource route wiring.
- `server/db.mjs` - SQLite migrations and inert owner-scoped resource metadata; no implemented PDF byte store.
- `server/owner-resources.mjs` - mandatory owner SQL predicates and authorization before the injected byte provider.
- `client/workspace.js` and `workspace.html` - current private home, identity rendering, expiry clearing and scores-coming insertion point.
- `practice-fixture.js`, `practice-audio.js` and `script.js` - verified event/timeline representation, browser audio lifecycle and example practice controller.
- `index.html` - public example UI, navigation and invitation to update when upload becomes real.
- `package.json`, `package-lock.json` and `README.md` - actual dependencies, test command, server and HTTPS setup. No OMR or notation editor is installed yet.

The September 24 codebase maps were scouted but predate Phases 1 and 2. They are historical orientation, not evidence that the current application lacks a server/accounts/tests. No user-supplied external specification, ADR or product reference was introduced during this discussion.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The current Express/Better Auth/SQLite application already protects private workspace and owner-resource routes; extend its authorization boundary for private PDFs and revisions.
- `server/owner-resources.mjs` authorizes metadata before calling an injected byte provider. Its existing tests exercise two-account isolation and forged owner claims; preserve this ordering when adding real storage.
- The Phase 1 original fixture provides note/rest/measure/timeline events and an existing test baseline for replaying confirmed score revisions.
- The workspace and auth UI already use native controls, visible status text, safe identity rendering and private-content clearing on session loss.

### Established Patterns
- Browser code uses vanilla JavaScript and explicit HTML/CSS; server code uses injectable ESM factories and parameterized SQLite queries. Portable checks run with Node's test runner through npm test.
- The account server serves declared public assets and uses server-derived owner identity and no-store responses for private data.
- PDF ingestion, OMR, editable notation, source mapping and revision persistence are new work. The owner-resource schema is presently an inert contract, not a working score library or byte store.

### Integration Points
- Replace/extend the private home's scores-coming content with real library/upload/review states as those capabilities become available. Update the Phase 2 invitation wording only when personal upload is implemented.
- Connect real byte storage and new score/revision data through verified-session and owner-scoped access, keeping service credentials server-side.
- Keep original PDF provenance/source regions alongside recognized and edited notation, including changes that cross barlines.
- Feed only confirmed, supported selected-part sections into the verified timeline contract; retain version/part/range identity for later practice/history phases.
</code_context>

<specifics>
## Specific Ideas

- The user selected discussion areas 2, 3 and 4: correction controls, review workflow, and confirmation/revisions.
- They explicitly preferred direct staff editing, automatic movement across barlines, editing the whole score, and manual Save draft, even where a different option was recommended. Preserve those choices.
- Linked PDF highlighting, Next issue navigation and visible automatic changes should let the singer compare corrections with the source without a forced walkthrough.
- A confirmed section remains available while a revised draft is being prepared. Saving that draft and confirming it are separate actions.
</specifics>

<deferred>
## Deferred Ideas

None introduced during this discussion. Supported score types/scans remain a Phase 3 research question, not a deferred feature or an implied support promise. Existing roadmap boundaries for live measured feedback, history and recordings still apply.
</deferred>

---

*Phase: 03-corrected-pdf-score*
*Context gathered: 2026-10-15*
