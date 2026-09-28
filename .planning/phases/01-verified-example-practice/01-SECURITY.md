---
phase: "01"
slug: "verified-example-practice"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-09-28"
register_authored_at_plan_time: true
---

# Phase 01 — Security

Security target: OWASP ASVS L1. The plan-time STRIDE register is consolidated below. The configured blocking threshold is `high`.

## Trust Boundaries

| Boundary | Data crossing | Verified behavior |
|----------|---------------|-------------------|
| Browser to microphone | Live voice samples | `getUserMedia` feeds a local analyser; teardown stops tracks. |
| Fixture to score UI | Labels, events, and measure IDs | Fixture validation rejects malformed data; UI uses text nodes and `textContent`. |
| Audio clock to score UI | Position and provisional observations | Clock uncertainty clears the current claim and observations until recovery. |
| Session status to accessibility tree | Status and pitch labels | One polite live region receives transitions without raw buffers or per-beat updates. |

## Threat Register

| ID | Category | Severity | Disposition | Evidence | Status |
|----|----------|----------|-------------|----------|--------|
| T-01-01 | Information disclosure: microphone session | High | Mitigate | `practice-audio.js` connects the media source only to an analyser. Only scheduled click gain reaches `context.destination`. No `fetch`, storage, `MediaRecorder`, or raw-buffer status path exists in Phase 1 source; `stop()` releases tracks. | Closed |
| T-01-02 | Denial of service: permission races | Medium | Mitigate | Generation and single-flight guards in `checkMicrophone`; `tests/audio-session.test.cjs` covers duplicate, stale, denied, and retried requests. | Closed |
| T-01-03 | Tampering: fixture and measure input | Medium | Mitigate | `validateFixture`, `getStartMeasures`, and recovery validation reject unknown measures; `script.js` renders fixture labels as text. Fixture and replay tests exercise rejection. | Closed |
| T-01-04 | Denial of service: audio lifecycle | Medium | Mitigate | `stopScheduled` cancels frames/clicks and `releaseGraph` disconnects nodes, stops tracks, and closes context; audio-session tests exercise repeated stop and failure cleanup. | Closed |
| T-01-05 | Tampering: false score certainty | Medium | Mitigate | Tracker separates fixture-clock position from pitch, clears current position on gaps/suspension/visibility/lost-place events, and rejects observations until recovery; replay tests cover these transitions. | Closed |
| T-01-06 | Denial of service: stranded recovery controls | Low | Accept | Plan 01-02 explicitly accepts this residual risk because malformed fixtures fail closed, valid measure choices remain available, and no persistent state is stranded. | Closed — accepted |
| T-01-08 | Denial of service: announcement chatter | Medium | Mitigate | `#live-announcement` changes on transitions; beat callbacks update separate non-live content. The live-announcement test exercises two beats without a status overwrite. | Closed |
| T-01-09 | Spoofing: color-only state | Medium | Mitigate | Persistent words identify position, uncertainty, and ungraded observations; neutral dashed cursor is supplementary. Accessibility tests and Chrome acceptance cover text and focus. | Closed |

## Accepted Risks Log

| Risk ID | Threat | Rationale | Accepted By | Date |
|---------|--------|-----------|-------------|------|
| R-01-01 | T-01-06 | Malformed in-memory fixtures are rejected; valid measure recovery is available and no persistent session state can be stranded. | Phase 01-02 plan decision | 2026-09-25 |

## Security Audit Trail

| Audit date | Threats total | Closed | Open at or above threshold | Run by |
|------------|---------------|--------|----------------------------|--------|
| 2026-09-28 | 8 | 8 | 0 | Inline GSD security audit |

## Sign-Off

- [x] Every plan-time threat has a disposition and evidence.
- [x] The accepted low-severity risk is documented.
- [x] `threats_open: 0` at the configured high-severity threshold.
- [x] `status: verified` in frontmatter.

**Approval:** verified 2026-09-28 UTC.
