# 03-02-01 fixture and packet evidence

Recorded 2026-10-17. Task 03-02-01 complete; **plan 03-02 is at blocking-human checkpoint 03-02-02 (1/3 tasks)**. This is task evidence, not a partial plan SUMMARY. No rights, independent review, budget, design or phase-requirement approval is asserted.

## Reviewable packet

- [Review interaction contract](../../../docs/score-review-design.md): concrete D-01 through D-12 walkthrough, responsive layouts, pointer/keyboard/focus/non-color/error cases; explicitly unapproved and not implemented.
- [Corpus protocol](../../../docs/score-corpus-protocol.md): rights/scans/reviewer requirements, denominators, completeness/source/trust targets and numeric effort proposals.
- [Asset manifest](../../../tests/fixtures/scores/manifest.json): 24 available generated assets with exact PDF hashes; four physical-original scan slots and four external-edition slots explicitly pending.
- [Candidate musical and page-region gold](../../../tests/fixtures/scores/tracer-gold.json): authored separately from the engraver, independent of OMR; human review pending.
- [Generator](../../../scripts/create-score-fixtures.mjs): Node built-ins only; bounded OS-temp output, no PDF input/network/package operation.

Actual retained review batch (ephemeral; regenerate with `--generate` if cleaned):

`C:/Users/casti/AppData/Local/Temp/pitch-proof-scores-A2r56g`

- [Original pp-03 PDF](C:/Users/casti/AppData/Local/Temp/pitch-proof-scores-A2r56g/pp-03-digital.pdf)
- [Original pp-12 PDF with missing/corrupt passages](C:/Users/casti/AppData/Local/Temp/pitch-proof-scores-A2r56g/pp-12-digital.pdf)
- [Rasterized pp-11 PDF](C:/Users/casti/AppData/Local/Temp/pitch-proof-scores-A2r56g/pp-11-rasterized.pdf)
- [Digital contact sheet](C:/Users/casti/AppData/Local/Temp/pitch-proof-scores-A2r56g/digital-contact.png)
- [Rasterized contact sheet](C:/Users/casti/AppData/Local/Temp/pitch-proof-scores-A2r56g/rasterized-contact.png)

PDFs and decoded screenshots stay outside git. Only the explicit current batch is retained for review; verification batches clean their own temp directories.

## Executed validation

| Check | Result |
| --- | --- |
| `node --check scripts/create-score-fixtures.mjs` | Exit 0 |
| `node scripts/create-score-fixtures.mjs --verify` | Exit 0; final batch 1,680,713 bytes; 12 exercises, 24 PDFs, 48 pages (24 digital + 24 rasterized), deterministic double render; authored gold, size/page/xref and committed hash checks pass |
| Embedded negative checks | Nine expected rejections: out-of-page region; wrong page identity; invalid duration; unreduced rational; unknown authorship; false eligibility on damage; wrong expected pitch; missing approval identity/date; truncated PDF |
| `node scripts/create-score-fixtures.mjs --generate` | Exit 0; final retained batch above, same committed byte hashes |
| Independent PDF decoding | Windows.Data.Pdf loaded all 24 PDFs, checked 2 pages each and 816x1056 DIPs (=612x792 PDF points), rendered all 48 pages to nonempty PNGs |
| Agent visual inspection | Both 24-page contact sheets and full pp-03 digital p1, pp-11 rasterized p1, pp-12 digital p2 inspected. Final pp-12 p2 rechecked after label repair. No unintended clipping/overlap found in these checks; intended missing and corrupt regions remain obvious. This is agent visual QA, not independent human musical gold review. |
| `node scripts/create-score-fixtures.mjs --verify-protocol` | Exit 1, expected: `Corpus protocol: explicit approval pending` |
| `node scripts/create-score-fixtures.mjs --verify-design` | Exit 1, expected: `Review interaction contract: explicit approval pending` |
| `git diff --check` | Pass (pre-existing shared-state CRLF notices only) |

No OMR, correction effort study, actual editor/browser acceptance, external scan recognition, cloud processing or support measurement ran. Existing 03-01 files/checker/tests were not modified. Existing 109 passing tests were reported by the orchestrator; this task's changed behavior is exercised by its planned generator verification, rather than rerunning unrelated server tests.

The available Poppler/Python commands were not found. Headless Chrome's first sandbox attempt failed GPU startup, and a subsequent isolated render produced only a blank viewer; neither is counted as PDF validation. The successful independent decoder was the existing Windows.Data.Pdf runtime via System.Runtime.WindowsRuntime, with `LoadFromFileAsync`, `GetPage` and `RenderToStreamAsync`, then System.Drawing contact sheets. No tool or library was installed.

## Content identities

Text hashes below use UTF-8 with CRLF normalized to LF. PDF hashes remain exact byte identities in the manifest.

| Artifact | SHA-256 |
| --- | --- |
| `tracer-gold.json` | `b82f16c433e65dfa197d016261a6f0ea1c01fdc7f70ec49b33df29addb1ee56f` |
| `create-score-fixtures.mjs` | `00a0082eefb58313ac5e3d49ae6d01a7333b450e5fb17eb0f285cae8268616e5` |
| `score-review-design.md` | `f2a1264af6ddf18c973692d20a612ede655501ac9be9aa1fe3717b59a4742819` |
| `score-corpus-protocol.md` | `f2640289857bfdd7911bb367909686372cdf3188970b0cfcf5104a1aa0325d58` |

## Required gate record

Task 03-02-02 requires asset-level permission/allowed-use evidence, actual representative scan inputs, an independent gold reviewer with reviewed exact gold, and dated protocol/budget approval **before** measurement. Current physical-scan pages: 0; independently reviewed assets: 0; third-party copied/downloaded assets: 0. Original generated authorship does not imply user rights approval. The 12 related studies do not represent edition diversity.

Budget proposals: A median/p95 30/90 active seconds and 8/24 gestures per measure, <=5% abandonment; B 60/180 seconds, 16/48 gestures, <=10%; C 15/45 seconds, 4/12 gestures, <=2%. No selection is recorded. Quality proposal remains 100% corrected confirmed-field agreement and verified source coverage, zero false source/trust positives.

Task 03-02-03 remains a later separate blocking-human design review. The current actual UI gate observation is frontend=true, hasUiSpec=false, hasFrontendEvidence=false, block=false; no UI approval is inferred.

## Implementation notes

Visual iteration widened short-note spacing, joined the cross-barline tie into one arc, preserved the missing measure label and widened upper-staff gold rectangles to cover high stems. All precede the introducing task commit. Text hash normalization avoids Windows line-ending policy invalidating identical authored expectations/approval content. Physical scans, independent review and permissions remain pending facts; none is replaced by a generated artifact.
