---
phase: "01"
slug: "verified-example-practice"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-25"
updated: "2026-09-28"
---

# Phase 01 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node:test` |
| Quick run | `npm.cmd test` |
| Full verification | `npm.cmd test` plus recorded Chrome/device acceptance in `01-03-ACCEPTANCE.md` |
| Automated result | 32 passed, 0 failed on 2026-09-28 UTC |

## Requirement Coverage

| Requirement | Plan | Automated evidence | Status |
|-------------|------|--------------------|--------|
| PRAC-01 | 01-01 | `tests/fixture.test.cjs`, `tests/page-startup.test.cjs`, `tests/practice-tracer.test.cjs` | Covered |
| PRAC-02 | 01-01 | `tests/timeline.test.cjs`, `tests/practice-tracer.test.cjs` | Covered |
| PRAC-03 | 01-02 | `tests/audio-session.test.cjs`, `tests/practice-tracer.test.cjs` | Covered |
| PRAC-04 | 01-02 | `tests/replay.test.cjs`, `tests/timeline.test.cjs` | Covered |
| ACCESS-01 | 01-03 | `tests/accessibility-contract.test.cjs`, `tests/live-announcement.test.cjs`, `tests/page-startup.test.cjs` | Covered |

The tests exercise behavior as well as structure: permission races and cleanup, scheduled count-in transitions, fixture-clock position, ungraded uncertainty, recovery, startup rendering, and live-region text updates. No requirement-linked tests are skipped or generate their expected values from the system under test.

## Manual Browser and Device Evidence

`01-03-ACCEPTANCE.md` records the singer's Chrome checks for microphone permission, audible count-in, pickup/marker movement, stop/retry/recovery, keyboard focus and activation, non-color uncertainty text, narrow widths, and 200% zoom. Exact Chrome-selected audio endpoint names, reduced-motion emulation, and actual spoken screen reader output were not independently observed. These limits are carried into `01-VERIFICATION.md`.

## Validation Audit 2026-09-28

| Metric | Count |
|--------|-------|
| Phase requirements audited | 5 |
| Automated coverage gaps found | 0 |
| Resolved by existing tests | 5 |
| Escalated | 0 |

## Sign-Off

- [x] Every Phase 1 requirement has a relevant passing automated check.
- [x] Runtime audio and position transitions have behavioral tests.
- [x] Real-browser/device checks are recorded with their evidence limits.
- [x] `nyquist_compliant: true` reflects the scoped Phase 1 requirement map.

**Approval:** validated 2026-09-28 UTC.
