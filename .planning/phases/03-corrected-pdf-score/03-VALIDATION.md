---
phase: "03"
slug: "corrected-pdf-score"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-15"
---

# Phase 03 - Validation Strategy

This is the final planned validation contract, not executed evidence. Research and planning do not prove recognition accuracy, editor behavior, cloud privacy or source alignment. Status remains draft, nyquist_compliant=false and wave_0_complete=false until execution.

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

Final planned IDs/waves match 15 plans, 35 tasks and 12 waves. All entries are pending execution. Every automated element is followed by an observable fails_when. Host checks fail as blocked when setup is absent; they never green-skip. The model checkpoint moved intact from former 03-06-01 to 03-05-03 after concrete native/source evidence and before 03-06 persistence; 03-06-01/02 now own the private tracer/UI and 03-06-03 owns invitation plus existing auth-assertion updates.

| Task | Wave | Requirements | Threats | Automated command | Authoring dependency |
| --- | --- | --- | --- | --- | --- |
| 03-01-01 | 1 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-SC, T-03-DEP | `node --test tests/score-prerequisites.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-01-02 | 1 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-SC, T-03-DEP | `node scripts/check-score-prerequisites.mjs --stage packages` | 03-01-01 checker; model contract 03-04-02 for model gate |
| 03-01-03 | 1 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-SC, T-03-DEP | `node scripts/check-score-prerequisites.mjs --stage deployment` | 03-01-01 checker; model contract 03-04-02 for model gate |
| 03-02-01 | 1 | SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-RIGHTS, T-03-TRUST | `node scripts/create-score-fixtures.mjs --verify` | 03-02-01 generator |
| 03-02-02 | 1 | SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-RIGHTS, T-03-TRUST | `node scripts/create-score-fixtures.mjs --verify-protocol` | 03-02-01 generator |
| 03-02-03 | 1 | SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-RIGHTS, T-03-TRUST | `node scripts/create-score-fixtures.mjs --verify-design` | 03-02-01 generator |
| 03-03-01 | 2 | LIB-01, SCORE-01, SCORE-02, SCORE-03 | T-03-SC, T-03-XML, T-03-HARNESS | `node --test tests/score-dependencies.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-03-02 | 2 | LIB-01, SCORE-01, SCORE-02, SCORE-03 | T-03-SC, T-03-XML, T-03-HARNESS | `node --test tests/score-harness.test.cjs tests/score-gates.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-04-01 | 3 | SCORE-02, SCORE-03, SCORE-04 | T-03-CMD, T-03-BROWSER | `node scripts/verify-score-editor.mjs --stage editing` | 03-04-01 runner; current task expansion |
| 03-04-02 | 3 | SCORE-02, SCORE-03, SCORE-04 | T-03-CMD, T-03-BROWSER | `node --test tests/score-model.test.cjs tests/score-commands.test.cjs tests/score-editor-ui.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-05-01 | 4 | LIB-01, SCORE-01, SCORE-02 | T-03-WORKER, T-03-XML, T-03-SOURCE, T-03-MODEL | `node scripts/verify-score-recognition.mjs --stage tracer` | current task; 03-03-02 host harness |
| 03-05-02 | 4 | LIB-01, SCORE-01, SCORE-02 | T-03-WORKER, T-03-XML, T-03-SOURCE, T-03-MODEL | `node --test tests/recognition-import.test.cjs tests/score-source-map.test.cjs tests/recognition-worker.test.cjs tests/recognition-security.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-05-03 | 4 | LIB-01, SCORE-01, SCORE-02 | T-03-MODEL | `node scripts/check-score-prerequisites.mjs --stage model` | 03-01-01 checker; 03-04-02 concrete model/editor evidence and 03-05-01/02 actual native/source evidence before approval |
| 03-06-01 | 5 | LIB-01, SCORE-01, SCORE-02 | T-03-OWNER, T-03-UPLOAD, T-03-DB, T-03-CLOUD | `node --test tests/score-library.test.cjs` | current task test targets; 03-03-02 harness; blocking 03-05-03 current model approval |
| 03-06-02 | 5 | LIB-01, SCORE-01, SCORE-02 | T-03-OWNER, T-03-UPLOAD, T-03-DB, T-03-CLOUD | `node scripts/verify-score-cloud.mjs --stage upload` | 03-03-02 runner; current task expansion after 03-06-01 |
| 03-06-03 | 5 | LIB-01, SCORE-01, SCORE-02 | T-03-OWNER, T-03-CLOUD | `node --test tests/auth-ui.test.cjs` | existing test target; current task updates invitation/workspace assertions only after 03-06-01/02 implements the real private flow |
| 03-07-01 | 6 | LIB-01, SCORE-01, SCORE-02 | T-03-JOB, T-03-WORKER, T-03-OWNER | `node --test tests/recognition-jobs.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-07-02 | 6 | LIB-01, SCORE-01, SCORE-02 | T-03-JOB, T-03-WORKER, T-03-OWNER | `node --test tests/score-library-ui.test.cjs tests/recognition-jobs.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-08-01 | 6 | SCORE-01, SCORE-02, SCORE-03 | T-03-SOURCE, T-03-BROWSER, T-03-XML | `node --test tests/recognition-import.test.cjs tests/score-source-map.test.cjs tests/score-model.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-08-02 | 6 | SCORE-01, SCORE-02, SCORE-03 | T-03-SOURCE, T-03-BROWSER, T-03-XML | `node scripts/verify-score-editor.mjs --stage source` | 03-04-01 runner; current task expansion |
| 03-09-01 | 7 | SCORE-03, SCORE-04 | T-03-CMD, T-03-TRUST | `node --test tests/score-commands.test.cjs tests/score-model.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-09-02 | 7 | SCORE-03, SCORE-04 | T-03-CMD, T-03-TRUST | `node scripts/verify-score-editor.mjs --stage complete-editing` | 03-04-01 runner; current task expansion |
| 03-10-01 | 8 | SCORE-02, SCORE-04 | T-03-REV, T-03-OWNER, T-03-TRUST | `node --test tests/score-revisions.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-10-02 | 8 | SCORE-02, SCORE-04 | T-03-REV, T-03-OWNER, T-03-TRUST | `node scripts/verify-score-editor.mjs --stage save-review` | 03-04-01 runner; current task expansion |
| 03-11-01 | 9 | SCORE-04, SCORE-02 | T-03-CONFIRM, T-03-OWNER, T-03-REV | `node --test tests/score-confirmation.test.cjs tests/score-revisions.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-11-02 | 9 | SCORE-04, SCORE-02 | T-03-CONFIRM, T-03-OWNER, T-03-REV | `node scripts/verify-score-editor.mjs --stage confirmation` | 03-04-01 runner; current task expansion |
| 03-12-01 | 10 | SCORE-04, SCORE-03 | T-03-TIMELINE, T-03-TRUST, T-03-OWNER | `node --test tests/score-timeline.test.cjs tests/score-confirmation.test.cjs tests/timeline.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-12-02 | 10 | SCORE-04, SCORE-03 | T-03-TIMELINE, T-03-TRUST, T-03-OWNER | `node scripts/verify-score-practice.mjs --stage confirmed-and-guest` | current task; 03-03-02 browser harness |
| 03-13-01 | 10 | LIB-01, SCORE-02, SCORE-04 | T-03-SESSION, T-03-RETENTION, T-03-CLEANUP | `node --test tests/score-session-ui.test.cjs tests/auth-ui.test.cjs tests/session-security.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-13-02 | 10 | LIB-01, SCORE-02, SCORE-04 | T-03-SESSION, T-03-RETENTION, T-03-CLEANUP | `node --test tests/score-cleanup.test.cjs tests/recognition-jobs.test.cjs tests/score-library.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-14-01 | 11 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-TRUST, T-03-RIGHTS, T-03-SOURCE | `node --test tests/score-corpus.test.cjs` | current task test targets; 03-03-02 harness where used |
| 03-14-02 | 11 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-TRUST, T-03-RIGHTS, T-03-SOURCE | `node scripts/evaluate-score-corpus.mjs --verify-gold` | 03-14-01 evaluator |
| 03-14-03 | 11 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-TRUST, T-03-RIGHTS, T-03-SOURCE | `node scripts/evaluate-score-corpus.mjs --verify-completed-report` | 03-14-01 evaluator |
| 03-15-01 | 12 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-ACCEPT, T-03-CLOUD, T-03-DEP | `node scripts/verify-score-cloud.mjs --stage complete` | 03-03-02 runner; current task expansion |
| 03-15-02 | 12 | LIB-01, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | T-03-ACCEPT, T-03-CLOUD, T-03-DEP | `node --test tests/score-phase-gates.test.cjs` | current task test targets; 03-03-02 harness where used |

At each wave run `npm.cmd test` once. Reuse existing focused auth/ownership commands where applicable: `node --test tests/harness.test.cjs`, `node --test tests/auth-flow.test.cjs`, `node --test tests/ownership.test.cjs tests/session-security.test.cjs`, `node --test tests/auth-ui.test.cjs`. No product tests/builds ran during planning.

Portable checks use Node's existing runner. Host-dependent editor/native/cloud/corpus checks remain outside npm test and record measured duration, exact hashes and sanitized evidence. Native/corpus batches use approved time/resource ceilings; missing actual evidence blocks acceptance.

Final actual gates: `node scripts/verify-score-editor.mjs --stage complete`; `node scripts/verify-score-recognition.mjs --stage tracer`; `node scripts/verify-score-cloud.mjs --stage complete`; `node scripts/verify-score-practice.mjs --stage confirmed-and-guest`; `node scripts/evaluate-score-corpus.mjs --verify-completed-report`; `node C:/Users/casti/.codex/gsd-core/bin/gsd-tools.cjs check api-coverage.verify-pre .planning/phases/03-corrected-pdf-score`.

All SQLite schema writers (03-06-01/03-07-01/03-10-01/03-11-01) must run actual empty/prior-schema migrations, inspect live FK/index/records, restart and round-trip writes. No ORM/type/build-only check closes this gate. Initial persistence also requires the blocking 03-05-03 approval of already-produced editor/native/model evidence.

Spec-less accounting: 7 explicit edges, 2 flagged unclassified assumptions and 2 descriptor-less flagged-unverified prohibitions; see 03-PLANNING-AUDIT.md. ASVS L1; unresolved high/critical findings block.

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
| Invitation/workspace integration | LIB-01, CONTEXT Integration Points | 03-06-03 updates index.html and existing auth-ui assertions in the upload wave after the real private flow; 03-15-01 verifies actual signup/My space/private-upload navigation, retained guest access, quiet once-after-attempt visibility and signed-in account behavior |

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
