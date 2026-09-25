# Pitfalls Research

**Domain:** Browser-based, PDF-to-score solo singing practice and per-note feedback  
**Researched:** 2026-09-24  
**Confidence:** MEDIUM. The research-plan seam selected web search; its confidence classifier gives MEDIUM only after primary-source cross-checking. Product-specific error rates and acceptable feedback thresholds still require measurement.

The proposed phase names below describe dependencies for the roadmap; they are not a commitment to exact phase numbering. **Inference** marks a product or engineering conclusion drawn from the cited source rather than a claim made by that source.

## Critical Pitfalls

### 1. Treating every PDF as a reliable symbolic score

**What goes wrong:** A PDF page renders correctly, but noteheads, rests, beams, accidentals, barlines, and staves are misread. One dropped symbol shifts later beat positions. A digital PDF may render more cleanly than a scan yet still lack symbolic note events; this is an **inference** from the fact that OMR pipelines operate on rendered page images. Audiveris explicitly says printed common Western notation is its target, handwriting is unsupported, and manual correction is necessary. Its PDF loading step produces a grayscale image. [Audiveris handbook](https://audiveris.github.io/audiveris/_pages/handbook/), [LOAD step](https://audiveris.github.io/audiveris/_pages/explanation/steps/load/).

**Why it happens:** Teams classify by `.pdf` extension or by whether text can be selected. Raster scan quality, engraving density, skew, and resolution determine different failure modes. Audiveris recommends roughly 300 DPI for standard paper and warns that below 200 DPI can hide details. [Audiveris scanning guide](https://audiveris.github.io/audiveris/_pages/guides/advanced/scanning/).

**How to avoid:** Inspect pages and classify image-based versus vector/text-rich PDFs for routing and diagnostics, while still verifying score semantics. Define supported notation and a readable error path for handwritten, low-quality, or unsupported scores. Keep the original PDF immutable; store a versioned recognized score and confidence/provenance by page, staff, measure, and event. Require review before grading. Never use an aggregate OMR confidence score as permission to skip checking high-impact symbols.

**Warning signs:** Empty or wildly unequal measures; implausible note ranges; missing accidentals or rests; barlines that fail to align across staves; many corrections on one page; confidence collapse around page turns or dense systems.

**Validation:** Build a musician-verified fixture corpus separated by digital exports, clean scans, low-resolution/skewed scans, SATB layouts, and unsupported pages. Compare note pitch, onset, duration, rest, barline, and staff assignment separately against ground truth; report *post-correction* accuracy and correction time as well as raw OMR accuracy. A reproducible public [OMR benchmark with inputs, ground truth, and raw outputs](https://github.com/loveranmar/omr-benchmark) can supplement, but not replace, product-specific vocal-score fixtures.

**Phase to address:** Score ingestion and OMR spike, before the feedback phase. Put an explicit supported-score gate in requirements.

### 2. Grading the wrong staff or voice

**What goes wrong:** SATB, piano-vocal, divisi, or two voices on one staff are flattened into one line. The follower displays a plausible position but compares the singer with accompaniment or another singer's notes. MusicXML distinguishes parts, staves, and voices, including separate voices on one staff. [MusicXML structure](https://www.w3.org/2021/06/musicxml40/tutorial/structure-of-musicxml-files/), [backup example](https://www.w3.org/2021/06/musicxml40/musicxml-reference/examples/backup-element/).

**Why it happens:** Staff geometry, part labels, voice layers, and score order are related but not identical. OMR may miss labels or assign text to the wrong staff; Audiveris documents ambiguity in assigning text to staff/voice. [Audiveris text guide](https://audiveris.github.io/audiveris/_pages/guides/ui/ui_tools/text/).

**How to avoid:** Model `part → staff → voice → events` explicitly, with page/system/staff coordinates retained for visual review. Show the extracted melody highlighted on the original page and let the singer select and repair *one* line, including split/merged staves and voice-layer choice. Do not silently pick the top staff or first XML voice. Reject or request correction when a selected line remains polyphonic or ambiguous.

**Warning signs:** Extracted range jumps several octaves between systems; accompaniment chords appear in a melody; lyrics appear under a different staff; one selected part has simultaneous incompatible pitches; score cursor changes vertical staff at a system break.

**Validation:** SATB, unison/divisi, piano-vocal, and two-voices-on-one-staff fixtures with musician-verified part/voice labels. Assert selected-event identity and page coordinates through system and page breaks; conduct a singer task test in which the participant confirms the highlighted line before practice.

**Phase to address:** Canonical score model and correction UI, before score following.

### 3. Confusing written pitch with sounding pitch

**What goes wrong:** Every note is systematically reported an octave, semitone, or transposition interval wrong. Tenor G clef with an octave change is a particularly relevant choral case. MusicXML represents clef octave change and part/staff transposition separately. [MusicXML notation basics](https://www.w3.org/2021/06/musicxml40/tutorial/notation-basics/), [transpose element](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/transpose/).

**Why it happens:** A pipeline jumps from notehead staff position to MIDI pitch without applying the current clef, key signature, local accidental state, octave mark, and written-to-sounding transform. Those can change within a piece. [MusicXML notation basics](https://www.w3.org/2021/06/musicxml40/tutorial/notation-basics/), [pitch representation](https://www.w3.org/2021/06/musicxml40/tutorial/midi-compatible-part/).

**How to avoid:** Store written spelling and sounding frequency/pitch as separate fields, with the transformation trace. Apply clef, key signature, measure-local accidentals, octave markings, and transposition in one tested score-normalization module. Display the written note to the singer while comparing microphone F0 with the sounding target. Correction UI must expose both when a systematic offset is suspected.

**Warning signs:** A consistent 100/1200-cent error across many notes; detected pitch matches the page visually but all notes are red; abrupt errors after key/clef changes; all tenor events exactly one octave high.

**Validation:** Unit fixtures for tenor octave clef, bass/alto clefs, key changes, naturals/courtesy accidentals, enharmonic spelling, octave lines, and transposing staves. Compare normalized sounding pitches with a musician-authored reference; test a whole selected part, not only isolated notes.

**Phase to address:** Canonical score model and correction, before audio evaluation.

### 4. Flattening musical time into one linear list

**What goes wrong:** The count-in starts on the wrong beat, a pickup is treated as a full bar, tied notes demand a second onset, or feedback drifts after repeats, alternate endings, tempo changes, fermatas, and rests. MusicXML has explicit pickup-measure conventions, ties, repeats/endings, and tempo directions; tempo is not guaranteed to be specified. [Pickup measure](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/measure-partwise/), [ties](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/tied/), [repeats/endings and tempo](https://www.w3.org/2021/06/musicxml40/tutorial/midi-compatible-part/).

**Why it happens:** Measure numbers and note order are used as elapsed time. Playback paths through repeats are ignored. Printed expressive markings are mistaken for exact tempo values.

**How to avoid:** Build a playback timeline from symbolic beat positions and a bounded repeat/ending graph; keep visual measure identity separate from each performed occurrence. Merge tied notes for onset grading while retaining their notation links. Represent pickup duration, rests, tempo map, and selected start measure. Make unsupported jumps/tempo instructions visible and editable; allow an explicit practice tempo. Count in relative to the selected starting beat and pickup, not assumed four beats. **Inference:** A strict metronome lane and a tempo-flexible lane may need separate timing policies.

**Warning signs:** Cursor and metronome disagree at measure 1 or after repeat signs; every event after a rest or tie is labeled late; identical written measures cannot be distinguished across repeat passes; selected start measure produces a count-in of the wrong length.

**Validation:** Golden timelines for pickup, ties over barlines, multi-measure rests, changing meter/tempo, repeat with first/second endings, and start-at-measure scenarios. Assert event start/end in beats and expected count-in clicks. Replay synthetic perfect-performance audio and require no false timing errors.

**Phase to address:** Score timeline and metronome, before follower and timing feedback.

### 5. Losing the score position while still showing confident feedback

**What goes wrong:** A singer hesitates, repeats a phrase, skips ahead, sings a wrong note, or is silent; a naive cursor advances by wall-clock time or greedily matches the next pitch. Later pitch and timing labels then attach to the wrong score notes. Score-following research explicitly treats tempo variation, mistakes, repeats, and skips as tracking cases; reacquisition after a jump is not instantaneous. [Nakamura et al., real-time alignment](https://arxiv.org/abs/1512.07748), [Han et al., practice score following](https://www.nime.org/proc/nime2013_han_a/index.html).

**Why it happens:** Timing and alignment are treated as presentation details, or offline alignment accuracy is mistaken for live follower quality. Silence and repeated pitches provide weak evidence of location. **Inference:** Latency from capture, analysis windows, smoothing, UI rendering, and click playback compounds, so a displayed cursor can lag even if each component seems fast.

**How to avoid:** Use one monotonic timestamp domain for captured audio features, metronome events, score positions, and feedback. Follow with an explicit state estimate and confidence, constrained by plausible tempo and score transitions; allow user seek/restart and recovery after uncertainty. Suppress per-note judgment when location confidence is low and show “position uncertain.” Separate estimated performed onset from display time, and measure end-to-end latency on supported devices. Browser audio worklets process small blocks synchronously, while output latency is measurable but browser latency requests may be ignored. [AudioWorklet processing](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process), [AudioContext base latency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/baseLatency).

**Warning signs:** Cursor moves during silence; it remains one measure behind after a skipped phrase; repeated notes cause jumps; “late” bias grows through the session; browser or device choice systematically changes scores.

**Validation:** Timestamped audio/score recordings covering steady and variable tempo, hesitations, inserted/wrong notes, repeat and skip, and silence. Measure note identity accuracy, position error, recovery time after a jump, feedback delay distribution, and false confident labels. Run replay deterministically, then a real microphone/browser/device matrix. Set release targets from singer usability tests and measured device variance rather than claiming an arbitrary millisecond target.

**Phase to address:** Live audio engine and score following, with a separate acceptance gate before on-score feedback.

### 6. Mistaking vocal acoustics or accompaniment for the fundamental

**What goes wrong:** Vibrato makes a correct sustained note alternate sharp/flat; an octave error yields a huge apparent miss; a consonant, breath, weak onset, room noise, metronome bleed, or accompaniment yields unstable pitch. Primary singing assessment work describes unreliable frames, octave errors, voiceless consonants, vibrato, and portamento as confounders. [Jin et al., singing evaluation](https://hcsi.cs.tsinghua.edu.cn/Paper/Paper11/JinZeyu_An_Automatic_Singing_Evaluation_System.pdf), [comparative singing pitch study](https://arxiv.org/abs/1912.12609).

**Why it happens:** The prototype estimates pitch on every animation frame with fixed RMS/correlation cutoffs and a fixed 60–1200 Hz range, with no confidence smoothing or octave handling. [Project concerns](../codebase/CONCERNS.md). Browser echo cancellation, noise suppression, and automatic gain control can vary or be ignored, affecting the input signal. [Media constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints), [supported constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSupportedConstraints).

**How to avoid:** Decouple audio analysis from animation frames; timestamp features and emit voiced/unvoiced plus F0 confidence. Use musically constrained octave candidates, hysteresis, and stable-note windows; label attack/sustain separately. Exclude low-confidence and consonant frames from sharp/flat scoring, but retain a trace so suppression is auditable. Limit initial support to solo unaccompanied voice or headphones; explicitly detect/show when accompaniment or click bleed may invalidate judgment. Record actual capture settings for diagnostics without storing raw voice by default.

**Warning signs:** 1200-cent jumps, alternating red/green on a sustained vowel, “notes” during silence or metronome clicks, more errors on low voices or high sopranos, markedly different results between headphones and laptop speakers.

**Validation:** Synthetic sine/chirp/noise, then annotated real singing with low/high voices, varied vowels, vibrato, portamento, soft attacks, room noise, and device types. Report voiced/unvoiced errors, octave-error rate, F0 cents error on reliable frames, and note-level decisions stratified by voice range and recording condition. [Annotated-VocalSet](https://www.mdpi.com/2076-3417/12/18/9257) is a primary dataset source for diverse singer/technique evaluation; check its license and task fit before using it.

**Phase to address:** Audio analysis foundation, before score following and feedback UI.

### 7. Presenting arbitrary pitch and timing tolerances as musical truth

**What goes wrong:** The same note is colored wrong in the live view but counted correct in history, or a vibrato peak/soft consonant onset is graded as a fault. The current prototype already uses conflicting ±10 and ±15 cent cutoffs. [Project concerns](../codebase/CONCERNS.md). Research on automated singing assessment explicitly handles vibrato and transitional frames; it does **not** establish one universal threshold for all singers and styles. [Jin et al.](https://hcsi.cs.tsinghua.edu.cn/Paper/Paper11/JinZeyu_An_Automatic_Singing_Evaluation_System.pdf), [Takeuchi et al.](https://www.jstage.jst.go.jp/article/ieejeiss/130/6/130_6_1042/_article/-char/en).

**Why it happens:** A single sampled cents difference and a fixed wall-clock onset window are easy to implement and demo. Detector uncertainty, note length, register, style, tempo, and human onset annotation variability are hidden.

**How to avoid:** Define one versioned classification policy shared by live display and saved history. Estimate pitch over an appropriate stable portion of each note; distinguish missed/wrong note, intonation direction, and ungradable evidence. Score timing against the chosen tempo/following mode and include onset uncertainty. Keep tolerances transparent and adjustable for practice goals, without silently changing historical classifications. **Inference:** Prefer continuous cents and milliseconds alongside categorical labels so users can judge borderline cases.

**Warning signs:** Frequent flicker at thresholds; higher false-error rate for particular vocal ranges/styles; near-threshold sessions change score after reload; expert singers disagree with labels on reviewed clips; no “uncertain” category.

**Validation:** Pre-register candidate policies and compare with blind musician labels across varied voices, vibrato, genres, note lengths, and tempi. Report false sharp/flat and early/late rates, disagreement bands, and results by subgroup and device. Use threshold sensitivity curves; choose product thresholds only after this evaluation. Preserve raw measured values and policy version for audit/regrading.

**Phase to address:** Feedback policy and evaluation phase, before public practice-history comparisons.

### 8. Building private history and optional audio on a public-object model

**What goes wrong:** Another user retrieves a score, result, or voice recording by guessing/changing an ID or reusing a stale URL; a “do not save audio” choice still sends it to storage; deleting a session leaves audio, derivatives, or signed links behind. Uploaded PDFs can also exhaust or attack parsers. OWASP requires file validation/limits and per-object authorization; opaque IDs alone are insufficient. [OWASP file upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [OWASP object authorization](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html).

**Why it happens:** The app moves from a local prototype to cloud objects without a threat model or ownership checks on every read, write, export, and delete. Its existing browser-side API-key pattern and automatic voice download are already flagged in the codebase. [Project concerns](../codebase/CONCERNS.md).

**How to avoid:** Separate score/result/recording storage with owner-scoped access enforced server-side and private object buckets; use short-lived access grants after authorization. Validate actual PDF type and size, bound pages and rasterization resources, isolate conversion workers, and rate-limit uploads. Make recording retention an explicit per-session opt-in before capture/storage; when off, keep only derived note results and discard raw buffers. Define deletion semantics for originals, corrected derivatives, recordings, exports, and backups; keep third-party credentials server-side.

**Warning signs:** A score URL loads in an incognito browser; changing a session ID reveals another account's history; raw-audio requests occur when opt-in is off; storage objects remain after deletion; parser memory or CPU grows without bounds on crafted PDFs.

**Validation:** Two-account authorization tests for every object operation, including storage URLs and exports. Network-test opt-out sessions for zero raw-audio upload, verify deletion and URL expiry, and fuzz malformed/oversized/multipage PDFs against resource limits. Test stop/permission-denied/repeated sessions so microphone tracks and buffers are released; [MediaStreamTrack.stop](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop) is the relevant browser API.

**Phase to address:** Accounts/storage foundation and upload ingestion; repeat privacy/security verification at history and release gates.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use PDF pixel coordinates as the only score representation | Fast overlay demo | No stable note identity across zoom, correction, repeats, or history | Throwaway OMR prototype only |
| Save OMR output without original PDF, confidence, or correction version | Small schema | Cannot inspect or repair disputed judgments | Never for scored sessions |
| Reuse the prototype's single global audio loop and thresholds | Fast first playback | Coupled lifecycle/rendering, inconsistent labels, untestable timing | Throwaway audio spike only |
| Treat every observed F0 frame as a note | Easy graph | Vibrato and consonant false positives | Visualization only, clearly ungraded |
| Store only pass/fail note grades | Compact history | Cannot recalibrate thresholds or explain borderline results | Never for durable feedback |
| Align by elapsed metronome time only | Simple cursor | Breaks on hesitations, repeats, skips | Explicit fixed-tempo drill, clearly labeled |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OMR → score model | Import MusicXML as a flat list of notes | Preserve part/staff/voice, written and sounding pitch, measure/beat, ties, repeats, and source coordinates |
| PDF renderer → OMR | Assume text extraction equals notation extraction | Compare visual raster and recognized events; route digital and scans through tested paths |
| Score model → renderer | Recompute note identity from visual position | Assign stable event IDs linked to source page coordinates and performance occurrence |
| Web Audio → UI | Use animation-frame time as microphone capture time | Timestamp audio features on a monotonic clock and measure capture-to-display delay |
| Cloud storage → browser | Make original scores/audio public or trust object IDs | Authorize every access and issue short-lived private URLs |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Quadratic autocorrelation on each animation frame | Dropped frames and delayed feedback | Bound pitch lag/window, reuse buffers, analyze off the render loop | Long windows, low-end devices, background tab; present in prototype |
| Re-scan full pitch history each frame | Latency grows during a session | Incremental statistics; bounded feature buffer | Long rehearsals; present in prototype |
| Rasterize every page at maximum resolution | Upload stalls or worker exhaustion | Page/pixel limits, staged rasterization, worker quotas | Large multipage scans or malicious PDFs |
| Unbounded score-following search over all notes and jumps | Cursor stalls on long pieces | Limit transition candidates and use staged recovery | Long scores and arbitrary repeats/skips; see [Nakamura et al.](https://arxiv.org/abs/1512.07748) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting PDF extension or `Content-Type` | Parser exploitation or resource exhaustion | Validate signature/type, size/pages/pixels; sandbox conversion and limit CPU/memory [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) |
| Using unguessable IDs without authorization | Cross-account score and voice disclosure | Owner-scoped checks for all object operations [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) |
| Opt-out only hides the playback button | Private raw voice retained invisibly | Gate upload before it starts; assert no retained audio on opt-out |
| Leaving microphone active after session | Continued capture and surprising browser indicator | Idempotent stop flow; stop every track and release buffers [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop) |
| Client-side third-party key | Credential abuse | Server-side secret and authenticated, bounded endpoint; remove prototype pattern |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| OMR review is a generic wall of note names | Singer cannot catch wrong staff or accidentals | Overlay recognized events on original notation, highlight low-confidence/high-impact symbols |
| Feedback stays red while follower is lost | Singer loses trust | Show uncertain location and pause judgment; offer seek/restart |
| Per-frame color flickers with vibrato | Correct singing appears unstable | Grade note-level stable portions; show continuous trace separately |
| All imported music is accepted | Unsupported score yields nonsense | Explain unsupported notation/scan quality and provide a correction or retry path |
| Count-in ignores pickups/start measure | Singer enters at wrong beat | Preview selected range, beat pattern, and pickup-aware count-in |

## “Looks Done But Isn't” Checklist

- [ ] **PDF import:** Visual page loads; verify corrected pitches, rhythms, rests, staff assignments, and source links against a gold score on both digital and scanned PDFs.
- [ ] **Part selection:** A label is chosen; verify the highlighted events remain the same vocal voice across systems/pages and divisi.
- [ ] **Pitch conversion:** Notes display correctly; verify *sounding* pitch through tenor octave clef, accidentals, key changes, and transposition.
- [ ] **Metronome:** It clicks; verify pickup/start-measure count-in, repeat occurrence, meter, and tempo changes against the symbolic timeline.
- [ ] **Score following:** Cursor moves; verify confidence, error/skip/repeat recovery, silence behavior, and latency with timestamped replay plus real devices.
- [ ] **Feedback:** Colored notes appear; verify false-label rates, uncertain states, and exact agreement between live policy and saved results across voice ranges.
- [ ] **Private history:** Page requires login; verify account B cannot fetch account A's original score, corrected version, results, recording, or export via direct API/storage URLs.
- [ ] **Optional audio:** UI toggle is off; verify no raw audio leaves the browser or remains in cloud storage and that session stop releases microphone tracks.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Bad recognition before session | LOW–MEDIUM | Let singer correct affected page/measure; revalidate timeline and selected part before practice |
| Bad recognition discovered after saved grading | HIGH | Preserve score and correction versions, mark affected history as superseded, recompute only if measurements permit; never silently rewrite grades |
| Follower loses place live | MEDIUM | Suspend labels, show uncertain state, let singer seek or restart count-in, resume after confidence returns |
| Wrong pitch/timing policy | MEDIUM if raw measurements retained; HIGH otherwise | Version policy, replay benchmark, migrate/regrade with an explicit history annotation |
| Private score/audio exposure | HIGH | Revoke grants, fix authorization, assess access logs, remove unintended public objects, follow incident process |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention phase | Verification gate |
|---------|------------------|-------------------|
| PDF and OMR quality | Score ingestion/OMR | Stratified gold corpus; raw and corrected note/rhythm/staff metrics; unsupported-input UX |
| Wrong staff or voice | Canonical score model + correction | SATB/divisi/piano-vocal identity and visual-highlight fixtures |
| Written versus sounding pitch | Canonical score model | Clef/key/accidental/transposition unit and whole-part golden tests |
| Pickup, ties, repeats, tempo | Score timeline + metronome | Golden beat timeline and perfect-performance replay |
| Latency and follower drift | Audio/follower | Position, recovery, and capture-to-display latency metrics across browsers/devices |
| Vocal F0 errors | Audio analysis | Annotated singer/device corpus; octave, voicing, and cents errors by condition |
| Unfair or conflicting judgments | Feedback policy | Blind musician review, threshold sensitivity, subgroup false-label rates, live/history parity |
| Private objects and optional recordings | Account/storage foundation and history | Two-account API/storage tests, opt-out network test, deletion and track-stop tests |

## Sources and confidence

The primary references were checked through the research-plan provider selected for this run. Each externally grounded cluster is **MEDIUM** under the GSD `classify-confidence --provider websearch --verified` result. The proposals for architecture, gates, warning signs, and thresholds are **inferences** requiring product validation.

- [Audiveris handbook](https://audiveris.github.io/audiveris/_pages/handbook/), [known limitations](https://audiveris.github.io/audiveris/_pages/reference/limitations/), [scanning](https://audiveris.github.io/audiveris/_pages/guides/advanced/scanning/), and [user editing](https://audiveris.github.io/audiveris/_pages/guides/ui/README/) — current online product documentation, checked 2026-09-24.
- [MusicXML 4.0 reference/tutorial](https://www.w3.org/2021/06/musicxml40/) — W3C Music Notation Community Group final specification published 2021; exact notation semantics remain relevant, checked 2026-09-24.
- [Jin et al., automatic singing evaluation](https://hcsi.cs.tsinghua.edu.cn/Paper/Paper11/JinZeyu_An_Automatic_Singing_Evaluation_System.pdf), [comparative singing F0 study](https://arxiv.org/abs/1912.12609), [Annotated-VocalSet](https://www.mdpi.com/2076-3417/12/18/9257) — primary studies; methods/data need task-fit validation before adopting numeric targets.
- [Nakamura et al., online score following](https://arxiv.org/abs/1512.07748) and [Han et al., practice alignment](https://www.nime.org/proc/nime2013_han_a/index.html) — primary studies of alignment behavior, not performance guarantees for this app.
- [MDN AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process), [capture constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints), and [track stop](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop) — current browser API documentation, checked 2026-09-24.
- [OWASP file upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) and [object authorization](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) — current security guidance, checked 2026-09-24.

**Open research before setting release gates:** representative user PDFs and scan mix; supported engraving/notation boundary; annotated solo-vocal recordings and permission to use them; musician agreement on intonation/timing judgments; browser/device latency distribution; retention/deletion requirements for optional recordings. Do not turn any literature result or demonstration score into a product accuracy promise until those are measured on the intended use case.

---
*Pitfalls research for Pitch Proof; 2026-09-24.*
