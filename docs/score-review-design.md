# Score review interaction contract

Status: **prepared for human review, unapproved** (03-02-03). This is an acceptance contract and walkthrough, not an implemented editor or browser acceptance evidence. The current workspace still has the Phase 2 private-home shell. Nothing here claims PDF upload, recognition, correction, source comparison or confirmation already works.

UI gate observation at planning/execution handoff: `frontend=true`, `hasUiSpec=false`, `hasFrontendEvidence=false`, `block=false`. That gate result permits preparing this contract; it is not design approval. UI implementation in 03-04 waits for explicit approval of this contract or an approved UI-SPEC preserving all D decisions. Approval is recorded with approver, date, artifact hash and evidence in the manifest's `designApproval`; it is currently pending.

## Reachable flow and layouts

Guest: `/` keeps the public example and its microphone/count-in lifecycle. The account invitation leads through the existing `/auth` flow to `/workspace`; guest example practice never requires an upload. Signed-in identity uses verified email, with all score access authorized by session user ID. The future private path is My space > Upload PDF > recognition status > Review score > Confirm section > Open confirmed version > Replay. Route names below are planned, not currently served capabilities.

`/workspace`: retain the account menu, session status, heading and keyboard focus pattern. Replace the temporary scores-coming area only when real personal upload exists. Show a private library with title, upload date and text status: Processing, Needs review, Partly recognized, Confirmed sections, or Failed. Each card has Open review; confirmed cards also have Open confirmed version. Empty state: Choose a PDF. File picker, supported-subset help, selected filename, upload progress and Cancel remain together. Reject with actionable text for unsupported type/size/page limit, failed processing, or missing authorization. Never treat a recognized candidate as confirmed.

Review, planned `/scores/{id}/review`: header has My space, score title, draft revision/saved state and account menu. Controls in reading order are practice-part selector, measure/range navigation, issue count and Next issue, edit tools, editable score, original PDF, review/confirmation panel, Save draft. Separate the practice part from the current edit selection. The source pane states filename, original page, zoom, rotation and mapping quality. The sidebar states Selected part/range, Reviewed X of Y measures, unavailable reasons and Confirm selected section. A saved draft displays Last saved; unsaved edits display Unsaved changes. Save draft is a visible primary action, distinct from confirmation.

At 1200px and wider: score and original PDF occupy adjacent columns (approximately 55/45); review controls sit above/below rather than squeezing the staff. At 768-1199px: keep adjacent comparison when both remain legible; allow each pane its own zoom/scroll. Below 768px: show vertically stacked notation and Original for selected measure, with a persistent Jump to original / Back to notation pair. On selection, keep the linked source region visible in the second pane without stealing focus. At 375px the page itself must not scroll horizontally; large score canvases have labeled, separately scrollable containers and zoom. At 200% zoom no primary action disappears behind sticky controls. Touch targets are at least 44px.

Confirmed view: title identifies immutable version, one part, inclusive measure range, tempo and Original PDF. Open a new draft revision is explicit. Replay enters the existing transport with that exact version/part/range; practice controls keep the Phase 1 stop/retry/count-in and provisional-observation behavior. No Phase 3 confirmation creates measured singing grades.

## Shared keyboard, focus and source rules

Native buttons/selects/inputs remain in tab order. The staff is one labeled composite with a visible entry focus and text event list alternative (part, printed measure, event, pitch/rest, onset/duration, provenance and review status). Left/Right selects previous/next event; Ctrl+Left/Right selects previous/next measure within the edit part; Up/Down changes a focused note one diatonic step while preserving/explicitly displaying accidental; the accidental control and named pitch/octave input permit exact chromatic pitch. Tab exits the composite. Announce changed pitch/duration and affected measures once per command in a polite status region. Arrow editing runs only with staff entry focus, never while typing or using selects. Escape cancels pending insertion/drag and returns to its origin. Undo/Redo are named buttons with Ctrl+Z / Ctrl+Shift+Z when not typing. There is no keyboard trap or pointer-only drag requirement.

The original PDF is immutable. Overlays distinguish Exact original region, Original regions combined after edits, Manually repaired measure region, and No reliable source correspondence. A measure rectangle is not an exact note box. Moved material preserves original provenance, including multiple pages when necessary; inserted notes have no invented original symbol box. Unknown/invalid regions show explicit unavailable text and block review/confirmation for affected measures until repaired against the original. Overlay labels and outlines remain visible without color. Future PDF/source tests cover first/last pages, rotation 0/90/180/270, zoom and scroll; overlay alignment tolerance is one CSS output pixel with no canonical-coordinate rounding.

Every acceptance case below must be exercised with pointer, keyboard-only, non-color display and narrow viewport in the real browser. Node VM DOM checks are useful orchestration checks; they do not prove staff rendering, source coordinates, focus visibility or spoken screen-reader output. Actual assistive-technology speech observation is recorded separately when performed.

## Decision acceptance walkthrough

### D-01: Direct staff pitch and rhythm editing

Open original pp-03; focus upper m2-e1. Pointer: drag its notehead up one staff step, then choose Quarter in the rhythm toolbar. Keyboard: navigate to the same note, press Up, then Tab to Duration and choose Quarter; exact pitch is also editable through named pitch, accidental and octave controls. Both paths produce the same semantic command and selected event identity; text announces pitch and duration. Selection outline and readable pitch text supplement color. At narrow width toolbar wraps without hiding the active duration. Clicking an empty staff area must not silently change an existing note. Escape cancels an unfinished drag; Undo restores the complete prior command.

### D-02: Note/rest tool and intended placement

Select Insert note or Insert rest, choose Eighth, then click the intended rhythmic slot and staff pitch. A preview shows part, measure, onset, duration and intended pitch before placement. Keyboard equivalent: choose tool and duration in native controls; focus a measure, use Left/Right to choose a legal rhythmic slot and Up/Down or named pitch control for pitch; Enter commits, Escape cancels. Rest ignores pitch. Announce insertion once, move selection to the new stable event and show No original symbol location. Tool state is labeled/pressed, not color-only. On mobile tools sit above the score and commit requires a deliberate tap; scrolling never inserts a symbol.

### D-03: Automatic redistribution across barlines

In pp-03 upper m2 change the first dotted eighth to a quarter (adds 1/4 quarter-beat). The command moves following material across m2/m3 and any subsequent measures required until conservation reaches a valid boundary; it does not merely leave a mismatch warning. Highlight the full affected set, label Moved by rhythm edit, and offer Show changes plus Undo. The same command through keyboard Duration gives the same affected set. Reverse with a shortening edit and verify underflow pulls material back across barlines. Split boundary notes with ties where required; never drop a tail, rest, pickup or terminal event. A terminal edit that cannot be represented safely is rejected atomically with an explanation, without partial mutation. Ripple highlights survive scrolling and the change list is navigable without color. Source overlays show provenance unions rather than fabricated relocated original boxes.

### D-04: Whole-score correction with one practice part

Set Practice part to UPPER. Select LOWER m2 and alter pitch through staff or keyboard. LOWER remains editable; UPPER retains the textual Practice part badge and stronger outline/emphasis. The edit selection and practice selection are announced separately. Part selector remains reachable at 375px. Confirm/replay still targets exactly one melodic part; no control implies ensemble grading. Changing practice part never changes notes or erases review marks.

### D-05: Linked original beside notation

Select upper m5 on page 2 from page 1. Original automatically scrolls to page 2 and outlines the correct measure/staff region while keyboard focus remains on m5. Use Jump to original to focus its source heading, then Back to notation to restore m5 focus. On narrow screens the stacked source pane follows the same selection and displays Selected upper, measure 5, page 2. Repeat at zoom and rotation and for a reflowed measure spanning original regions/pages. Unknown mappings do not show a confident highlight. Compare the authored measure rectangle, not an asserted precise note location.

### D-06: Issues plus free browsing

Use Next issue to visit an uncertain note/measure, with visible reason and X of Y issues. Keyboard activates the same native button. Independently navigate to any issue-free part/measure and edit it; no wizard blocks free movement. At the last issue, state Last issue (or a labeled wrap to First issue), never silently jump unpredictably. Zero issues says No flagged issues, still requires review. Issue icons have text labels. Mobile retains both measure navigation and Next issue. Focus stays on the chosen target after source scrolling; fixed headers never obscure it.

### D-07: Partial recognition and unavailable regions

Use pp-12 with upper m6 missing and lower m7 corrupt. Show a page/part/measure availability list: Recognized and editable where usable; Missing source or Corrupt/unavailable in those two regions. Open and correct upper m1-m4 without retrying the whole file. Next issue can explain an unavailable region without inventing recognized notes. Pointer/keyboard navigation can reach both successful and failed passages; a read-only unavailable panel explains retry/reupload or source repair as applicable. Source repair alone never restores absent semantics. No measure-review/confirmation action can certify missing or corrupt source. A user can confirm an eligible selected-part range elsewhere after review; no entire-score complete claim appears. On mobile the partial-state banner and per-region labels remain visible.

### D-08: Explicit Save draft and unsaved navigation

Change a pitch: state becomes Unsaved changes. Wait, switch browser tabs, refresh authorization and return: there is no automatic draft write, localStorage fallback or hidden upload. Save draft explicitly persists a version after owner/revision validation and announces Saved. Navigating to My space with dirty work opens Stay / Discard changes; browser reload/close uses the supported beforeunload prompt. A failed save retains dirty state, error text and Retry save. A conflict offers reload/reconcile without overwriting another tab silently. Keyboard focus enters a navigation dialog, stays inside until choice, then returns to the initiating control on Stay. Touch actions use separate buttons. Session loss clears private display and disables edits; it does not autosave or pretend unsaved work was retained securely. Saving does not authorize grades.

### D-09: Partial confirmation of one part

With UPPER m1-m4 reviewed, choose UPPER, start 1, end 4 while LOWER remains a draft and page 2 contains unavailable content. The summary identifies precisely those four measures and their tempo/context/source coverage. Confirm selected section is enabled only after persisted current review invariants pass. First/last and one-measure ranges work; empty, reversed, outside-part, unavailable/gapped, stale and foreign-owner ranges are rejected server-side. Pointer and keyboard use labeled inputs; errors link/focus the first blocking measure. On mobile summary and action stay together. Success opens a versioned section, never claims the entire PDF is confirmed.

### D-10: Each measure reviewed against PDF

For each selected-part measure select it, inspect its linked original and choose Mark measure reviewed. The text list shows Reviewed against PDF or Needs review per measure and X of Y. There is no one-click undifferentiated review-all shortcut. Mark reviewed is disabled with a reason for missing/unsupported semantics or unreliable source. Merely opening, visiting or saving a measure never marks it reviewed. Keyboard can enter original, return and operate the measure-specific button; confirmation announces which measure is marked. Review states survive an explicit save/reload only for matching semantic/context/source fingerprints. On mobile compare stacked panes before marking; a status badge never hides the action or reason.

### D-11: Immutable previous confirmation during revision

Open confirmed version V1 for UPPER m1-m4. Choose Edit a new draft; change m2. The header states Draft based on V1; V1 remains selectable and replayable from Confirmed versions with its unchanged original, version identity and prior reviewed values. Save the draft, reload and open V1 again to verify preservation. Confirming the new reviewed section creates V2, never mutates V1. Browser back/forward and a second tab must retain clear version labels. Keyboard focus after creating a draft moves to its heading, and on mobile version selection remains visible. A stale save/confirmation is rejected instead of overwriting another revision.

### D-12: Renew only affected measure reviews

Mark several measures reviewed, then perform D-03. All semantically/contextually/source-affected measures (including ripple neighbors, split ties and changes propagating through effective tempo/meter/part assignment) become Needs review. The change list names each invalidated measure and reason. Unaffected marks remain Reviewed. Undo restores the prior content and exact review state only if its fingerprints match; redo invalidates the same set. Test both overflow and underflow, ties crossing a boundary and edits crossing page/system breaks. Pointer and keyboard paths agree. Invalidation is textual, announced once and survives explicit save/reload. Confirmation rejects a client forged Reviewed flag or a range containing any stale mark. It must not clear every measure as a shortcut.

## Final browser evidence before acceptance

Record browser/version, viewport/zoom, original hash, draft/confirmation IDs, selected part/range, pointer and keyboard action traces, focus and source screenshots, and observed outcomes for D-01 through D-12. Include save failure/conflict, visibility refresh, expiry, two-account direct access denial, partial failure, reload/reopen, and replay through the preserved transport. No current browser trace or UI implementation is claimed by this document.

Approval decision needed at 03-02-03: accept these interactions and responsive/keyboard/error cases, or provide specific adjustments preserving all locked decisions. Protocol/rights/budget approval in 03-02-02 is separate and cannot approve this design implicitly.
