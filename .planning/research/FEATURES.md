# Feature Research

**Domain:** Browser-based, score-guided solo vocal practice from uploaded PDF music
**Project:** Pitch Proof
**Researched:** 2026-09-24
**Confidence:** MEDIUM (official product and standards sources are current; prioritization and feedback design are product inferences awaiting user validation)

## Scope and evidence

The [project brief](../PROJECT.md) sets the product contract: PDF upload, recognition with correction, one chosen vocal part, a chosen starting measure, count-in, live on-score pitch/timing feedback, private history, comparison, and optional recording retention. The [existing prototype](../codebase/ARCHITECTURE.md) already captures a microphone and estimates pitch, but has no score, score position, persistent identity, or history. These local facts have **HIGH** confidence. The feature tiers below are recommendations, not measured demand. They have **MEDIUM** confidence until tested with singers.

Official product documentation shows that PDF/music-image import and correction, part selection, looping, variable speed, and count-in exist in adjacent practice products ([Soundslice import and review](https://www.soundslice.com/help/en/creating/pdf-import/344/reviewing/), [Soundslice player](https://www.soundslice.com/help/en/player/basic/4/looping/), [PlayScore 2](https://www.playscore.co/)). Yousician advertises immediate pitch/timing feedback for singing ([Yousician singing](https://yousician.com/singing)). These are evidence of available product behaviors, **not** evidence that any competitor grades arbitrary imported PDFs accurately. The combination of editable imported score, one-part tracking, explainable per-note results, and cautious uncertainty handling is Pitch Proof's proposed value (**MEDIUM**, product inference).

**Complexity key:** LOW = bounded UI/persistence work; MEDIUM = several linked states or data models; HIGH = music recognition, temporal alignment, live audio accuracy, or substantial interaction design. Complexity is relative to this prototype.

## Table Stakes (Users Expect These)

These are minimum behaviors for the stated product, even where implementation is difficult. Each row is an atomic scope option; the v1 column below resolves launch priority.

| ID | Feature / user-facing behavior | Why expected | Complexity | Confidence / notes |
|----|--------------------------------|--------------|------------|--------------------|
| T01 | Create an account, sign in/out, recover access, and see only one's own scores and sessions. | Cloud history needs a durable private identity. | MEDIUM | HIGH project requirement; MEDIUM implementation scope. |
| T02 | Upload a PDF; see filename, pages, progress, processing status, and a usable error for invalid, oversized, encrypted, unreadable, or unsupported files. | A singer must know whether the score is ready and why it is not. | MEDIUM | HIGH project requirement; MEDIUM behavior inference. Soundslice previews and queues PDF imports ([source](https://www.soundslice.com/help/en/creating/pdf-import/343/starting-the-import/)). |
| T03 | View the source page beside or aligned with recognized notation before practice, with page/measure navigation. | Recognition errors cannot be judged without the source. | HIGH | MEDIUM, supported by Soundslice's scan/editor comparison ([source](https://www.soundslice.com/help/en/creating/pdf-import/346/editing-scans/)). |
| T04 | Confirm or correct clef/key/time signature, notes/rests, accidental, octave, duration, barlines/measure numbers, tempo, and staff-to-part mapping for the chosen line; save corrections. | Each field can change target pitch or timing. | HIGH | HIGH need from project; MEDIUM field set inference. Soundslice exposes uncertainty questions and part reassignment ([review](https://www.soundslice.com/help/en/creating/pdf-import/344/reviewing/), [assignment](https://www.soundslice.com/help/en/creating/pdf-import/324/instrument-assignment/)). |
| T05 | Show unresolved or unsupported notation visibly and require resolution or an explicit excluded range before grading that passage. | An unknown target cannot fairly be scored. | MEDIUM | MEDIUM inference; recognition limits are explicit in [Soundslice's supported-notations list](https://www.soundslice.com/help/en/creating/pdf-import/294/supported-notations/). |
| T06 | Select exactly one vocal part; display the selected staff and target range distinctly while preserving score context. | SATB or multi-staff PDFs otherwise make the target ambiguous. | MEDIUM | HIGH project requirement; part isolation is documented by [PlayScore 2](https://www.playscore.co/). |
| T07 | Select a starting measure and see the chosen tempo, meter, count-in length, metronome state, and first target note before starting. | A singer needs a predictable entry, especially mid-piece. | MEDIUM | HIGH project requirement; count-in/metronome are established controls in [Soundslice](https://www.soundslice.com/help/en/player/basic/8/metronome-and-count-in/). |
| T08 | Start, pause/resume, stop, and retry a session; preserve measure position and distinguish an aborted attempt from a completed one. | Practice is interrupted and repeated. | MEDIUM | MEDIUM workflow inference. |
| T09 | Before starting, request microphone permission with a level check; show a recovery path for denial, absent device, or unreadable device. | Capture can fail outside the app's control. | MEDIUM | HIGH browser fact from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia); MEDIUM UX inference. |
| T10 | Move a clear current-position marker through the chosen part while the singer sings; keep it readable at zoomed score sizes. | The singer must connect heard/graded sound to notation. | HIGH | HIGH project requirement. |
| T11 | On each assessable note, show target and observed pitch with signed cents deviation, plus explicit sharp/flat/in-tune label; show onset offset as early/late/on-time with units or a documented tolerance. | A broad "accuracy" score does not tell the singer what to fix. | HIGH | HIGH project core value; numerical presentation is MEDIUM design recommendation. |
| T12 | Differentiate rest, silence, missed note, unstable/low-confidence pitch, score-position uncertainty, and microphone failure from a wrong sung note; do not assign sharp/flat/early/late when evidence is insufficient. | False certainty destroys trust. | HIGH | MEDIUM inference from project accuracy constraint; validate thresholds with labeled singing samples. |
| T13 | Offer a post-session review linked to the score: note-by-note result, measure, target, observed deviation, timing offset, and ungraded reason where applicable. | The singer needs a stable view after real-time overlays pass. | HIGH | HIGH project requirement; detail level MEDIUM inference. |
| T14 | Save attempt date, score version, selected part, measure range, tempo, correction state, and per-note results; reopen the attempt later. | Repeat practice is the success metric. | MEDIUM | HIGH project requirement. |
| T15 | Compare like-for-like attempts on the same score version/part/range and show pitch and timing change; flag changed score or tempo instead of silently mixing results. | Improvement must be interpretable. | HIGH | HIGH project requirement; comparability rule MEDIUM inference. |
| T16 | Ask per session whether to retain raw voice audio; default to no cloud retention, show what is saved, and permit deletion of retained audio. | Voice is sensitive and results are useful without the recording. | MEDIUM | HIGH project requirement; default is MEDIUM privacy recommendation. |
| T17 | Provide keyboard-reachable controls, visible focus, zoomable score, text/pattern labels alongside feedback colors, and a non-flashing status summary for assistive technology. | Score practice must not depend on color, pointer precision, or hearing a click. | MEDIUM | HIGH accessibility basis in [WCAG 2.2](https://www.w3.org/TR/WCAG22/); specific UX is MEDIUM inference. |

## Differentiators (Competitive Advantage)

The first three are the product's proposed differentiators and still belong in v1. Others are optional increments.

| ID | Feature / user-facing behavior | Value proposition | Complexity | Confidence / notes |
|----|--------------------------------|-------------------|------------|--------------------|
| D01 | Place each pitch and onset result directly on its source-score note, with a compact label and an inspectable detail. | Turns a judgement into a precise practice action. | HIGH | HIGH fit to project core value; MEDIUM competitive inference. |
| D02 | Use a confidence-aware "not assessed" state in both live and saved results, with a specific reason and recovery suggestion. | Preserves credibility when PDF recognition, mic signal, or tracking is uncertain. | HIGH | MEDIUM product inference. |
| D03 | Make the reviewed/corrected score the explicit evaluation reference and retain its version with each attempt. | A correction becomes auditable; historic attempts remain interpretable. | MEDIUM | MEDIUM inference from review and history requirements. |
| D04 | Let the singer jump from a troublesome result to its measure, replay that phrase, and compare the next attempt note by note. | Closes the practice loop instead of merely producing analytics. | HIGH | MEDIUM inference; Soundslice already supports loops and speed control, while this result-driven link is the proposed distinction ([source](https://www.soundslice.com/help/en/player/basic/4/looping/)). |
| D05 | Choose an end measure, loop the selected passage, and optionally count in each repeat. | Concentrates work on a difficult phrase. | MEDIUM | MEDIUM; adjacent products support loops and per-loop count-in ([Soundslice](https://www.soundslice.com/help/en/player/basic/4/looping/)). |
| D06 | Practice slower or faster while keeping target timing and metronome synchronized; record actual tempo with the attempt. | Makes the passage approachable without corrupting comparisons. | HIGH | MEDIUM; variable speed exists in [Soundslice](https://www.soundslice.com/help/en/player/basic/5/playback-speed/) and [Yousician](https://yousician.com/singing). |
| D07 | Play a reference pitch or synthesized chosen part before practice, with an explicit volume/mute control. | Helps singers locate their entry and check corrected notation. | MEDIUM | MEDIUM; part listening is available in [PlayScore 2](https://www.playscore.co/). Test whether playback leaks into microphone grading. |
| D08 | Offer an accessible measure/result list with keyboard jump and textual pitch/timing values. | Lets users inspect the same evidence without relying on tiny note overlays. | MEDIUM | MEDIUM inference from [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and the score UI. |
| D09 | Show practice trends by comparable phrase and by pitch versus timing separately, with confidence/coverage alongside improvement. | Gives progress a diagnostic meaning. | HIGH | MEDIUM inference; requires enough repeat attempts and stable comparability rules. |

## Anti-Features (Commonly Requested, Often Problematic)

| Anti-feature | Why requested | Why problematic here | Alternative |
|--------------|---------------|----------------------|-------------|
| Grade all vocal parts or a choir at once | Feels comprehensive for SATB material. | One microphone cannot reliably attribute overlapping voices to individual parts in this solo product; expands alignment and UI scope. | Grade the one selected line per session; permit switching parts between sessions. |
| Publish an overall "singing quality" or emotional/AI coaching grade as ground truth | Appears motivating. | It obscures which note or onset was measured and may invent explanations. | Measured per-note pitch/timing evidence; optional coaching later must cite that evidence. |
| Automatically accept every PDF recognition result without review | Speeds first run. | An erroneous target yields systematically false feedback. | Review high-risk notation and require confirmation of the chosen line. |
| Force raw recording upload and indefinite retention | Makes replay/history easy. | Creates unnecessary sensitive data, storage cost, and trust burden. | Save per-note results by default; opt in to raw audio for each attempt. |
| Display a red "wrong" mark for silence, noise, weak signal, or lost score position | Keeps the UI simple. | Confuses no evidence with evidence of an error. | Separate missed, ungraded, and device/problem states. |
| Promise arbitrary complex, handwritten, or damaged scores at launch | Broadens apparent market. | Recognition support varies by notation and source quality; even mature products publish limits ([Soundslice](https://www.soundslice.com/help/en/creating/pdf-import/294/supported-notations/)). | Publish a supported-scores contract and a clear review/reject path. |
| Make leaderboards, streak pressure, or public score sharing central | Gamifies practice. | Pulls attention from accurate solo feedback and conflicts with private material/history. | Private progress comparison first; sharing only if explicitly requested later. |
| Speak every live pitch judgement aloud | Could seem accessible. | Frequent speech can mask singing and timing, and contaminate the mic signal. | User-controlled spoken summary at pause/end and accessible text/status updates. |

## Feedback semantics and failure contract

These are proposed user-facing rules (**MEDIUM** confidence until validated against singers and labeled audio), not claims that the current prototype meets them.

| State | What the singer sees | Evaluation rule |
|-------|----------------------|-----------------|
| Active/awaiting note | Current note and next entry, neutral marker | No grade until enough audio and a matching score window exist. |
| Assessed | Target pitch, observed median/stable pitch, signed cents, onset offset, plain-language label | Use a documented tolerance; pitch and timing are separate outcomes. |
| Missed | "No note detected" on an expected note | Only when capture was healthy and the expected window elapsed. It is not "flat" or "late." |
| Rest | Rest or breath interval marker | No pitch grade; an audible entrance in a rest may be flagged separately only when reliable. |
| Low-confidence audio | "Could not assess: weak/noisy/unstable signal" | Exclude from tuning averages and comparison denominators. |
| Position uncertain | "Place lost—pause and resume at measure …" | Stop authoritative note grading until reacquired or user resets the measure. |
| Score uncertain | Highlight unconfirmed notation/range | Block grading for that passage; offer correction or skip. |
| Microphone unavailable | Permission/device guidance, clear retry | Session does not begin or is marked interrupted; no missed-note grades. |

Do not label an onset "early" simply because a singer entered before an *incorrectly recognized* target. Versioned score corrections and evidence confidence are prerequisites. A live UI may show a tentative pitch trace, but only stable classified results should be saved. Preserve both raw measured offsets and human labels so tolerances can be evaluated and changed without pretending historical measurements changed.

## Feature Dependencies

```text
PDF upload (T02) -> source preview (T03) -> notation/part correction (T04, T05)
  -> confirmed target line (T06) -> start measure + tempo/count-in (T07)
  -> microphone readiness (T09) -> score tracking (T10)
  -> confident per-note pitch/timing classification (T11, T12, D01, D02)
  -> saved versioned results (T13, T14, D03) -> comparable attempts (T15, D04, D09)

Account/private storage (T01) -> cloud score and history (T02, T14)
Optional audio retention (T16) -> explicit per-session choice; not required by result history
Selected range (T07) -> optional end measure/loop (D05) -> optional tempo progression (D06)
Keyboard/semantic score model (T17) -> accessible result list (D08)
```

**Ordering notes:** Recognition review must precede score-guided grading. A testable, stable score-event identity and score version must precede per-note history and comparisons. The metronome and scoring timeline must share the same tempo map, particularly after a mid-score start. Looping and speed controls should follow a correct single-pass timeline. Results history must not depend on storing audio. Treat privacy and accessibility as cross-cutting acceptance criteria in every phase, not a closing polish phase.

## MVP Definition

### Launch With (v1)

- [ ] **Private account and library:** T01, T02, including usable import/failure states.
- [ ] **Reviewable source of truth:** T03–T06 and D03. Permit a narrow, published notation subset, but do not grade unsupported/unconfirmed ranges.
- [ ] **Single-part live practice:** T07–T12 and D01–D02; start at any supported measure, hear count-in, follow the score, and receive cautious pitch/timing feedback.
- [ ] **Review and improvement:** T13–T15. At least two comparable attempts must be explorable note by note.
- [ ] **Privacy and usable access:** T16–T17, including opt-in audio retention, deletion, non-color labels, keyboard control, and text equivalents.

This is a substantial v1 because the brief defines an end-to-end score-guided practice product. If the recognition/evaluation accuracy gate cannot be met, release a clearly labeled private pilot on supported score types; do not advertise broad PDF support.

### Add After Validation (v1.x)

- [ ] D05 end-measure selection and phrase loop, once single-pass position and count-in remain aligned.
- [ ] D04 result-to-repractice navigation, once phrase looping and like-for-like comparison are reliable.
- [ ] D07 reference note/chosen-part playback, once microphone bleed behavior is measured.
- [ ] D08 enhanced result navigation, building on the v1 accessible score controls.

### Future Consideration (v2+)

- [ ] D06 variable-tempo practice and progression, after timing feedback at the base tempo is trusted.
- [ ] D09 longitudinal phrase trends, after enough comparable attempts exist.
- [ ] Broader notation/scanned-score coverage, only with measured recognition quality and correction cost.

## Feature Prioritization Matrix

| Feature cluster | User value | Cost | Priority | Rationale |
|-----------------|------------|------|----------|-----------|
| Private account, PDF library, optional retention (T01–T02, T16) | HIGH | MEDIUM | P1 | Required continuity and trust. |
| Review/correction and selected part (T03–T06, D03) | HIGH | HIGH | P1 | Defines trustworthy targets. |
| Start measure, metronome, microphone readiness (T07–T09) | HIGH | MEDIUM | P1 | Makes practice repeatable. |
| Live position and per-note feedback with uncertainty (T10–T12, D01–D02) | HIGH | HIGH | P1 | Core product value. |
| Versioned result review and like-for-like comparison (T13–T15) | HIGH | HIGH | P1 | Proves improvement across attempts. |
| Accessibility baseline (T17) | HIGH | MEDIUM | P1 | Applies to all primary controls/results. |
| Phrase loops/reference playback/expanded navigation (D05, D07–D08) | MEDIUM | MEDIUM | P2 | Improves practice after core accuracy. |
| Variable tempo and advanced trends (D06, D09) | MEDIUM | HIGH | P3 | Add after timeline and comparisons are validated. |

## Competitor Feature Analysis

| Behavior | Soundslice | PlayScore 2 | Yousician Singing | Pitch Proof recommendation |
|----------|------------|-------------|-------------------|----------------------------|
| Own PDF to interactive score | Documents PDF/image OMR, review questions, editing with source image ([help](https://www.soundslice.com/help/en/creating/pdf-import/293/overview/)) | Advertises PDF/SATB reading and part muting ([site](https://www.playscore.co/)) | Official singing page emphasizes lessons/song catalog, not an own-PDF workflow ([site](https://yousician.com/singing/)) | Own-PDF review/correction is mandatory; verify chosen line before grading. |
| Practice controls | Loop, speed, metronome, count-in ([loop](https://www.soundslice.com/help/en/player/basic/4/looping/), [count-in](https://www.soundslice.com/help/en/player/basic/8/metronome-and-count-in/)) | Tempo, loops, metronome, count-in per [how-to](https://www.playscore.co/how-to-use-ps2/) | Slow and repeat passages per [singing page](https://yousician.com/singing/) | Start measure and count-in at launch; loops/tempo changes later. |
| Singing assessment | The cited help pages describe score playback/practice; they do not establish arbitrary-PDF vocal grading. | The cited product pages describe listening to scanned scores; they do not establish microphone grading. | Advertises immediate singing accuracy/timing feedback ([site](https://yousician.com/singing/)) | Put assessable, confidence-aware pitch/timing evidence on the user's corrected score. |

Competitor rows describe only the cited official pages. Absence of a documented feature there is **not** a claim that the product lacks it. Product marketing does not establish accuracy, market share, or user preference.

## Validation Questions / Research Flags

- **Recognition gate (HIGH impact, MEDIUM confidence):** Define supported notation and scan quality, then measure correction time and target note/measure accuracy on real singer-owned PDFs. How often does the user abandon import?
- **Timing semantics (HIGH impact, MEDIUM confidence):** Test sustained notes, pickup measures, rests, ties, tempo changes, and rubato. Define when "early/late" is meaningful and when timing is ungraded.
- **Confidence thresholds (HIGH impact, MEDIUM confidence):** Test breathy/soft voices, vibrato, octave errors, room noise, accompaniment bleed, and device variability with labeled audio. Display coverage next to aggregate metrics.
- **Comparison usefulness (MEDIUM impact, MEDIUM confidence):** Interview singers about same-score/version/range comparisons and whether raw cents/onset offsets, labels, or measure summaries best guide the next take.
- **Accessibility (HIGH impact, MEDIUM confidence):** Validate an actual screen-reader/keyboard score review and practice flow; live per-note announcements may be too frequent, so offer controllable summaries.
- **Rights/retention (MEDIUM impact, LOW until policy research):** Clarify acceptable uploaded-score usage, deletion semantics, and optional recording retention before broad launch.

## Sources

- Pitch Proof [project brief](../PROJECT.md) and [mapped prototype architecture](../codebase/ARCHITECTURE.md) — local authoritative scope, HIGH.
- [Soundslice PDF import overview](https://www.soundslice.com/help/en/creating/pdf-import/293/overview/), [review](https://www.soundslice.com/help/en/creating/pdf-import/344/reviewing/), [editing scans](https://www.soundslice.com/help/en/creating/pdf-import/346/editing-scans/), [supported notation](https://www.soundslice.com/help/en/creating/pdf-import/294/supported-notations/), [part assignment](https://www.soundslice.com/help/en/creating/pdf-import/324/instrument-assignment/), [looping](https://www.soundslice.com/help/en/player/basic/4/looping/), [metronome/count-in](https://www.soundslice.com/help/en/player/basic/8/metronome-and-count-in/) — official help, reviewed 2026-09-24; verified websearch tier MEDIUM.
- [PlayScore 2 product page](https://www.playscore.co/) and [how-to](https://www.playscore.co/how-to-use-ps2/) — official product documentation, reviewed 2026-09-24; verified websearch tier MEDIUM.
- [Yousician singing](https://yousician.com/singing/) — official product page, reviewed 2026-09-24; verified websearch tier MEDIUM.
- [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) — browser API documentation, reviewed 2026-09-24; verified websearch tier MEDIUM.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) — W3C accessibility specification/guidance, reviewed 2026-09-24; verified websearch tier MEDIUM.

---
*Feature research for Pitch Proof; no user interviews or instrumented competitor testing were available.*
