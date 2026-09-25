# Roadmap: Pitch Proof

## Overview

Deliver a single-singer, single-part practice loop in six vertical increments. First prove score timing and microphone flow with one manually verified example score. Add private accounts, then supported PDF import with correction and a confirmed score version. Only the confirmed score can become the reference for measured live pitch and timing feedback. Save comparable per-note attempts, then complete optional recording retention and deletion controls. A fixture practice slice does not establish support for arbitrary PDF scores; each trust gate below must pass before the next claim is made.

## Phases

**Phase Numbering:** Integer phases are planned milestone work; decimal phases are reserved for urgent insertions.

- [ ] **Phase 1: Verified Example Practice** - A singer can complete a short, score-guided attempt from a chosen measure using a manually verified example.
- [ ] **Phase 2: Private Practice Access** - A singer can create, recover, and access a private practice workspace.
- [ ] **Phase 3: Corrected PDF Score** - A singer can turn a supported PDF into a confirmed, correctable single-part score while keeping the source visible.
- [ ] **Phase 4: Trustworthy Live Feedback** - A singer can see measured pitch and timing results on the corrected score during singing.
- [ ] **Phase 5: Comparable Practice History** - A singer can review per-note results and compare equivalent attempts.
- [ ] **Phase 6: Recording Choice and Data Control** - A singer controls optional raw audio and can access or delete private practice data.

## Phase Details

### Phase 1: Verified Example Practice
**Goal:** A singer can rehearse one manually verified example score from a chosen measure with working microphone, tempo, transport, and accessible score-position controls.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** PRAC-01, PRAC-02, PRAC-03, PRAC-04, ACCESS-01
**Success Criteria** (what must be TRUE):
  1. A singer can open the manually verified example, select its one vocal part and a valid starting measure, and review the tempo before starting.
  2. A singer can check microphone readiness, hear the metronome and count-in from that measure, then start, stop, and retry an attempt.
  3. During the example attempt, the score shows its current position and provisional pitch and timing observations; when tracking loses confidence, the singer sees an ungraded state and can restore position without restarting the app.
  4. A singer can use the primary practice controls and read score-position status with a keyboard and without relying on color alone.
**Exit gate:** Replay annotated example-score timelines covering a pickup, silence, wrong pitch, and octave ambiguity; check count-in, position, and microphone lifecycle on a real browser and device. Any experimental pitch or timing observations remain provisional until Phase 4 measurement. This phase does not accept arbitrary PDF uploads.
**Plans:** TBD
**UI hint**: yes

### Phase 2: Private Practice Access
**Goal:** A singer can securely enter a private workspace that can later hold scores and practice history.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. A singer can create an account with email and password and return to the same private workspace after signing out and back in.
  2. A singer who has forgotten a password can reset it and regain access.
  3. A second signed-in account cannot open the first account's private workspace or resources through the interface or a direct request.
**Exit gate:** Exercise account creation, recovery, session expiry, and two-account authorization checks, including direct resource requests. Set owner-scoped data and object access rules before the PDF library is added.
**Plans:** TBD
**UI hint**: yes

### Phase 3: Corrected PDF Score
**Goal:** A singer can upload a supported printed PDF, review the recognized single vocal part against the original, correct it, and confirm a trustworthy score version for practice.
**Mode:** mvp
**Depends on:** Phase 2 and the verified score contract from Phase 1
**Requirements:** LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04
**Success Criteria** (what must be TRUE):
  1. A singer can upload a supported PDF into a private score library and see processing progress, a completed candidate, or an actionable failure or unsupported-score message.
  2. A singer can view the original PDF beside an editable digital score containing proposed notes, rests, measures, tempo, and vocal parts.
  3. A singer can choose one vocal part and correct its pitches, rhythm, measure structure, and tempo before practice.
  4. A singer can confirm a corrected score version and reopen it alongside the original PDF; unconfirmed or unsupported passages remain visibly ungraded and cannot be used for authoritative feedback.
**Exit gate:** Establish a permissioned corpus of representative printed digital PDFs and eligible scans, publish the supported-notation contract, and measure raw recognition, correction completeness and effort, and source-to-score correspondence against gold annotations. Replay confirmed revisions through the Phase 1 timeline. Resolve the selected OMR tool's deployment license before release. PDFs outside the measured subset receive clear unsupported behavior.
**Plans:** TBD
**UI hint**: yes

### Phase 4: Trustworthy Live Feedback
**Goal:** A singer can use a confirmed score to see immediate, confidence-aware pitch and timing evidence on each assessable note.
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** FEED-01, FEED-02, FEED-03
**Success Criteria** (what must be TRUE):
  1. While singing one selected part, a singer sees sharp, flat, or in-tune feedback with measured cents deviation on the corresponding assessable note of the corrected interactive score.
  2. The same score note shows early, late, or on-time feedback with measured timing deviation as the performance proceeds.
  3. A missed note and a note with uncertain audio or score position are visibly distinct from a confidently measured wrong note; uncertain notes receive no authoritative grade.
  4. After a tracking error or hesitation, a singer can use the position recovery control and see feedback resume only when the position is trustworthy again.
**Exit gate:** On corrected PDF scores, measure false pitch and timing labels, abstention, follower recovery, musician-label agreement, and capture-to-display latency using consented or licensed annotated solo singing across relevant ranges, browsers, and devices. Set documented pass limits before evaluation; authoritative labels and pilot release wait until the limits pass. Live and saved outcomes use the same versioned evaluation policy.
**Plans:** TBD
**UI hint**: yes

### Phase 5: Comparable Practice History
**Goal:** A singer can review what happened on every assessable note and compare repeat attempts under equivalent score conditions.
**Mode:** mvp
**Depends on:** Phase 4
**Requirements:** HIST-01, HIST-02, HIST-03
**Success Criteria** (what must be TRUE):
  1. After a session, a singer can reopen the score and inspect each note's pitch and timing result, including missed and ungraded reasons.
  2. A saved attempt retains the confirmed score version, selected part, measure range, tempo, evaluation policy, and per-note results, and can be reopened later.
  3. A singer can compare attempts made with the same score version, part, range, and tempo; incompatible attempts are clearly identified rather than mixed into an improvement claim.
**Exit gate:** Verify immutable note identity and score-version links across save and reload, equivalent-attempt matching, and agreement between live and saved labels. Per-note results save successfully without any raw voice recording.
**Plans:** TBD
**UI hint**: yes

### Phase 6: Recording Choice and Data Control
**Goal:** A singer can decide per session whether to retain raw voice and can access or remove their private scores, results, and retained recordings.
**Mode:** mvp
**Depends on:** Phase 5 for complete data deletion; Phase 2 account ownership and Phase 4 audio capture
**Requirements:** AUDIO-01, AUDIO-02, PRIV-01
**Success Criteria** (what must be TRUE):
  1. Before each session, a singer can choose whether to save raw voice; cloud recording is off by default, while note-by-note history still saves when recording is off.
  2. A singer can play or delete a recording they chose to retain; deleting it leaves the session's per-note results available.
  3. A singer can access and delete their own scores and practice data, and cannot access another singer's files or results by direct link or request.
**Exit gate:** Verify that opt-out sessions transmit no raw voice for storage, recording deletion revokes access, score and history deletion follow the stated retention behavior, and two-account row/object authorization holds. Recheck keyboard and non-color feedback across the full workflow and document the measured PDF support and feedback limits before pilot release.
**Plans:** TBD
**UI hint**: yes

## Progress

**Execution Order:** Phase 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Verified Example Practice | 0/TBD | Not started | - |
| 2. Private Practice Access | 0/TBD | Not started | - |
| 3. Corrected PDF Score | 0/TBD | Not started | - |
| 4. Trustworthy Live Feedback | 0/TBD | Not started | - |
| 5. Comparable Practice History | 0/TBD | Not started | - |
| 6. Recording Choice and Data Control | 0/TBD | Not started | - |
