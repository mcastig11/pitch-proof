---
phase: "01"
slug: "verified-example-practice"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-25"
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node:test` (local Node 24.19.0; runtime compatibility not pinned) |
| **Config file** | None |
| **Quick run command** | `node --test tests/*.test.cjs` |
| **Full suite command** | `node --test tests/*.test.cjs` plus manual real-browser/device exit gate |
| **Estimated runtime** | Under 10 seconds for automated tests |

## Sampling Rate

- **After every task commit:** Run the narrow fixture, timeline, audio-session, or replay test related to the task.
- **After every plan wave:** Run `node --test tests/*.test.cjs`.
- **Before `$gsd-verify-work`:** Full suite must be green and required real-browser/device checks recorded.
- **Max feedback latency:** 10 seconds for automated feedback.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | PRAC-01 | T-01-03 | Reject malformed fixture metadata and unknown starts; render fixture labels as text | unit | `node --test tests/fixture.test.cjs` | ❌ W0 | ⏜ pending |
| 01-01-02 | 01 | 0 | PRAC-02 | — | Schedule click tones locally; do not transmit microphone data | unit/replay | `node --test tests/timeline.test.cjs` | ❌ W0 | ⏜ pending |
| 01-01-03 | 01 | 0 | PRAC-03 | T-01-01, T-01-02, T-01-04 | Release all tracks/resources on stop, errors, retry, and stale permission resolution | mocked lifecycle | `node --test tests/audio-session.test.cjs` | ❌ W0 | ⏜ pending |
| 01-01-04 | 01 | 0 | PRAC-04 | T-01-03 | Uncertain position is explicitly ungraded; never fabricate note association | deterministic replay | `node --test tests/replay.test.cjs` | ❌ W0 | ⏜ pending |
| 01-01-05 | 01 | 0 | ACCESS-01 | — | Native keyboard-operable controls, visible focus, persistent text status | manual accessibility smoke | Manual browser checklist | ❌ W0 | ⏜ pending |

## Wave 0 Requirements

- [ ] Add `tests/` and Node built-in test setup for fixture validation and timeline/pickup mapping.
- [ ] Add deterministic replay cases for pickup, silence/rest, wrong pitch, octave ambiguity, uncertainty, and recovery.
- [ ] Add an injectable/mockable audio-session boundary for permission races and track cleanup without microphone hardware.
- [ ] Add the proposed test script; current `npm test` is a failing placeholder.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Microphone readiness, count-in audio and cue stopping, retry, and live position in a real browser | PRAC-02, PRAC-03, PRAC-04 | Browser permissions, output-device timing, latency, and hardware input cannot be established by pure replay tests | On a named modern browser/device over localhost or HTTPS, grant microphone permission; try ready/start/count-in, confirm accented first beat and no click or extra cue after count-in, stop/retry, then replay pickup, rest, wrong-pitch, octave-ambiguity, and recovery cases. Record browser/device and results. |
| Keyboard operation, status announcements, narrow layout and zoom reflow | ACCESS-01 | Requires interactive browser and assistive-technology/layout inspection | Complete all controls by keyboard; confirm visible focus and text equivalents without color; inspect polite transition announcements, 320px/600px/desktop widths, and 200% zoom. Record results. |

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing automated references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter after validation

**Approval:** pending
