# Requirements: Pitch Proof

**Defined:** 2026-09-24
**Core Value:** A singer can immediately see exactly which written notes they sang sharp or flat and where they were early or late.

## v1 Requirements

### Accounts and Private Library

- [ ] **AUTH-01**: A singer can create an account with email and password.
- [ ] **AUTH-02**: A singer can sign in and reset a forgotten password.
- [ ] **LIB-01**: A singer can upload a PDF to a private score library and see processing status or a clear error.

### Score Recognition and Review

- [ ] **SCORE-01**: The app proposes notes, rests, measures, tempo, and vocal parts from supported printed PDF scores.
- [ ] **SCORE-02**: A singer can compare the original PDF with an editable digital score.
- [ ] **SCORE-03**: A singer can select one vocal part and correct its notes, rhythm, measure structure, and tempo.
- [ ] **SCORE-04**: A singer can confirm a corrected score version; unsupported or unconfirmed passages cannot receive grades.

### Live Practice

- [x] **PRAC-01**: A singer can choose a starting measure and review the selected part and tempo before singing.
- [x] **PRAC-02**: A metronome and count-in begin from the selected measure.
- [x] **PRAC-03**: A singer can check microphone readiness and start, stop, or retry a session.
- [x] **PRAC-04**: The score shows the current position and provides a way to recover if tracking is lost.

### Real-Time Feedback

- [ ] **FEED-01**: Each assessable note shows real-time sharp, flat, or in-tune feedback with its pitch deviation.
- [ ] **FEED-02**: Each assessable note shows real-time early, late, or on-time feedback with its timing deviation.
- [ ] **FEED-03**: Missed notes and uncertain audio or score positions are clearly distinguished from wrong notes.

### Practice History

- [ ] **HIST-01**: A singer can review saved, note-by-note results on the score after a session.
- [ ] **HIST-02**: Practice history records the score version, part, measure range, tempo, and per-note results.
- [ ] **HIST-03**: A singer can compare repeated attempts made against the same score version, part, range, and tempo.

### Recording, Privacy, and Access

- [ ] **AUDIO-01**: A singer can optionally save a voice recording for a session; cloud recording is off by default.
- [ ] **AUDIO-02**: A singer can play or delete a recording they chose to save.
- [ ] **PRIV-01**: A singer can access and delete their own scores and practice data.
- [ ] **ACCESS-01**: Primary controls and feedback work with a keyboard and do not rely on color alone.

## v2 Requirements

Deferred until the score-guided single-pass workflow and feedback accuracy are validated.

### Focused Practice

- **PRACTICE-01**: A singer can choose an ending measure and loop a phrase with an optional count-in on each repeat.
- **PRACTICE-02**: A singer can jump from a troublesome result directly to that measure for another attempt.
- **PRACTICE-03**: A singer can hear a reference pitch or the selected part before practice.
- **PRACTICE-04**: A singer can change practice tempo while the metronome, score position, and timing feedback remain synchronized.

### Expanded Insight and Input

- **HISTORY-01**: A singer can view longer-term pitch and timing trends across comparable attempts.
- **SCORE-05**: A singer can import additional notation styles and more complex or lower-quality scans after recognition quality is measured.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Simultaneous ensemble or multi-user grading | The initial product evaluates one singer and one selected melodic line per session. |
| Grading every part in a multi-staff score at once | The singer selects one part to avoid ambiguous targets. |
| Automatically trusting every PDF recognition result | Incorrect recognized notes would produce misleading feedback; the singer confirms a corrected score. |
| Claiming arbitrary handwritten or damaged PDF support at launch | Recognition and correction quality must be demonstrated on a defined supported subset. |
| Mandatory cloud storage of raw voice audio | Per-note results remain useful without retaining a sensitive recording. |
| Subjective overall singing-quality or AI coaching grade as the source of truth | The product prioritizes measured, score-linked pitch and timing evidence. |
| Preserving the prototype's visual design or monolithic architecture | The existing implementation is a source of useful ideas, not a product constraint. |

## Traceability

Each v1 requirement has exactly one owning phase. Later phases may strengthen an earlier capability without taking ownership of its requirement.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| LIB-01 | Phase 3 | Pending |
| SCORE-01 | Phase 3 | Pending |
| SCORE-02 | Phase 3 | Pending |
| SCORE-03 | Phase 3 | Pending |
| SCORE-04 | Phase 3 | Pending |
| PRAC-01 | Phase 1 | Complete |
| PRAC-02 | Phase 1 | Complete |
| PRAC-03 | Phase 1 | Complete |
| PRAC-04 | Phase 1 | Complete |
| FEED-01 | Phase 4 | Pending |
| FEED-02 | Phase 4 | Pending |
| FEED-03 | Phase 4 | Pending |
| HIST-01 | Phase 5 | Pending |
| HIST-02 | Phase 5 | Pending |
| HIST-03 | Phase 5 | Pending |
| AUDIO-01 | Phase 6 | Pending |
| AUDIO-02 | Phase 6 | Pending |
| PRIV-01 | Phase 6 | Pending |
| ACCESS-01 | Phase 1 | Pending |

**Coverage:**

- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-09-24*
*Last updated: 2026-09-24 after initial definition*
