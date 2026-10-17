# Permissioned score corpus and preregistered evaluation

Status: **prepared, unapproved; no measured recognition or correction runs**. Checkpoint 03-02-02 blocks external copying/uploading and corpus evaluation. Generated local fixtures are allowed by this task; that authorization does not grant third-party edition rights or approve release use. Design approval is a separate 03-02-03 gate. No phase requirement is complete.

## Current inventory and honest strata

The manifest records 12 newly composed two-page, two-part exercises (24 original digital pages) and 12 controlled rasterized companions (24 additional pages). All use printed five-line treble/bass notation, 4/4, 72-116 quarter BPM, explicit accidentals, quarter/half/whole/eighth/sixteenth values, dotted eighth/quarter/half values, rests and ties. Six have a one-quarter pickup. Every page has two systems with both parts; system breaks are m2/m3 and m6/m7, and the page break is m4/m5. Exercise pp-12 deliberately omits upper m6 and obscures lower m7 while preserving usable music elsewhere.

These are 12 closely related transpositions/tempo variants of a short original study, **not 12 independent engraving traditions or representative market coverage**. This intentionally bounded local feasibility set cannot establish broad support. Source gold consists of measure/staff rectangles, not exact note boxes. All gold is candidate authored data awaiting independent human verification.

| Stratum | Present inputs | Proposed acquisition before support measurement |
| --- | --- | --- |
| Original digital | 12 exercises, 24 pages | Human decode/review of all pages and gold |
| Controlled raster | 12 companions, 24 pages; odd exercise IDs 300 DPI, even IDs 144 DPI; binary black/white carried in 8-bit grayscale, no physical imaging | Report 300/144 separately; paired variants stay paired in analysis |
| Physical scans of originals | 0 pages; four named pending manifest slots | Print pp-03 and pp-09, scan each two-page score at 300 and 400 DPI on a flatbed; record real printer/scanner/settings/skew/crop/contrast; permission and gold review before use |
| External digital editions | 0 assets; two selection slots | User-identify an actual licensed conventional single-line-per-staff vocal edition and an independent multi-part choir edition; record title/publisher/edition/date/source/license and intended uses before acquiring bytes |
| External eligible physical scans | 0 assets; two selection slots | User-identify two permissioned printed editions from distinct engravers and obtain real flatbed scans, including one moderate-skew/shadow case; independent reviewer determines whether each is eligible, not the generator |

Pending slots are acquisition requirements, not corpus members, and have no fabricated hash, page count, source title, permission grant or reviewer. Representative external editions cannot be named honestly until supplied/selected. No external PDF has been downloaded, copied, uploaded or embedded. A print-to-image or software rasterization does not become a physical scan. A composition's age and public web access do not establish edition/engraving rights.

## Provenance, rights and storage

Every available asset has its own ID, SHA-256, byte/page count, original author/engraver, derivative parent, stratum/settings, semantic/region-gold reference and rights/reviewer state. PDF hashes cover exact bytes; gold/design/protocol text hashes cover UTF-8 with CRLF normalized to LF for consistent Windows checkouts. Authorship is recorded as original material produced with Codex on 2026-10-17, without a copied score, external font file or third-party image. That is a provenance statement, not an independent legal adjudication or user approval. Per-asset local processing is authorized for this task's generated fixtures; cloud upload, public redistribution and evaluation remain false/pending until expressly approved.

For each external asset obtain evidence covering composition and edition/engraving, scans and transformations, local OMR processing, proposed cloud processing/upload, access by reviewers and whether redistribution is allowed. Record owner/licensor, grant/license text or evidence reference, scope, expiry, territories/restrictions, permitted destinations and a dated approver. If cloud processing is forbidden, keep it local and exclude that asset from cloud-supported claims. If redistribution is forbidden, commit only approved metadata/hash/gold as permitted; keep originals outside git in authorized private storage. Never infer missing rights from another asset. Unknown rights means excluded. Permissions must be approved before fetching/copying real bytes; approval is not retroactive.

`manifest.json` is the source for the two upcoming approval records. It intentionally contains null approvers/dates/reviewer IDs. Generated assets' rights state is `pending-user-confirmation`; no approval is asserted. Independent gold reviewer identity must differ from the generator/gold author. An independent human must examine decoded original pages, pitches/rests/rational timing, part/clef/tempo/pickup/meter, ties, regions, missing/corrupt areas and allowable reviewed ranges. The evaluator/OMR cannot be the gold author or the gold adjudicator. Resolve discrepancies in a versioned change, retain prior hashes, and approve final exact gold/asset hashes before measuring.

The generator accepts no input PDF or arbitrary output path and performs no network calls. Each batch uses its own OS temporary directory, at most 24 PDFs, 48 pages, 2 MiB per PDF, 32 MiB total, 8.5 million pixels per page. `--verify` removes its own batch in a finally block; `--generate` retains one fresh review batch and prints its directory. No generated PDFs are committed. Reviewers should remove that specific batch after review. This is fixture scratch behavior, not the future product retention policy. No production credentials, recordings or private user scores are involved.

## Reproducible preparation

Agent-run commands (reviewers do not need a CLI):

```text
node scripts/create-score-fixtures.mjs --verify
node scripts/create-score-fixtures.mjs --generate
node scripts/create-score-fixtures.mjs --verify-protocol
node scripts/create-score-fixtures.mjs --verify-design
```

`--verify` checks separately authored semantic/region gold, 12 exercises, two parts, measure sums, ties/damage expectations, authorship, committed SHA-256/byte/page counts, PDF page tree/xref/bounds and double-render determinism. It reports zero physical scans and zero independently reviewed assets. This is fixture integrity, not independent gold verification or OMR feasibility. `--generate` additionally prints the retained temp directory for concrete PDF inspection. `--inventory` is a maintainer-only hash inventory mode; it never approves or rewrites gold/permissions. Rebuilding after an intentional generator change requires reviewing PDF differences before updating committed hashes.

`--verify-protocol` deliberately fails until dated protocol/rights/independent-review/budget records and representative physical scans are present. `--verify-design` deliberately fails until all twelve cases and explicit design approval exist. A failure at either upcoming gate is expected while its approval is pending; it must not be described as completed approval. Fixture generation adds no third-party dependencies.

## Freeze before measurement

Record protocol version/hash, approval date/person/evidence, all available input and gold hashes, reviewer independence, selected numeric effort option, exact approved OMR/native/importer/editor versions/flags/settings, hardware, browser/version, DPI/page rotation/transforms and attempt time limits. Freeze the inclusion matrix before first measured run. No tuning on a held-out test set or dropping failed pages. Correlated transpositions and paired digital/raster variants share an exercise cluster; report per-exercise and per-stratum counts rather than pretending paired pages are independent samples.

Proposed initial boundaries are conventional printed single melodic voice per staff with multiple editable parts. Scans, repeats, shared-staff/divisi, tuplets, grace notes, handwriting, warped/photos/damage and ambiguous part assignment are not supported until each is measured. The deliberately damaged test validates abstention/partial handling, never support for reconstructing absent notation. Final support is the intersection of recognition, editing, source mapping, confirmation and replay evidence, not a package capability list.

## Measurements and denominators

Report raw OMR before any human correction separately from corrected drafts and confirmed sections. Gold event identity uses part/measure/event plus reduced rational onset/duration in quarter beats. Align within part and ordered measure using a frozen minimum-cost sequence alignment; mismatches cannot be rescued by moving an event to the correct pitch elsewhere. Report insertions, deletions and substitutions, not just accuracy among recognized notes. Tied segments are compared as written events and as one sounding duration separately.

| Metric | Definition and denominator |
| --- | --- |
| Note/rest precision and recall | Correct kind and event alignment / proposed events (precision), and / all eligible gold events (recall); notes/rests separately; false notes replacing rests are errors |
| Pitch, onset, duration, part | Exact MIDI, reduced rational quarter-beat onset/duration and stable part assignment, individually and jointly; missing/misaligned events count incorrect, not excluded |
| Measures/pickup/meter | Correct recovered boundaries, expected/recognized measure counts, pickup length and effective meter vs gold; split/merged/missing measures reported |
| Tempo/parts | Exact quarter-BPM and effective change location; recovered part names/clefs/identity and assignment; absent tempo is unknown, not a default success |
| Partial/failure recovery | Missing/corrupt/unavailable region detection precision/recall, usable measures retained, failed jobs/pages and timeouts; no invented completion |
| Source precision | Correct page/staff/measure original region claims / all emitted claims, manually adjudicated against gold; inserted-symbol precise claims, wrong-part/page or claims on damage are false positives |
| Source coverage | Correct mapped eligible gold measures / all eligible gold measures; also show all intended measures including damage as a separate denominator; report unmapped regions and abstentions |
| Post-correction completeness | Exact event/context/region gold agreement across all confirmed fields; residual errors and draft/unavailable/unconfirmed measures separately, including abandoned attempts |
| Trust | False confirmation eligibility or authoritative-grade/source claims for unsupported, unmapped, unreviewed, stale or foreign revisions; report attacks attempted and false positives, not just successful confirmations |
| Effort | Active seconds per corrected/reviewed measure, gestures/measure, total wall seconds, retries, abandoned attempts and workload retained; per participant, exercise and stratum |

For source rectangles, require correct page/part/measure identity, inclusion of the relevant source content and no neighboring-measure substitution; report geometric overlap/IoU separately rather than choosing an unapproved IoU threshold to certify trust. Unions after reflow retain each original rectangle; arbitrary bounding boxes spanning unrelated music are not precise correspondence. Manual repair is labeled and adjudicated separately. Missing/inserted exact symbol provenance never earns precision credit by a guessed position.

Count every preregistered page/job/event/measure in its applicable denominator, including rejected/failed/abstained/time-limited cases. Provide both all-submitted and eligible-subset denominators with explicit exclusion reasons. Pending/unpermissioned assets have acquisition counts only and never enter a measured denominator. Abandoned attempts remain in abandonment rate and their pre-abandon work/time stays visible; residual uncorrected fields remain errors for completeness. Publish raw numbers and distribution/sample sizes per stratum; no aggregate can hide scan failures. Small sets do not justify population p95 claims.

Effort observation: start active timer at first intentional comparison/edit with both panes ready; include inspection, navigation, manual source repair, correction, per-measure marking, explicit save and confirmation. Pause only for recorded external interruption/technical waiting, not because the user is thinking; report paused/wall duration separately. Count each pointer commit or keyboard semantic command as one gesture, plus navigation/save/review actions; a drag is one commit and a ripple is one command with its affected measures recorded. Undo/redo and retries count. Do not retain microphone audio or private score imagery in analytics. Use consented participant IDs and minimal action/time records.

## Proposed numeric acceptance and effort choices

Proposed quality floor (requires approval): **100% corrected confirmed-field gold agreement; zero false trust eligibility; zero falsely precise source claims; 100% independently verified source correspondence for every confirmed measure**. Abstain instead of certifying an unknown field/region. Raw-recognition performance is reported by stratum with no unmeasured universal accuracy promise. Approval precedes the first measured run; thresholds cannot be relaxed after seeing results without a new protocol and rerun.

Choose one numeric effort option or supply explicit replacements. These are proposals, not results or approved budgets.

| Option | Median active seconds/measure | p95 active seconds/measure | Median gestures/measure | p95 gestures/measure | Maximum abandonment |
| --- | ---: | ---: | ---: | ---: | ---: |
| A: Fast home practice (recommended proposal) | 30 | 90 | 8 | 24 | 5% |
| B: More correction tolerated | 60 | 180 | 16 | 48 | 10% |
| C: Strict convenience | 15 | 45 | 4 | 12 | 2% |

Budget applies independently to each claimed supported stratum. Use nearest-rank percentiles over participant-exercise active-seconds/measure observations; publish counts and individual results. Proposed measurement floor is five consenting independent singers completing at least four exercises per claimed stratum (20 observations); expand if uncertainty remains. These counts, participant assignment and time caps also require protocol approval. Proposed time cap is 20 active minutes per exercise; reaching it counts as abandoned/incomplete. Usability is not established by generator or staff-author trials. No claims until independent correctness/source/trust floor and approved effort limits pass together.

## Required human record and next step

At 03-02-02 review actual fixture PDFs and manifest. Supply or designate permissioned external editions and actual physical scans (or explicitly restrict claims while acquisition remains open), confirm per-asset allowed local/cloud/reviewer/redistribution uses, identify an independent musical gold reviewer and approve dated exact gold after review, then choose A/B/C or replacement median/p95/gesture/abandonment numbers and protocol/sample/time-cap policy. Record the approver/date/evidence before any measurement. Unknown permissions, missing scans or absent reviewer remain visibly excluded/blocking; selecting a budget alone cannot close the gate.

The local packet is complete enough to review now. External input acquisition, physical scanning and independent human gold verification are real pending work that cannot be manufactured by code. After rights/protocol review, 03-02-03 separately reviews the concrete D-01 through D-12 interaction contract before editor implementation.
