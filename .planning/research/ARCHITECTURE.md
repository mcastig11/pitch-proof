# Architecture Research

**Domain:** Browser based, PDF driven solo singing practice
**Researched:** 2026-09-24
**Confidence:** MEDIUM (official documentation and primary research checked through the research seam; the product specific alignment and geometry approach still needs validation)

## Recommendation

Build a modular browser application with a small authenticated API and an asynchronous score recognition worker. Keep the live microphone, metronome, pitch extraction, score following, and immediate score feedback in the browser. Store PDF originals and optional recordings as private objects; store corrected score versions, sessions, and compact per note results in a relational database. Treat optical music recognition (OMR) as a source of proposed notation, never as the authority used for grading until a singer has reviewed the selected part. **Inference:** This split avoids network latency in the feedback loop while preserving a server boundary for accounts, private materials, and compute heavy PDF recognition.

The central contract is an immutable, versioned **practice score**: one normalized vocal line with note and rest events, score time, measure membership, tempo map, play order, and a mapping back to page coordinates. Recognition, manual correction, a hand entered fixture, or a future MusicXML import may produce that contract. Audio analysis and score following consume it without depending on PDF or OMR details. Sessions pin the exact score version and evaluation algorithm version so corrections never silently change historical outcomes. MusicXML's partwise hierarchy, divisions, rests, ties, voices, and repeat marks justify a normalization step; the W3C specification also allows divisions to change within a part, so raw MusicXML integers are not a suitable cross score clock by themselves. [W3C MusicXML structure](https://www.w3.org/2021/06/musicxml40/tutorial/structure-of-musicxml-files/), [MusicXML notation timing](https://www.w3.org/2021/06/musicxml40/tutorial/midi-compatible-part/).

## Standard Architecture

### System overview

```text
Browser
  Score workspace: PDF page + geometry overlay + correction editor
  Practice runtime: transport/count-in -> mic capture -> pitch/onset observations
                    -> online score follower -> live per-note feedback -> UI
  Session finalizer: compact note outcomes, optional recording consent
                         | authenticated, bounded requests
                         v
Application API / authorization boundary
  score catalog + score revisions + session/history endpoints
  upload orchestration + recognition job status + recording retention
       |                          |                         |
       v                          v                         v
  relational metadata       private object store       OMR worker/queue
  and note results          PDFs/audio/reports          PDF -> candidate MusicXML
```

Recognition is asynchronous. Practice is local after loading one reviewed score version. Cloud services may be temporarily unavailable during singing without moving beat scheduling or classification to the server. **Inference:** The simplest first deployment is a modular monolith API plus one worker, rather than multiple service deployments.

### Component boundaries

| Component | Owns | Input / output contract | Failure boundary |
|---|---|---|---|
| Upload and score catalog | Ownership, file limits, private object reference, job state | Authorized PDF upload -> score ID and revision candidate | Invalid/encrypted/oversize PDF rejected before OMR; retryable job failure |
| PDF renderer and geometry | Page rendering, zoom/rotation, overlays, click targets | PDF bytes + page index + canonical page coordinates -> viewport elements | Missing geometry shows a readable PDF plus correction list, with score overlay unavailable |
| OMR adapter | Raster/preprocessing, recognition, raw project output, import | Original PDF -> MusicXML/OMR artifacts + confidence/provenance | Unsupported notation or low confidence routes to manual correction; never publishes a practice score silently |
| Score normalizer and editor | Part/voice selection, measures, pitch, duration, rests, ties, tempo, play order, geometry links, validation | Candidate notation + user edits -> immutable `ScoreRevision` | Block practice for invalid selected measures; permit explicit unsupported passage marking |
| Practice transport | Selected part/range, tempo override, audio clock, metronome, count-in, start/stop state | Reviewed revision + selection -> scheduled beat and score time | Device/audio context failure leaves no active session |
| Audio observation pipeline | Microphone lifecycle, pitch, voicing, onset evidence, timestamps, confidence | PCM blocks -> bounded, timestamped observations | Silence/noise emits unvoiced state, not wrong note |
| Online follower | Current note/measure hypothesis and local tempo estimate | Score events + observations + count-in clock -> position/confidence | Loss of alignment freezes or softens feedback, exposes resync |
| Feedback evaluator | Expected vs observed pitch and onset, tolerance policy | Aligned observations -> provisional then finalized note result | Low confidence is ungraded; a later observation may revise provisional result |
| Session/history | Compact outcomes, comparisons, algorithm provenance | Finalized session -> immutable results and optional audio pointer | Upload/save retry uses an idempotent session ID; local result can remain pending |
| Account/access layer | Authentication, ownership, policies, deletion | Identity -> authorized rows/objects | Denied cross-user read/write; expired auth pauses cloud writes without disrupting local practice |

The old `script.js` currently combines capture, autocorrelation, frame rendering, session state, recording, and an exposed external API call on the main thread; there is no backend or persistence. Extraction should preserve only tested behavior, not the global state design. See the [codebase map](../codebase/ARCHITECTURE.md) and [concerns audit](../codebase/CONCERNS.md).

## Canonical Score and Versioning

### Suggested data model

```text
Score {id, ownerId, title, originalPdfObjectKey, recognitionStatus}
ScoreRevision {id, scoreId, parentRevisionId?, sourceArtifactId,
               schemaVersion, createdAt, reviewedAt?, contentHash, status}
Part {id, revisionId, displayName, staffRefs, voiceRefs}
Measure {id, revisionId, ordinal, printedNumber?, timeSignature,
         startBeat, durationBeats, pageRegion?}
Event {id, partId, measureId, voiceId, kind: note|rest,
       onsetBeat, durationBeats, pitch?, tieGroupId?, sourceRegion?, sourceConfidence?}
TempoEvent {onsetBeat, beatUnit, bpm, source: recognized|corrected|override}
PlayOrder {ordered measure occurrence IDs, repeat interpretation, selected range}
PracticeSession {id, ownerId, scoreRevisionId, selectedPartId, playOrderHash,
                 startingMeasureId, tempoPolicy, startedAt, endedAt,
                 evaluatorVersion, status, recordingConsent, recordingObjectKey?}
NoteOutcome {sessionId, eventId, measureOccurrenceId, pitchCents?, onsetMs?,
             status, confidence, evidenceSummary}
```

Use exact rational beat positions or a validated integer tick resolution that covers tuplets; convert to seconds only with the session's tempo map. Preserve **written pitch** and a derived **sounding pitch** (including transposition/octave policy), rather than merging the two. Distinguish a tied note's engraved segments from its single sustained sounding event. Distinguish a printed measure number from a stable internal measure ID; repeats require occurrence IDs because one printed note can be sung twice. MusicXML describes these constructs, including `backup`/`forward` for multiple voices and repeat barlines. [W3C MusicXML tutorial](https://www.w3.org/2021/06/musicxml40/tutorial/midi-compatible-part/).

Assign application stable IDs when the candidate is imported. Manual edits create a new revision with parent linkage and an edit log. Freeze the reviewed revision at session start. An OMR rerun creates a new candidate, never overwrites corrections. Keep the original PDF and OMR artifact for traceability while licensing and retention are resolved. For historical comparisons, compare identical event IDs within the same revision directly; across revisions, offer only events with explicit lineage mapping or a confirmed match. **Inference:** Scores with changed rhythm, repeats, or part assignment cannot safely reuse prior note alignment by array index.

PDF display geometry is a separate projection. Store regions in original page coordinates plus page number and orientation; render overlays through the same viewport transform as the page. PDF.js documents scale, rotation, and the PDF bottom left to canvas top left transform. Its render API does not establish that OMR's MusicXML export carries a usable pixel map. Audiveris states MusicXML export is lossy, so evaluate its `.omr` artifact or a custom geometry extraction before promising automatic note level highlighting. [PDF.js examples](https://mozilla.github.io/pdf.js/examples/), [Audiveris export](https://audiveris.github.io/audiveris/_pages/tutorials/quick/export/), [Audiveris OMR project format](https://audiveris.github.io/audiveris/_pages/reference/outputs/omr/).

## Data Flows and Latency Boundaries

### Score ingestion and correction

1. Authenticated user uploads a PDF through a size and content restricted endpoint into a private bucket. Server creates `Score` and `RecognitionJob` records. Never accept a client supplied owner ID as authority.
2. Worker validates/rasterizes pages, runs OMR, retains the raw artifact and MusicXML, then normalizes a candidate revision with part/measure/event structure. Audiveris documents a batch CLI and MusicXML output; it also states printed common Western notation is its scope, handwriting is unsupported, and manual verification is necessary. [Audiveris handbook](https://audiveris.github.io/audiveris/_pages/handbook/), [CLI](https://audiveris.github.io/audiveris/_pages/guides/advanced/cli/).
3. Browser shows the original PDF with proposed part assignments, tempo, measure boundaries, and note events. User corrects the selected line and confirms it. Validation checks each selected measure's rhythmic sum, event order, pitches, rests, ties, tempo, and play order before marking the revision `reviewed`.
4. Correction publishes a new revision; session setup can use only a reviewed revision. A simple hand entered one page score should pass through the same validator and practice contract as OMR output.

### Live practice

1. Load the reviewed revision, choose part/range/tempo, and expand supported repeats into a linear `PlayOrder`. Compile expected events and overlay geometry before microphone permission.
2. On user start, create an `AudioContext`, request microphone access, then schedule count-in and metronome on its audio clock. A start event ties score beat zero to context time. Avoid using wall clock `Date.now()` for classification. `getUserMedia` requires a secure context and permission. [MDN microphone capture](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
3. Audio worklet or a bounded analysis worker emits `{audioTime, f0, voiced, onsetEvidence, confidence}` observations. Keep the audio callback allocation and work minimal; move heavier pitch/score matching off the UI thread. AudioWorklet processes blocks on the audio rendering thread, and its context time is available to timestamp them. Do not assume the currently common 128 frame block size is permanent. [MDN AudioWorklet process](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process), [worklet clock](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope/currentTime).
4. Online follower combines the scheduled score clock with recent pitch/onset evidence to estimate current event and tempo, including an uncertainty measure. A constrained window around the expected position is a good first slice; add recovery/repeat handling after measuring real sung examples. Online score following research explicitly models uncertain score position and variable tempo, including work on singing voice alignment. [ISMIR 2020 paper](https://program.ismir2020.net/static/final_papers/159.pdf), [Interspeech 2015 singing alignment](https://www.isca-archive.org/interspeech_2015/gong15_interspeech.pdf).
5. Evaluator emits provisional sharp/flat and early/late markers against the active score event. It finalizes after enough voiced evidence or the next reliable onset. Show `listening`, `uncertain`, or `ungraded` when signal or alignment is inadequate; do not turn low confidence into a red error mark. **Inference:** Early/late status for a note can require observation of its onset and may lag the visual cursor; pitch can update during sustain.
6. At stop, release microphone tracks and audio graph, finalize outcomes, then persist compact results. A recording made for immediate local playback can remain transient. Upload and attach it to history only if that session's retention option is on.

### Practical latency budget

The real time path is capture -> bounded analysis window -> follower -> score overlay. It has no network dependency. Track acquisition time, analysis window duration, computation time, follower delay, and paint delay separately. Set a measured product target for visual response after sung onset in a phase specific accuracy study; no source here establishes a universal threshold for every microphone, pitch range, and vowel. Use audio context time for both beat scheduling and input observations, then estimate the input/output offset on supported devices. `AudioContext.getOutputTimestamp()` maps output context time to a performance timestamp, but that alone does not calibrate microphone input latency. [MDN output timestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp). **Inference:** Treat timing scores as provisional until calibration and browser/device measurements show the uncertainty is below the feedback tolerance.

## Failure States and Trust Contract

| Failure | User visible behavior | Data behavior |
|---|---|---|
| Unsupported, encrypted, or malformed PDF | Explain why recognition cannot start; allow another file | Keep no partial published score |
| Recognition times out or cannot classify staves/tempo | Show job status and manual correction path | Preserve source PDF and diagnostic candidate; no reviewed revision |
| OMR confidence low or geometry missing | Require explicit review; feedback may use a synchronized event list where page marker is unavailable | Record provenance and unknown geometry |
| Ambiguous voice, chords, repeats, jumps, or free rhythm | Ask for one supported line/play order or mark passage ungraded | Validator refuses ambiguous practice range |
| Mic denied, unplugged, muted, or worklet unavailable | State specific error; offer retry | End capture and avoid false missed notes |
| Silence, breath, accompaniment bleed, pitch octave jump | Hold uncertain cursor / ungraded evidence | Do not score noise as wrong pitch |
| Score follower loses place | Freeze authoritative grading, show resync to measure | Preserve observations; flag gap in result |
| Tab suspended, CPU overrun, or clock discontinuity | Pause/restart count-in or end session clearly | Mark gap; do not bridge timing scores across discontinuity |
| Session cloud save fails or auth expires | Show pending save and safe retry | Idempotent session write; no duplicate attempts |
| Recording upload fails | Keep note results; say recording was not saved | Recording pointer stays null |

These cases are especially important in this brownfield codebase: its current stop path can run before recorder setup, it fails to stop microphone tracks, and it retains chunks across sessions. The practice runtime should have a single explicit state machine (`idle -> preparing -> count-in -> active -> stopping -> saved|save-pending|error`) and idempotent cleanup. [Codebase concerns](../codebase/CONCERNS.md).

## Access Control, Privacy, and Storage

Authorize every score, revision, session, and note result by `ownerId` (or by a parent record whose ownership is proven server side). Private PDF and recording buckets need operation specific policies for upload, read, and delete. If using Supabase, its official guidance calls for both SQL grants and row level security on exposed tables; private bucket operations are controlled through storage policies, and service/secret keys bypass RLS and must remain server side. Signed URLs are time limited bearer access, so use the shortest workable lifetime and do not place them in durable history records. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [storage access control](https://supabase.com/docs/guides/storage/security/access-control), [private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).

The browser's live microphone stream should remain local. Persist per note metrics by default, but no raw PCM frames, waveform history, or voice recording unless the user explicitly opts in for that session. Consent value is part of the immutable session header, and audio upload starts only after that choice. A deletion operation should remove a score's private PDF, its derived artifacts and revisions, its sessions and recordings with an auditable partial failure/retry path; account deletion should apply the same ownership walk. **Inference:** These are product privacy boundaries and must be tested with two accounts and direct object URL/API attempts, not just hidden UI controls.

## Recommended Project Structure

```text
src/
  score/          model, MusicXML normalization, validation, revision edits, play order
  score-view/     PDF.js page rendering, coordinate transform, overlays, editor UI
  practice/       transport state machine, beat scheduling, session controller
  audio/          mic adapter, worklet, pitch/onset estimator, optional recorder
  alignment/      online follower and confidence handling
  feedback/       classification policy, provisional/final results, report projection
  history/        session comparison and persistence client
  account/        auth/session client and private catalog UI
server/
  api/            authenticated score/session/recording endpoints
  jobs/           OMR invocation, artifact import, status/retry
  storage/        object keys, upload constraints, retention/deletion
  db/             schema, migrations, authorization policies
tests/fixtures/   corrected one-part scores, OMR edge cases, timed voice/audio examples
```

`score`, `alignment`, and `feedback` should expose pure typed functions where possible. Browser and server adapters own side effects. Keep one API deployment and one job worker until recognition throughput creates a measured bottleneck. At 0–1k users, OMR CPU and upload size are likelier operational limits than session feedback throughput because feedback stays local. At larger scale, add bounded queues, per user quotas, and separate worker capacity before dividing the domain model into services. **Inference.**

## Build Order and Roadmap Implications

1. **Vertical score-guided slice:** Create the canonical score schema, a small corrected one-part fixture, PDF page overlay, selected measure, browser transport/count-in, extracted microphone/pitch module, simple constrained follower, provisional per note feedback, and an in-memory session report. This proves the core singer outcome before committing to OMR or backend complexity. Include automated pitch/timing fixtures and one browser device smoke test.
2. **Private persistence:** Add accounts, relational score revisions/sessions/results, private PDF objects, authorization tests, save/retry, and history comparison for the same score revision. Introduce optional recording retention separately from metric persistence.
3. **PDF ingestion and correction:** Add bounded upload, asynchronous OMR worker, MusicXML normalization, geometry linkage, correction UI, revision publishing, and unsupported notation handling. Run digital and scanned score examples through the exact same practice contract as the fixture.
4. **Alignment and timing hardening:** Use collected consented test performances to measure latency and note match accuracy, calibrate device timing, improve resynchronization and expressive tempo handling, and define confidence based abstention. Expand notation coverage only where the evaluator can be validated.

This order is a dependency graph, not a claim that fixture input satisfies the PDF product requirement. The end-to-end slice makes the live loop testable first; PDF recognition and cloud history then plug into a proven contract. Phase 3 likely needs a dedicated OMR/geometry feasibility spike because Audiveris MusicXML export loses recognition detail. Phase 4 needs a dedicated accuracy study with labeled sung onsets, device/browser matrix, and acceptance thresholds. [Audiveris export limitation](https://audiveris.github.io/audiveris/_pages/tutorials/quick/export/).

## Anti-Patterns to Avoid

- **OMR output as grading truth:** A plausible but wrong pitch or duration produces unfair feedback. Require review and immutable revision publication. Audiveris explicitly reports imperfect accuracy. [Handbook](https://audiveris.github.io/audiveris/_pages/handbook/).
- **Index based matching:** Array position fails at rests, ties, repeats, and corrections. Use stable event plus occurrence IDs and explicit score time.
- **One clock for display and analysis:** `requestAnimationFrame` cadence follows painting, not audio capture. Use audio context timestamps for music events and render the latest known result independently. [AudioWorklet process](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process).
- **Always authoritative feedback:** Noisy or unvoiced audio and ambiguous alignment should produce uncertainty, not sharp/flat or early/late labels. This is a product trust requirement and a design inference from probabilistic score following research. [ISMIR paper](https://program.ismir2020.net/static/final_papers/159.pdf).
- **Mutable session score reference:** Editing a score after practice would change what a past result means. Pin revision, part, play order, tempo policy, and evaluator version.
- **Client only privacy or secrets:** Hidden controls cannot protect private rows or object URLs. Enforce policies in the data layer and keep privileged credentials server side. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Evidence and Open Questions

| Area | Confidence | Basis / unresolved issue |
|---|---|---|
| PDF rendering coordinates | MEDIUM | Official PDF.js examples; need test with rotated/cropped user PDFs |
| OMR output and correction need | MEDIUM | Current Audiveris 5.11+ handbook and export docs; actual score corpus needed for quality and geometry extraction |
| Music representation | MEDIUM | W3C MusicXML 4.0 reference; application schema is a design inference requiring fixture validation |
| Live timing boundary | MEDIUM | Browser API docs; device input/output offset and acceptable visual latency need measurement |
| Online score following | MEDIUM | Primary ISMIR and singing research; exact algorithm and thresholds remain experimental |
| Private storage pattern | MEDIUM | Current Supabase official docs; stack choice and policy tests remain implementation decisions |

**Open questions for phase research:** Can the chosen OMR engine provide reliable note-to-original-PDF regions for digital PDFs and scans? What score notation subset is valid for initial grading (tuplets, pickup measures, repeats, divisi, transposing notation)? How should local tempo changes and rubato affect early/late labels? What device specific latency calibration is practical in browser without a reference microphone? What corpus of legally usable score pages and consented vocal performances will define acceptance criteria?

## Sources

- [Audiveris handbook, release 5.11+](https://audiveris.github.io/audiveris/_pages/handbook/); [batch CLI](https://audiveris.github.io/audiveris/_pages/guides/advanced/cli/); [OMR project format](https://audiveris.github.io/audiveris/_pages/reference/outputs/omr/); [lossy MusicXML export](https://audiveris.github.io/audiveris/_pages/tutorials/quick/export/). Official project documentation, accessed 2026-09-24.
- [W3C MusicXML 4.0 structure](https://www.w3.org/2021/06/musicxml40/tutorial/structure-of-musicxml-files/) and [notation timing tutorial](https://www.w3.org/2021/06/musicxml40/tutorial/midi-compatible-part/). Official specification tutorial, published 2021, accessed 2026-09-24.
- [PDF.js examples](https://mozilla.github.io/pdf.js/examples/). Official project documentation, accessed 2026-09-24.
- [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [AudioWorklet processing](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process), [audio clock](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope/currentTime), [output timestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp). Browser API documentation, accessed 2026-09-24.
- Jiang and Raphael, [Score Following with Hidden Tempo Using a Switching State Space Model](https://program.ismir2020.net/static/final_papers/159.pdf), ISMIR 2020. Gong et al., [real time singing voice audio to score alignment](https://www.isca-archive.org/interspeech_2015/gong15_interspeech.pdf), Interspeech 2015. Primary research; neither validates this product's accuracy directly.
- [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals). Official current documentation, accessed 2026-09-24.

---
*Architecture research for Pitch Proof. Research seam provider: websearch; verified source confidence classified MEDIUM. Product specific recommendations marked as inference where primary sources do not directly decide the architecture.*
