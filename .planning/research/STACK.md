# Stack Research

**Domain:** Browser score-guided solo singing practice
**Researched:** 2026-09-24
**Confidence:** MEDIUM (primary documentation and releases checked; OMR and alignment quality require project-specific benchmarks)

## Current prototype versus target stack

The current app is static HTML/CSS plus one browser JavaScript file. It already uses `getUserMedia`, Web Audio, `MediaRecorder`, Canvas, and a local autocorrelation detector. `pitchy@^4.1.0` is installed but unused. It has no score model, server, cloud data, or tests. Keep the useful browser API experience, but treat the implementation as a prototype; in particular, do not carry forward its main-thread quadratic detector, unbounded samples, or browser-side API credential. [Local stack map](../codebase/STACK.md), [local concerns](../codebase/CONCERNS.md).

The target is a TypeScript web app with an explicit score/event model, browser audio pipeline, hosted account/data layer, and isolated Java OMR worker. The browser must own live timing and feedback so network latency cannot distort a practice session. This is an architectural recommendation rather than a proven accuracy result. **Confidence: MEDIUM.**

## Recommended Stack

### Core technologies

| Technology | Version / baseline | Purpose | Why recommended |
|------------|--------------------|---------|-----------------|
| TypeScript + React | TypeScript 5.x; React 19.3 | UI and typed score/session state | A component UI suits PDF review, note correction, score overlay, and session/history screens. React 19.3 was released 2026-09-09; avoid React server components for the microphone path. [React release](https://react.dev/blog/2026/09/09/react-19-3). **MEDIUM** |
| Vite | 8.x, lock tested patch | Browser build, separate workers, dev server | Straightforward client app deployment; no server rendering is needed for private, microphone-led screens. Vite 8 requires Node 20.19+ or 22.12+; standardize on Node 22.12+ or newer supported LTS. [Vite 8](https://vite.dev/blog/announcing-vite8). **MEDIUM** |
| PDF.js (`pdfjs-dist`) | 6.x, lock tested patch | Display original PDF pages beside corrections | Mozilla supplies the npm browser distribution and separate worker. PDF rendering is a review/reference surface, not score recognition. Apache-2.0. [PDF.js setup](https://github.com/mozilla/pdf.js/wiki/Setup-pdf.js-in-a-website), [releases](https://github.com/mozilla/pdf.js/releases). **MEDIUM** |
| Audiveris | 5.11.0, isolated Java worker | Printed-score OMR to MusicXML | A documented batch CLI accepts image/PDF input and exports MusicXML. It explicitly limits itself to printed common Western notation, and recognition is imperfect. Run an asynchronous, resource-limited job with page/size caps; keep correction mandatory. [CLI](https://audiveris.github.io/audiveris/_pages/guides/advanced/cli/), [handbook](https://audiveris.github.io/audiveris/_pages/handbook/), [releases](https://github.com/Audiveris/audiveris/releases). **MEDIUM** |
| MusicXML + application-owned note timeline | MusicXML 4.0 interchange; versioned internal schema | Recognition interchange, editable canonical notes, measures, parts, tempo, ties/rests, and note-to-time mapping | Audiveris exports MusicXML 4.0. Parse once, normalize selected-part events into a small typed model, preserve original MusicXML and correction revisions. The corrected model, not raw OMR output or rendered SVG, is the evaluation source of truth. [Audiveris README](https://github.com/Audiveris/audiveris), [W3C MusicXML 4.0](https://www.w3.org/2021/06/musicxml40/). **MEDIUM** |
| OpenSheetMusicDisplay (OSMD) | 2.1.1 | Render recognized/corrected MusicXML to SVG with part display, cursor, and note color | Provides a browser MusicXML renderer and modifiable display data model. Its own README says it is not a full interactive editor; implement correction controls in the app model and regenerate/re-render score as needed. BSD-3-Clause. [README](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay), [releases](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/releases), [license](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/develop/LICENSE). **MEDIUM** |
| Web Audio `AudioWorklet` + `pitchy` | Browser API; pitchy 4.x (prototype lockfile has 4.1.0) | Timestamped monophonic mic windows and pitch/clarity estimates | Worklet keeps acquisition off the UI thread; pitchy implements the McLeod Pitch Method and returns pitch plus clarity. Use RMS/voicing gate, octave/error checks, and bounded buffers. `pitchy` v4 is ESM-only and 0BSD. [AudioWorklet](https://developer.mozilla.org/docs/Web/API/AudioWorklet), [pitchy README](https://github.com/ianprime0509/pitchy). **MEDIUM** |
| Application-owned online score follower | Versioned TypeScript module; no off-the-shelf package assumed | Map voiced pitch/onset observations to one selected part's expected note timeline; classify cents and early/late | Begin with deterministic monotonic windowed alignment around the metronome timeline, confidence gating, rests, ties, and explicit recovery after skips. A package pitch detector alone cannot infer score position or timing error. Benchmark on actual singing before adopting a more complex probabilistic/DTW follower. **MEDIUM recommendation; LOW expected accuracy until measured.** |
| Supabase Auth + Postgres + Storage | Managed service; `@supabase/supabase-js` 2.x, lock tested patch | Accounts, private PDF/MusicXML/optional audio objects, score/session/note-result tables | Auth JWT integrates with Postgres row-level security; private Storage buckets use Storage RLS. Build owner-scoped policies for every table/object and keep service keys exclusively in worker/server secrets. [Auth](https://supabase.com/docs/guides/auth), [Storage access](https://supabase.com/docs/guides/storage/security/access-control), [private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals). **MEDIUM** |

### Supporting libraries and browser APIs

| Library / API | Version | Use / boundary |
|---------------|---------|----------------|
| `MediaRecorder` | Browser API | Optional recording only after explicit opt-in; probe supported MIME types. Per-note results must work without a recording. **MEDIUM** |
| `AudioContext.currentTime` and `getOutputTimestamp()` | Browser API | Use one audio-clock domain for metronome scheduling and timestamped observations; map to UI/performance time only at the boundary. Measure device output and capture latency empirically. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp). **MEDIUM** |
| `DOMParser` plus narrow MusicXML normalizer | Browser API + application code | Parse and validate an allowed MusicXML subset, retain unsupported markings, and store correction patches/revisions. Avoid making OSMD's mutable render tree the database schema. **MEDIUM** |
| `tus-js-client` | Current 4.x, lock tested patch | Add for scores/optional recordings above roughly 6 MB or unreliable uploads; Supabase recommends resumable TUS over standard upload beyond 6 MB. [Upload guidance](https://supabase.com/docs/guides/storage/uploads/standard-uploads), [resumable uploads](https://supabase.com/features/resumable-uploads). **MEDIUM** |
| Supabase CLI / SQL migrations | Current compatible CLI, pin in CI | Reproducible Postgres schema, Storage policies, seed fixtures, and integration tests. **MEDIUM** |

### Development and test tools

| Tool | Version / role | Required checks |
|------|----------------|-----------------|
| Vitest | 5.x; Vite >=6.4 and Node >=22.12 per its current guide | Pure score normalization, cents math, onset/tempo/measure math, follower recovery, silence/octave cases, session statistics. [Vitest guide](https://vitest.dev/guide/). **MEDIUM** |
| Playwright Test | 1.63.x | Browser flows for upload/review/correction/practice/history and Chromium, Firefox, WebKit API handling. Install browser binaries matching the Playwright version; use injected synthetic audio, not live microphone hardware, in CI. [Releases](https://github.com/microsoft/playwright/releases), [browsers](https://playwright.dev/docs/browsers). **MEDIUM** |
| Golden fixture corpus | Project-owned, versioned | Licensed/permissioned PDFs paired with manually verified MusicXML; generated sine/chirp/noise plus consented singing recordings with onset and pitch labels. Track note/measure/part OMR accuracy and pitch/onset/position latency by browser/device. **MEDIUM** |
| SQL policy tests | Project-owned | Prove user A cannot read/write user B's score, files, corrections, sessions, or optional recording; test service-role separation and deletion. **MEDIUM** |

## Deployment and license constraints

- Host the Vite build over HTTPS; microphone and `AudioWorklet` require a secure context. [MDN AudioWorklet](https://developer.mozilla.org/docs/Web/API/AudioWorklet). **MEDIUM**
- Deploy Audiveris as a separate container/process with Java, CPU/memory/page/time caps, an authenticated job boundary, and private object access. Supabase Edge Functions are unsuitable for the OMR computation: hosted functions have a 2-second CPU-per-request limit and 256 MB memory cap. [Supabase limits](https://supabase.com/docs/guides/functions/limits). **MEDIUM**
- Audiveris is AGPLv3. Review obligations for a network-facing OMR service and modified code before product deployment; publish corresponding source or choose a properly licensed commercial OMR service as required by that review. This is a licensing decision gate, not a claim that a separate process removes AGPL duties. [Audiveris handbook](https://github.com/Audiveris/audiveris/blob/master/docs/_pages/handbook.md). **MEDIUM**
- OSMD is BSD-3-Clause; preserve required notices in distributions. PDF.js is Apache-2.0; pitchy is 0BSD. [OSMD license](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/develop/LICENSE), [PDF.js repo](https://github.com/mozilla/pdf.js), [pitchy repo](https://github.com/ianprime0509/pitchy). **MEDIUM**
- Set private buckets, owner-scoped RLS on every data table and `storage.objects`, MIME/size limits, opaque object paths, and short-lived access when sharing is necessary. A Supabase service key bypasses RLS and must never ship to the browser. Signed URLs remain usable until expiry and are not equivalent to revocable user sessions. [Storage access](https://supabase.com/docs/guides/storage/security/access-control), [serving private assets](https://supabase.com/docs/guides/storage/serving/downloads). **MEDIUM**
- Limit uploads: standard Supabase upload is best under 6 MB, use resumable uploads for larger PDFs; set bucket limits within the plan's global limits. [Upload guidance](https://supabase.com/docs/guides/storage/uploads/standard-uploads), [limits](https://supabase.com/docs/guides/storage/uploads/file-limits). **MEDIUM**

## Alternatives considered

| Recommended | Alternative | When the alternative makes sense |
|-------------|-------------|----------------------------------|
| OSMD for MusicXML viewing and score feedback | Verovio | Choose Verovio if MEI and SVG element IDs/data attributes become primary; it supports MusicXML import but is LGPLv3 and requires a separate score model/editor. [Verovio repo](https://github.com/rism-digital/verovio), [license guide](https://book.verovio.org/introduction/licensing.html). **MEDIUM** |
| Audiveris batch OMR | Licensed commercial OMR API/SDK | Use if a measured PDF corpus shows materially better accuracy or the AGPL deployment obligations conflict with the product. Verify private-score handling, cost, rate limits, output rights, and MusicXML quality in a spike. **LOW until vendor/corpus evaluation.** |
| Supabase managed Postgres/Auth/Storage | Self-hosted Postgres + object storage + Auth | Use when data residency, cost scale, or vendor-control needs justify operating identity, backups, storage policies, and incident response. **MEDIUM** |
| React/Vite client app | Next.js | Use if public, search-indexed content or server-rendered product pages become important. Its server layer does not replace the Java OMR worker or browser audio processing. **MEDIUM** |
| `pitchy` + measured follower | Full ML pitch/transcription model | Consider only if the monophonic baseline fails corpus accuracy targets; larger model/latency and voiced/unvoiced errors add cost and complexity. **LOW until benchmarked.** |

## What not to use

| Avoid | Specific problem | Use instead |
|-------|------------------|-------------|
| PDF.js text extraction as notation recognition | PDF text/glyph placement does not reconstruct parts, pitch, rhythm, measures, or ties. PDF.js is a PDF parser/renderer. | Audiveris output plus correction and verified MusicXML-derived timeline. |
| OSMD as a complete editor | Its project explicitly describes rendering and limited modifications, not insertion/movement of notes as a full editor. | Own note/measure/part correction model and UI; serialize/re-render. |
| Hosted Edge Function for Audiveris | Java process and CPU-intensive OMR exceed the function model/limits. | Isolated container job worker. |
| `requestAnimationFrame` for pitch sampling or metronome timing | UI frame scheduling pauses/drifts independently of audio time. | AudioWorklet capture and Web Audio clock scheduling. |
| Old `ScriptProcessorNode` | Runs processing on the main thread, leading to audio glitches under UI work. | `AudioWorklet`. [MDN guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet). |
| Pitch-only nearest-note grading | A correct sung frequency can belong to a different written note; timing and score position remain unknown. | Confidence-aware alignment to the selected part's corrected note events. |
| Mandatory raw audio upload or browser service-role credentials | Unnecessary private voice retention and direct access to all users' data. | Per-note results by default, opt-in recording, server-only secrets. |

## Version compatibility and open validation

| Pair / boundary | Status |
|-----------------|--------|
| React 19.3 + Vite 8 | Standard client stack; pin exact tested patches in lockfile. |
| Vite 8 + Vitest 5 + Node 22.12+ | Meets documented minimums. |
| `pitchy` 4.x + ESM/Vite | `pitchy` v4 is ESM-only; the prototype's installed 4.1.0 is unused and must be explicitly imported into the new pipeline. |
| PDF.js 6.x + Vite | Bundle its worker separately and test CSP/asset serving in deployment. |
| Audiveris 5.11.0 + MusicXML 4.0 + OSMD 2.1.1 | Test SATB, pickup measures, repeats, ties, tempo changes, lyrics, and scans against a real fixture corpus; version compatibility alone does not establish semantic correctness. |

The largest unresolved question is attainable OMR and live timing accuracy on the actual user score/voice corpus. Before committing to automated PDF import as a seamless flow, run a short vertical spike: representative PDFs -> Audiveris -> corrected MusicXML -> OSMD -> selected-part events -> synthetic and real-voice alignment. Record error rates and correction time. **Confidence in this validation need: MEDIUM.**

---
*Stack research for Pitch Proof. Sources above are official project, standards, and platform documentation or release pages checked 2026-09-24. Research-store provider classification: `websearch --verified` = MEDIUM; no library-specific Context7 service was available.*
