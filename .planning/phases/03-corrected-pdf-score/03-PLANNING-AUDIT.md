# Phase 03 Planning Audit

This is a coverage/dependency contract, not executed acceptance. No requirement is complete. Package/cloud/license/corpus/UI decisions are concrete execution gates.

## Phase goal

Original ROADMAP goal: A singer can upload a supported printed PDF, review the recognized single vocal part against the original, correct it, and confirm a trustworthy score version for practice.

Derived framing of that existing goal: **As a** singer, **I want to** upload, review and correct a supported printed PDF, **so that** I can confirm a trustworthy score version for practice. D-04 expands correction to all parts while practice/confirmation selects one part. This framing adds no scope and does not rewrite ROADMAP.

## Source coverage

| Source | ID | Item | Plans | Status |
| --- | --- | --- | --- | --- |
| GOAL | Phase 3 | Private supported PDF to corrected trustworthy practice reference | 04-15 | COVERED |
| GOAL | Success 1 | Upload/progress/candidate/actionable failure | 06/07/13/15 | COVERED |
| GOAL | Success 2 | Original plus editable proposed notes/rests/measures/tempo/parts | 04/05/08 | COVERED |
| GOAL | Success 3 | Select one part; correct pitch/rhythm/structure/tempo | 04/09 | COVERED |
| GOAL | Success 4 | Confirm/reopen original; unsupported/unconfirmed ungraded | 10/11/12/15 | COVERED |
| GOAL | Exit | Permissioned digital/eligible scans; recognition/correction effort/source measurements; replay/license | 01/02/05/12/14/15 | COVERED |
| REQ | LIB-01 | Private PDF library/status/error | 01/03/06/07/13/15 | COVERED |
| REQ | SCORE-01 | Genuine notes/rests/measures/tempo/parts recognition | 02/05/07/08/14 | COVERED |
| REQ | SCORE-02 | Editable score beside original with correspondence | 04/05/08/10/15 | COVERED |
| REQ | SCORE-03 | Selected-part and all-score supported correction | 04/09/12/14 | COVERED |
| REQ | SCORE-04 | Trustworthy immutable confirmation; no unsupported/unconfirmed grades | 10/11/12/14/15 | COVERED |
| CONTEXT | D-01 | Direct staff pitch, rhythm toolbar, keyboard equivalents | 04/09/15 | COVERED |
| CONTEXT | D-02 | Note/rest tool, duration, intended staff position | 04/09/15 | COVERED |
| CONTEXT | D-03 | Automatic cross-barline overflow/underflow reflow/highlight | 04/09/15 | COVERED |
| CONTEXT | D-04 | All parts editable; selected practice part emphasized | 04/08/09/12 | COVERED |
| CONTEXT | D-05 | Original beside score; selection scroll/highlight source | 05/08/15 | COVERED |
| CONTEXT | D-06 | Uncertainty, Next issue and free navigation | 07/08/10/15 | COVERED |
| CONTEXT | D-07 | Usable partial recognition; unavailable regions explicit | 05/07/08/14/15 | COVERED |
| CONTEXT | D-08 | Explicit Save draft, dirty warning, no autosave | 03/10/13/15 | COVERED |
| CONTEXT | D-09 | Confirm selected reviewed range of one part | 11/12/15 | COVERED |
| CONTEXT | D-10 | Per-measure original-PDF review | 10/11/14/15 | COVERED |
| CONTEXT | D-11 | New draft preserves immutable prior confirmation | 10/11/13/15 | COVERED |
| CONTEXT | D-12 | Every affected/ripple measure invalidated; unaffected preserved | 04/09/10/11/15 | COVERED |
| RESEARCH | A1-A3 | Reviewed exact candidate stack/native provenance and XML replacement | 01/03 | COVERED |
| RESEARCH | A4 | Canonical rational IDs/context/commands/reflow/undo, no dual truth | 04/09 | COVERED |
| RESEARCH | A5 | Server review fingerprints/CAS/immutable snapshots | 10/11 | COVERED |
| RESEARCH | A6 | Actual .omr/original identity-transform join, unions/manual repair | 05/08 | COVERED |
| RESEARCH | A7 | Private S3 actual bytes and ownership; bounded durable worker | 01/03/05/06/07/13/15 | COVERED |
| RESEARCH | A8 | General rational timeline, fixture/guest/audio unchanged | 12/15 | COVERED |
| RESEARCH | A9 | Early browser/native feasibility; host failures block honestly | 03/04/05/15 | COVERED |
| RESEARCH | A10 | Rights/independent gold/physical scans/complete effort-source metrics | 02/14 | COVERED |
| RESEARCH | A11 | Approved scratch/orphan/original/draft/backup retention | 01/13/15 | COVERED |
| RESEARCH | Security | Upload/XML/ZIP/process bounds, no remote fetch/entities/hidden storage | 03/05/06/07/15 | COVERED |
| RESEARCH | Runtime DB | Actual SQLite migrations/restart, no ORM substitution | 06/07/10/11 | COVERED |
| RESEARCH | License | AGPL topology/source/notice disposition before deployment | 01/15 | COVERED |
| RESEARCH | Privacy | Session refresh preserves unsaved work; genuine expiry clears content | 10/13/15 | COVERED |
| RESEARCH | Validation | Portable, actual browser/native/cloud/corpus separate gates | 03-15 | COVERED |

Exclusions are later singing measurement, history, optional recordings, expanded unmeasured notation and the deferred reference-listening workflow. No locked decision or phase requirement is deferred.

## Dependency and ownership graph

| Wave | Plans | Needs -> creates |
| --- | --- | --- |
| 1 | 03-01, 03-02 | source artifacts -> Versioned provenance and deployment decisions plus a fail-closed prerequisite checker.; source artifacts -> Design contract, corpus protocol, original fixture generator and rights/gold manifests. |
| 2 | 03-03 | 03-01+03-02 -> Exact dependency locks, reviewed browser bundle, secure test fixture and host-dependent gate runners. |
| 3 | 03-04 | 03-03 -> App-owned canonical commands, Smoosic adapter and reusable review shell with real browser evidence. |
| 4 | 03-05 | 03-04 -> Bounded native worker, secure MusicXML import and source-map proof with actual native artifacts. |
| 5 | 03-06 | 03-04+03-05 -> Owner-scoped score persistence/upload/bytes, reachable private library and actual-cloud tracer evidence. |
| 6 | 03-07, 03-08 | 03-06 -> Fenced SQLite job queue, bounded worker lifecycle and accurate status/error/cancel UI.; 03-06 -> Complete supported MusicXML normalization, PDF.js source viewer, union overlays and source repair controls. |
| 7 | 03-09 | 03-07+03-08 -> Complete app command/reflow/affected-set behavior and staff/keyboard correction controls. |
| 8 | 03-10 | 03-09 -> CAS draft/review repository and explicit Save draft/review UI with unsaved warning. |
| 9 | 03-11 | 03-10 -> Server confirmation eligibility/snapshots and review-range/confirmed-version browser workflow. |
| 10 | 03-12, 03-13 | 03-11 -> General confirmed timeline adapter and owner practice entry using existing audio lifecycle/count-in semantics.; 03-11 -> Non-destructive session reauthorization and bounded durable cleanup with explicit retention behavior. |
| 11 | 03-14 | 03-12+03-13 -> Reproducible corpus evaluator, independently approved gold and measured score-support report. |
| 12 | 03-15 | 03-14 -> Actual acceptance evidence and deployment/support documentation ready for phase verification. |

Same-wave plans have no modified-file overlap. The native importer consumes the canonical model, so 03-05 deliberately follows 03-04. UI/rights/provenance/containment/provider approvals precede their consumers. The first production editor tracer is 03-04-01; genuine OMR/source tracer 03-05-01 and complete private-cloud PDF tracer 03-06-02/03 follow before expansion. All retained production code and paths are real; prerequisites are not labeled completed user features.

## Assumption-delta decision

The deterministic detector returned detected=true (pluralization/chosen). Promote the canonical versioned score section as primary identity: score/version/part/range plus event/source IDs and exact rational time. The public fixture remains its original validated variant through an explicit adapter; renderer indexes/MusicXML/printed labels never become competing truths. 03-04, 03-06-01 and 03-12 encode this choice and its invariant tests.

## Schema gate

No Payload/Prisma/Drizzle/Supabase/TypeORM paths or new ORM are planned, so the ORM-specific push injector does not apply. SQLite schema changes still have BLOCKING actual empty/prior-schema migration, FK/index/record, restart and read/write checks in 03-06-02, 03-07-01, 03-10-01 and 03-11-01.

## Spec-less edge coverage

The supplied deterministic report had 9 applicable, 0 resolved, 9 unresolved. Seven classified edges have defensible explicit predicates lifted into must_haves.truths; the two unclassified rows remain flagged assumptions, never auto-dismissed or backstop-resolved.

| Edge | Requirement/category | Disposition | Predicate / owner |
| --- | --- | --- | --- |
| E-01 | LIB-01 boundary | resolved/explicit | Approved byte/page/pixel/quota limits at L-1/L/L+1; empty and overflow reject; 03-06. |
| E-02 | LIB-01 precision | resolved/explicit | Checked safe-integer counters, actual byte/checksum identity and reserved quota; 03-06. |
| E-03 | LIB-01 concurrency | resolved/explicit | Owner-token idempotency, claim/lease/cancel fencing, no stale overwrite; 03-07. |
| E-04 | SCORE-01 unclassified | unresolved/flagged | No more specific edge was supplied. Independent gold and actual native/corpus failure review in 03-05/14/15 must examine recognition omissions; verifier surfaces insufficient_spec if unconfirmed. |
| E-05 | SCORE-02 boundary | resolved/explicit | First/last/unknown selection and valid page-edge vs outside rectangles; unknown mapping cannot review; 03-08. |
| E-06 | SCORE-02 precision | resolved/explicit | Original affine transforms within one CSS output pixel across tested viewports; no canonical rounding; 03-08. |
| E-07 | SCORE-03 unclassified | unresolved/flagged | No more specific edge was supplied. Real full-correction browser/gold review in 03-09/14/15 must examine missing correction affordances; verifier surfaces insufficient_spec if unconfirmed. |
| E-08 | SCORE-04 boundary | resolved/explicit | Single/first/last inclusive range accepted only when eligible; empty/reversed/out-of-part/gap reject; 03-11. |
| E-09 | SCORE-04 precision | resolved/explicit | Canonical reduced-rational/effective-context/source hashes; equivalent values stable and real change invalidates; 03-11. |

No-silent-drop equality: 9 surfaced = 7 lifted explicit truths + 2 flagged unresolved assumptions.

## Spec-less prohibitions

The two-stage recall screened unsafe overclaiming, fabricated provenance, hidden persistence, silent deletion, ownership leakage, parser abuse, stale concurrency, loss of confirmed work and misleading grading. Routine correctness goes to edge/tests; generic authorization, injection, traversal, retention and privacy controls refer to the STRIDE/OWASP threat register rather than minting duplicate prohibitions.

Two bespoke safety/transparency prohibitions survive. Their projection was generated with the runtime projectProhibitions contract and appears descriptor-less in 03-05 and 03-12 must_haves.prohibitions. Both remain status=unresolved, verification=judgment and flagged-unverified; no check_kind/check_target/check_rule/fixture descriptor is invented.

1. Recognition confidence, a reviewed reference and provisional microphone observations must not become authoritative singing grades.
2. Unavailable/unmapped passages must not be portrayed as a complete supported score, and inserted symbols must not receive fabricated exact source positions.

No-silent-drop equality: 2 kept = 2 projected + 0 dropped. Final human judgment/evidence is required; later authored tests alone do not silently convert these projections to green.

## Grounding, discovery and estimates

Discovery uses the completed 03-RESEARCH/PATTERNS artifacts; no additional library selection is hidden. Existing analogs are tracked server/app.mjs, server/index.mjs, server/db.mjs, server/owner-resources.mjs, client/workspace.js, practice-fixture.js, practice-audio.js and existing test/harness scripts. New paths are explicitly named in plan task/frontmatter ownership. All new runnable targets are authored in the same or an earlier task; portable acceptance never uses TODO-only tests.

estimate-calibration returned factor=1, sample_count=0, confidence=low; emitted raw_tokens=tokens and confidence=low inherit those values. Estimates target bounded slices, not confidence claims. Planning ran schema/structure/coverage probes only, with no product tests/builds or installations.

## Gates still pending execution

Exact flagged package/native approval; approved deployment/license/provider/cost/retention; UI contract approval; corpus rights/independent gold/effort budget; native containment; real staff/reflow/ID/undo proof; actual .omr-to-original join; actual private cloud bytes/isolation/cleanup; actual correction effort/support report; end-of-phase human review. Missing setup blocks consumers and phase completion. Nothing here authorizes deployment or marks a requirement complete.

