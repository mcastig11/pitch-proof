---
phase: "03"
slug: "corrected-pdf-score"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-15"
---

# Phase 03 - Validation Strategy

This is a planned validation contract, not executed evidence. Research documents capabilities and uncertainties; it does not prove recognition accuracy, editor behavior, cloud privacy or source alignment. The planner must refine the task map against the final plans.

## Test Infrastructure

| Property | Value |
| --- | --- |
| Framework | Existing Node built-in test runner, HTTP/SQLite fixtures and VM DOM harness |
| Config | package.json; tests/*.test.cjs |
| Existing regression command | node --test tests/*.test.cjs (npm.cmd test on Windows) |
| Focused commands | Per-task commands below; new targets must be authored before execution |
| Prior measured runtime | 97 tests passed in 11,438.9159ms during Phase 2; not rerun during planning |
| Feedback budget | Target focused checks under 30 seconds; full portable suite bounded to 120 seconds; record actual times |

## Sampling Rate

- Each implementation task runs its focused command with an explicit failure signal.
- Each wave runs the full portable regression once, using a non-watch command.
- No three consecutive implementation tasks may lack automated verification.
- Before phase acceptance, the full suite and the separate browser/OMR/corpus/cloud gates must pass. A stubbed provider or VM DOM result does not close an external acceptance gate.

## Planned Verification Map

The following proposed files do not exist yet. Final task IDs, waves and threat references must be filled from the plans before execution; every new command target must have an earlier or same-task authoring dependency.

| Area | Requirement / decisions | Threat / secure behavior | Proposed command | Status |
| --- | --- | --- | --- | --- |
| Upload, private bytes, job states and recovery | LIB-01 | Owner checked before bytes; MIME/parser and expansion limits; late worker results rejected | node --test tests/score-library.test.cjs tests/object-store.test.cjs tests/recognition-jobs.test.cjs | Missing, author in plans |
| OMR normalization and rational model | SCORE-01 | No DTD/external resolution; bounded archives; unsupported symbols/gaps retained explicitly | node --test tests/recognition-import.test.cjs tests/score-model.test.cjs | Missing, author in plans |
| Source transforms and linked review | SCORE-02, D-05/D-06/D-07 | Unknown provenance cannot silently claim an exact highlight or become confirmed | node --test tests/score-source-map.test.cjs tests/score-review-ui.test.cjs | Missing, author in plans |
| Staff editing and redistribution | SCORE-03, D-01/D-02/D-03/D-04 | One app-owned command boundary; no upstream hidden persistence; all affected measures reported | node --test tests/score-commands.test.cjs tests/score-review-ui.test.cjs | Missing, author in plans |
| Explicit draft save and confirmation | SCORE-04, D-08/D-09/D-10/D-11/D-12 | Expected revision and server-recomputed eligibility; immutable confirmed snapshot; all affected review invalidated | node --test tests/score-revisions.test.cjs tests/score-timeline.test.cjs | Missing, author in plans |
| Prior account/guest compatibility | All Phase 3 requirements | Ownership and expiry still hold; public audio remains provisional and usable | npm.cmd test | Existing suite, not run during planning |

## Wave 0 Requirements

- [ ] Record package/release provenance and resolve known XML parser paths before installing or executing candidate dependencies.
- [ ] Author original score/gold/source-region fixtures with rights manifests; no unlicensed third-party PDF copying.
- [ ] Author injected storage and worker fixtures with fault, timeout, cancellation, stale-write and two-account cases.
- [ ] Add the score-model, command, source-map, revision and timeline test contracts. Use independent expected rationals, gold fields, region bounds and account IDs rather than implementation-generated expectations.
- [ ] Keep host-dependent browser/OMR/cloud checks separate from portable npm test. Missing external setup must produce a truthful blocked result, not a green skip.

## Separate Browser and External Acceptance

| Gate | Requirement | Required evidence |
| --- | --- | --- |
| Actual editor feasibility | SCORE-03, D-01 to D-04 | Installed browser pointer/keyboard editing, tool insertion, all-part access and selected-part highlight; cross-barline movement including ties/end boundaries; highlighted affected set; no browser autosave/remote upload |
| Actual OMR/source join | SCORE-01/SCORE-02 | Exact approved worker version/flags, real output artifacts/input hashes, page transform/measure identity proof, moved/inserted note provenance; rotate/zoom/scroll source alignment in the browser |
| Review/save/revision | SCORE-02/SCORE-04, D-05 to D-12 | Next issue/free navigation, usable partial result, explicit Save draft and unsaved warning; visibility refresh, session loss, concurrent tabs; confirmed old revision retained during new draft; every affected review mark reset |
| Private cloud storage | LIB-01 | Approved real private bucket/role, two-account metadata and byte denial, server-only credentials, resource limits, failed upload/orphan cleanup and late-job rejection; fake storage is insufficient |
| License/corpus/support | All Phase 3 requirements | Deployment/license disposition before release; permissioned digital/scan strata and independent gold annotations; raw recognition, correction completeness AND effort, source precision/coverage, failures/abstentions, and published measured subset |
| Timeline replay | SCORE-04 | Confirmed section/part/range/version replays rational rhythms with exact expected timing; unreviewed/unsupported/stale/foreign input is denied; prior guest fixture still works |

Before corpus evaluation, agree a correction-effort budget and record proposed thresholds. Confirmed fields must match gold completely, trust-gate bypasses must be zero, and all confirmed measures need verified source correspondence. Raw recognition and effort must be reported per stratum, including failed pages, without a fabricated universal accuracy promise. Eligible scan support requires representative measured scans, not rasterized originals alone.

## Validation Sign-Off

- [ ] Final per-task command/threat/dependency map matches executable plans.
- [ ] All new command targets have test-authoring dependencies and explicit failure signals.
- [ ] Sampling continuity and bounded feedback checks pass.
- [ ] Package/editor/XML/source-map feasibility gates pass with actual evidence.
- [ ] Portable regression and required actual browser/OMR/cloud/corpus checks pass.
- [ ] License, corpus permission, support contract and privacy/deployment prerequisites are resolved.
- [ ] Set nyquist_compliant true only after execution and all required exit checks pass.

**Approval:** pending execution; no Phase 3 requirement is complete.
