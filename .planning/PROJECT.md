# Pitch Proof

## What This Is

Pitch Proof is a browser-based practice platform for individual singers at home. A singer uploads a PDF music score, reviews and corrects the recognized notation, selects one vocal part and a starting measure, then sings while the app follows the score and shows real-time pitch and timing feedback.

The existing application is an early prototype rather than a design constraint. Its useful browser-audio and pitch-analysis ideas may be retained, but the product architecture, interface, and implementation can be redesigned around score-guided practice.

## Core Value

A singer can immediately see exactly which written notes they sang sharp or flat and where they were early or late.

## Business Context

- **Customer**: Individual singers practicing independently at home
- **Revenue model**: Not yet decided
- **Success metric**: Singers can complete score-guided sessions and use accurate per-note feedback to improve repeated attempts
- **Strategy notes**: Prioritize trustworthy pitch and timing feedback over secondary coaching or visualization features

## Requirements

### Validated

- ✓ Open one manually verified vocal example, review its fixed tempo, and choose a valid starting measure — Phase 1
- ✓ Check browser microphone readiness, hear a count-in, and start, stop, or retry an example attempt — Phase 1
- ✓ Follow the fixture's audio-clock score position, see provisional pitch/onset observations, and recover an uncertain position without grading notes — Phase 1
- ✓ Use the example-practice controls by keyboard with visible focus and non-color status text — Phase 1

### Active

- [ ] Users can create accounts and securely access their private practice material and history
- [ ] Users can upload PDF music scores to cloud storage
- [ ] The app can recognize musical notation, measures, tempo information, staves, and vocal parts from a PDF score
- [ ] Users can review and correct recognized notes, measures, tempo, and voice-part assignments before practice
- [ ] Users can select one vocal part and choose the measure where practice begins
- [ ] The app provides a metronome and count-in aligned with the selected tempo and starting measure
- [ ] The app follows one singer through the selected score part during practice
- [ ] The score shows the current position and real-time sharp, flat, early, and late feedback
- [ ] Each session saves per-note pitch and timing results to practice history
- [ ] Users can compare repeated attempts and observe improvement over time
- [ ] Saving the raw voice recording is optional for each session
- [ ] Core score, audio, and feedback behavior is covered by automated tests and explicit accuracy checks

### Out of Scope

- Simultaneous ensemble or multi-user performance tracking — the product evaluates one singer at a time
- Automatic grading of multiple vocal parts at once — users select one melodic line for each session
- Preserving the current visual design or monolithic implementation — the prototype may be redesigned freely
- Requiring raw voice recordings in practice history — recording retention is optional
- Treating AI-written coaching as the source of pitch or timing truth — primary feedback must be derived from the score and measured performance

## Context

- The current codebase is a static browser application with `index.html`, `script.js`, `practice-fixture.js`, and `practice-audio.js`.
- Phase 1 uses Web Audio and `getUserMedia` for local analysis, an original verified score fixture, and a fixture-clock timeline. It has 32 passing Node tests and recorded Chrome/device acceptance.
- The former prototype's recording/download, aggregate tuning statistics, and client-side AI request are no longer in the current interface. The app still has no backend, accounts, persistence, PDF recognition, or authoritative score-linked grading.
- PDF optical music recognition is inherently imperfect. The product therefore requires a review-and-correction step before a recognized score is used for evaluation.
- Scores may contain several staves or SATB parts, but a practice session evaluates only the one part selected by the singer.
- Feedback must be visible during singing, directly in the score context, without requiring the singer to wait for a post-session report.
- Practice history should retain the score, selected part and range, recognition/correction state, tempo, and per-note results. Raw session audio is stored only when the user opts in.

## Constraints

- **Platform**: Browser-based experience — microphone capture, score display, and real-time feedback must work in a modern web browser
- **Input format**: PDF sheet music is the required score input — recognition must handle digital PDFs and define clear behavior for scans or unsupported notation
- **Evaluation scope**: One singer and one selected melodic part per session — polyphonic ensemble grading is excluded
- **Latency**: Pitch and timing classification must update quickly enough to feel real time — delayed feedback undermines the core value
- **Accuracy**: Pitch, score position, and timing results must be testable and confidence-aware — incorrect authoritative feedback would damage trust
- **Privacy**: Scores, practice history, and optional recordings are user-private — access control and clear retention behavior are required
- **Security**: Third-party service credentials must remain server-side — the existing client-side API-key pattern cannot be retained
- **Correction workflow**: Recognized notation must remain editable before practice — the app cannot assume automatic PDF recognition is perfect

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Redesign around score-guided practice rather than preserve the prototype architecture | The prototype was not planned around the intended product | — Pending |
| Use PDF sheet music as the primary upload format | Users already possess and practice from PDF scores | — Pending |
| Require recognition review and manual correction before practice | Optical music recognition can misread complex or scanned scores | — Pending |
| Evaluate one selected vocal part and one singer per session | Keeps feedback understandable and the initial signal-processing problem tractable | — Pending |
| Show pitch and timing feedback on the score in real time | Immediate knowledge of sharp/flat and early/late notes is the product's core value | — Pending |
| Include accounts, cloud storage, and practice history | Users need continuity across scores and repeated attempts | — Pending |
| Make raw recording retention optional | Progress data is valuable without forcing storage of sensitive voice recordings | — Pending |
| Start with a manually verified example score and keep microphone observations ungraded | This proves browser timing and transport before PDF recognition and measured per-note feedback | Phase 1 verified |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-27 after Phase 1*
