# Project Research Summary

**Project:** Pitch Proof  
**Domain:** Browser based, PDF driven solo vocal practice  
**Researched:** 2026-09-24  
**Confidence:** MEDIUM

## Executive Summary

Pitch Proof is an end to end practice product: a singer uploads printed sheet music, verifies one vocal line, sings from a chosen measure, sees pitch and timing evidence on the score, and compares private attempts. The [project brief](../PROJECT.md) requires this full loop. Adjacent products document PDF recognition with review and real time singing feedback, but those sources do not establish that arbitrary PDFs can be graded accurately. The research therefore recommends a deliberately bounded v1 with a published supported score contract and a private pilot if measured recognition or feedback quality is insufficient. [Soundslice review](https://www.soundslice.com/help/en/creating/pdf-import/344/reviewing/); [Yousician singing](https://yousician.com/singing/).

Build around an immutable, reviewed score revision containing stable note, rest, measure, part, beat, play occurrence, and source page identities. Audiveris can propose notation via MusicXML; a singer must correct and confirm the selected line before it becomes the grading reference. Keep microphone analysis, count in, score following, and immediate feedback in the browser on a common audio clock. Use authenticated services for private PDF and optional recording objects, account history, and asynchronous OMR work. This architecture is a recommendation synthesized from the [stack](STACK.md) and [architecture](ARCHITECTURE.md) reports, not a measured accuracy claim.

The largest risks are wrong recognized targets, wrong voice or sounding pitch, score follower drift, noisy or octave shifted vocal estimates, unfair timing thresholds, and private data exposure. Validate representative PDFs and consented singing against gold annotations; show an explicit ungraded state when score, audio, or position is uncertain; version evaluation policy and store measured offsets with outcomes. Restrict uploads and OMR resources, prove two account isolation, and ensure an opt out session sends no raw voice to storage. [Audiveris limitations](https://audiveris.github.io/audiveris/_pages/reference/limitations/); [OWASP upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## Key Findings

### Recommended Stack

The [stack research](STACK.md) recommends TypeScript 5.x, React 19.3, Vite 8, and Node 22.12+ for a typed browser application; PDF.js 6.x for source page rendering; Audiveris 5.11.0 in an isolated Java job worker for printed score recognition; MusicXML 4.0 as interchange; and OSMD 2.1.1 for displaying corrected notation. A versioned application score model remains the authority for grading. Browser `AudioWorklet` and `pitchy` 4.x provide timestamped monophonic pitch observations, while an application owned follower maps them to score position. Supabase Auth, Postgres, and private Storage are the recommended managed account and history layer. Pin and test exact patches rather than treating listed versions as compatibility proof. [Vite 8](https://vite.dev/blog/announcing-vite8); [Audiveris CLI](https://audiveris.github.io/audiveris/_pages/guides/advanced/cli/); [MusicXML 4.0](https://www.w3.org/2021/06/musicxml40/); [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet); [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

The existing prototype supplies microphone and browser audio experience but has no score model, backend, or tests; its main thread detector, unbounded sample history, and browser credential pattern should be replaced. Audiveris is AGPLv3, so deployment obligations are a legal/product decision gate before release; a commercial OMR alternative remains contingent on benchmark and licensing review. [Local concerns](../codebase/CONCERNS.md); [Audiveris project](https://github.com/Audiveris/audiveris).

### Expected Features and v1 Boundary

The [feature research](FEATURES.md) makes the following v1 scope recommendation. These priorities and UI semantics are product inferences; the brief establishes the overall workflow.

- **Private account and PDF library:** sign in and recovery, owner only access, upload progress and actionable failures, bounded PDF processing (T01-T02).
- **Reviewable target score:** source PDF with candidate notation, correction of pitch, rhythm, clef/key/meter, tempo, measures, and staff assignment for the chosen line; explicit unsupported or excluded ranges; immutable reviewed revisions (T03-T06, D03).
- **Single part practice:** select exactly one vocal line and a supported starting measure, inspect entry and count in, check microphone, run metronome and transport, follow score position, and show pitch and onset evidence with ungraded reasons (T07-T12, D01-D02).
- **Private improvement loop:** score linked per note review, saved versioned attempts, and like for like comparison by score revision, part, range, and tempo context (T13-T15).
- **Optional raw audio:** choose retention per session, default to no cloud recording, allow deletion, and keep note results independent of recording (T16). Keyboard access, text or pattern feedback, zoom, and non flashing status belong across v1 (T17).

Supported v1 input should be printed common Western notation with one unambiguous, correctable vocal line and a deterministic play order. The exact engraving, scan quality, repeat, tuplet, divisi, and tempo limits must be set from a representative corpus; unsupported measures cannot receive authoritative grades. v1.x can add passage loops, result to re practice navigation, reference pitch, and expanded result navigation. Variable tempo progression, long term trends, broad score coverage, choir separation, public sharing, and subjective overall singing grades belong in v2+ or later validation. [Audiveris handbook](https://audiveris.github.io/audiveris/_pages/handbook/); [Soundslice supported notation](https://www.soundslice.com/help/en/creating/pdf-import/294/supported-notations/).

### Architecture Approach

The [architecture research](ARCHITECTURE.md) recommends a modular browser application, a small authenticated API/data boundary, and one asynchronous OMR worker. Recognition produces a candidate; review publishes a versioned score revision; the practice runtime consumes that revision without depending on PDF or OMR internals; finalized note outcomes pin the score revision and evaluator version. Store written and sounding pitch separately, use exact beat positions and occurrence IDs for repeats, and keep PDF geometry as a projection from stable events. The source PDF, recognition artifact, corrected revision, and session provenance support dispute resolution. [MusicXML structure](https://www.w3.org/2021/06/musicxml40/tutorial/structure-of-musicxml-files/); [Audiveris export limitations](https://audiveris.github.io/audiveris/_pages/tutorials/quick/export/).

**Major components:** upload/catalog and private object access; PDF/notation view and correction editor; OMR worker and MusicXML normalizer; canonical score validator and play order compiler; browser transport, mic observation, online follower, and versioned feedback evaluator; session/history comparison and optional recording retention. One audio clock should schedule beats and timestamp observations. Cloud failure during singing should affect saving, not local timing or classification. [MDN audio clock](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope/currentTime).

### Critical Pitfalls

The [pitfalls research](PITFALLS.md) identifies five gates that determine whether v1 feedback is trustworthy:

1. **False score targets:** OMR may misread a staff, accidental, duration, or clef. Keep original pages and artifacts, require selected line review, and block ambiguous passages before grading. Measure raw and corrected accuracy on digital and scanned gold scores.
2. **Timeline errors:** written versus sounding pitch, pickups, ties, repeats, and tempo changes can misidentify a note or onset. Normalize to stable event and occurrence IDs, validate score time, and replay golden timelines.
3. **Follower and device timing errors:** elapsed wall clock alone cannot handle hesitations, skips, or capture latency. Use audio timestamps, bounded online alignment with a confidence state, explicit resync, and browser/device latency tests.
4. **Vocal F0 and grading errors:** vibrato, consonants, weak notes, bleed, and octave mistakes can produce false sharp/flat/early/late labels. Gate on voicing and stable windows, keep measurements and a versioned policy, and compare labels with blind musician review.
5. **Private object and retention failures:** UI hiding and opaque IDs do not enforce ownership. Apply owner scoped row and storage policies, bound and isolate PDF parsing, test two accounts and direct URLs, and assert no raw audio upload when retention is off. [OWASP object authorization](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html).

## Implications for Roadmap

The phases below are a recommended dependency order, not a claim that a fixture based prototype fulfills the PDF upload requirement. Every phase has a measurable exit gate; accessibility and privacy are acceptance criteria throughout.

### Phase 1: Canonical Score and Vertical Practice Slice

**Rationale:** Prove the score to singer feedback contract with one manually verified fixture before OMR quality and cloud integration obscure defects.  
**Delivers:** typed immutable score revision, event/occurrence IDs, selected part and measure, sounding pitch and beat timeline, count in, basic PDF or score view mapping, bounded mic capture, a constrained follower, provisional pitch/timing result, and in memory session review.  
**Addresses:** T06-T12, D01-D02 as a narrow vertical slice.  
**Avoids:** index based note matching, incorrect pickup/beat math, main thread sample growth, and false grades during uncertainty.  
**Gate:** synthetic perfect performance, silence, octave, wrong note, and pickup fixtures plus a real browser/device smoke check. This phase needs focused research for timing and score following thresholds.

### Phase 2: Private Accounts and Versioned Persistence

**Rationale:** Stable score and outcome identities allow history without later migration of ambiguous records.  
**Delivers:** auth, private score catalog and object keys, revision/session/result schema, owner policies, save retry, and same revision/part/range attempt comparison. Define recording consent and deletion schema here; recording upload can wait until Phase 5.  
**Addresses:** T01, T13-T15, D03 and the data foundation of T16.  
**Avoids:** cross account access, mutable historical scores, pass/fail only history, and mandatory raw audio retention.  
**Gate:** two account row/object access tests and like for like comparison tests. Standard documented auth, RLS, and storage patterns generally need no separate research phase. [Supabase Storage access](https://supabase.com/docs/guides/storage/security/access-control).

### Phase 3: PDF Ingestion, Recognition, and Correction

**Rationale:** Import candidates can now target the proven score contract and publish reviewed revisions without changing the live engine.  
**Delivers:** bounded PDF upload and status/error UX, source preview, isolated Audiveris job, MusicXML import, source to event geometry where available, selected line correction, validation, unsupported range handling, and published reviewed revisions.  
**Addresses:** T02-T06, D03.  
**Avoids:** accepting OMR as truth, wrong staff/voice, missing geometry claims, malformed PDF resource exhaustion, and unsupported score grading.  
**Gate:** licensed representative PDF corpus, digital and scan recognition/correction measurements, end to end corrected score replay, and AGPL or commercial OMR deployment decision. Research this phase specifically: Audiveris geometry extraction and actual correction cost are unresolved.

### Phase 4: Live Feedback Accuracy and Policy

**Rationale:** Authoritative labels and history comparison require measured follower, F0, onset, and browser latency behavior on the corrected PDF path.  
**Delivers:** confidence aware position recovery, stable note estimates, one versioned pitch/timing policy shared by live and saved views, score anchored labels, explicit missed/ungraded states, and calibrated release thresholds.  
**Addresses:** completes T10-T12, D01-D02 and validates T13-T15.  
**Avoids:** vibrato flicker, octave error, device dependent late bias, lost position presented as certainty, and live/history disagreement.  
**Gate:** labeled consented singing corpus, musician agreement, false label and abstention rates by range/device/browser, position recovery, and capture to display latency. Research this phase for product specific thresholds; published algorithms are not acceptance evidence.

### Phase 5: Release Privacy, Optional Recording, and Usability

**Rationale:** Finish the full v1 workflow and verify operational trust after the end to end path is measurable.  
**Delivers:** per session raw audio retention opt in and deletion, complete score and account deletion behavior, accessible score/result navigation, upload and job resource limits, failure recovery, and private pilot release decision.  
**Addresses:** T16-T17 and final acceptance of T01-T15.  
**Avoids:** retained voice despite opt out, abandoned microphone tracks, public or stale object URLs, unusable correction/feedback controls, and broad PDF claims unsupported by evidence.  
**Gate:** opt out network test, deletion and URL tests, two account audit, accessibility checks, and supported score documentation. Standard retention and accessibility patterns need implementation verification; legal retention requirements may need targeted review.

### Phase Ordering Rationale

Score event identity and revisioning precede both feedback and durable history. A fixture driven vertical slice exposes timeline and audio problems early; cloud persistence then records the same contract; OMR plugs into it as a candidate source. Recognition review must finish before a PDF generated score is graded. Final feedback tolerances follow measurement on corrected scores and real voices. Optional audio is an independent branch from result history and never a prerequisite for comparison.

### Research Flags

Use `$gsd-plan-phase --research-phase <N>` or a targeted spike for **Phase 1** (follower and audio timing), **Phase 3** (OMR to source page geometry, correction cost, license choice), and **Phase 4** (annotated singing, latency, musician label agreement). Phase 5 needs targeted legal/privacy review if retention or licensing policy remains undecided. **Phase 2** and the conventional implementation portions of **Phase 5** can follow documented patterns, with rigorous policy and behavior tests rather than broad discovery research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Official releases and API docs support feasibility; cross library notation fidelity and deployment licenses need project validation. |
| Features | MEDIUM | Project brief establishes desired loop; competitor docs confirm adjacent behaviors, while prioritization and singer demand remain inferences. |
| Architecture | MEDIUM | Browser, MusicXML, and storage boundaries are documented; score schema, geometry linkage, and alignment approach are design proposals. |
| Pitfalls | MEDIUM | Official OMR/browser/security docs and primary singing research support failure classes; error rates and thresholds are unknown for this product. |

**Overall confidence:** MEDIUM. No source establishes acceptable OMR, score following, or early/late accuracy for Pitch Proof's target users.

### Gaps to Address

- **Representative material:** obtain permissioned digital and scanned PDFs spanning target notation, then define the supported v1 subset and recognition/correction time targets.
- **Geometry feasibility:** determine whether Audiveris project artifacts provide stable note to original page mapping; offer an event list or manual mapping when they do not.
- **Singing evidence:** acquire licensed or consented solo voice recordings with score position, onset, and pitch labels across vocal range, vibrato, rooms, and devices.
- **Feedback policy:** set cents and onset thresholds, confidence/abstention rules, and latency goals from musicians and actual devices rather than literature defaults.
- **Legal and lifecycle:** resolve Audiveris AGPL deployment, optional audio retention period, deletion and backup treatment, and rights to uploaded scores before release.

## Sources

### Primary and official documentation

- [Project brief](../PROJECT.md) and [codebase concerns](../codebase/CONCERNS.md) — local scope and prototype facts.
- [Audiveris handbook](https://audiveris.github.io/audiveris/_pages/handbook/), [limitations](https://audiveris.github.io/audiveris/_pages/reference/limitations/), and [export](https://audiveris.github.io/audiveris/_pages/tutorials/quick/export/) — recognition scope and artifact limitations.
- [W3C MusicXML 4.0](https://www.w3.org/2021/06/musicxml40/) — score interchange semantics.
- [PDF.js examples](https://mozilla.github.io/pdf.js/examples/), [MDN AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process), and [MDN microphone capture](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) — browser rendering and audio APIs.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access](https://supabase.com/docs/guides/storage/security/access-control), and [OWASP file upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) — private data and ingestion controls.
- [Jin et al., singing evaluation](https://hcsi.cs.tsinghua.edu.cn/Paper/Paper11/JinZeyu_An_Automatic_Singing_Evaluation_System.pdf) and [Jiang and Raphael, score following](https://program.ismir2020.net/static/final_papers/159.pdf) — primary research on known acoustic and alignment challenges, not product accuracy proof.

### Product references and synthesis

- [Soundslice import review](https://www.soundslice.com/help/en/creating/pdf-import/344/reviewing/), [PlayScore 2](https://www.playscore.co/), and [Yousician singing](https://yousician.com/singing/) — documented adjacent capabilities, not evidence of arbitrary PDF grading quality.
- Detailed project reports: [stack](STACK.md), [features](FEATURES.md), [architecture](ARCHITECTURE.md), and [pitfalls](PITFALLS.md). Recommendations and phase ordering in this summary are inferences from these reports.

---
*Research completed: 2026-09-24*  
*Ready for roadmap: yes*
