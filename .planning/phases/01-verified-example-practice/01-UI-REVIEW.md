# Phase 1 — UI Review

**Audited:** 2026-09-28 UTC  
**Baseline:** `01-UI-SPEC.md`  
**Method:** Code and test review, supplemented by the singer's recorded Chrome acceptance. No new screenshot or screen reader session was available.

## Pillar Scores

| Pillar | Score | Finding |
|--------|-------|---------|
| Copywriting | 3/4 | Core state copy matches the contract; the expected-rest phrase is absent. |
| Visuals | 3/4 | Score, preparation, rail, and transport follow the declared hierarchy. |
| Color | 3/4 | The declared palette and non-color uncertainty text are present. |
| Typography | 3/4 | System type and the four declared UI sizes are used. |
| Spacing | 3/4 | Grid, padding, and breakpoints follow the declared scale. |
| Experience Design | 3/4 | Ready, error, count-in, following, uncertainty, recovery, and retry states are wired; one rest-specific cue is absent. |

**Overall: 18/24.** No task-blocking UI defect was confirmed in this pass. Scores are limited by code-only inspection and the absence of new screenshots.

## Priority Fixes

1. **Show the expected-rest cue** when the score is in its written rest (`01-UI-SPEC.md`, Copywriting and Following state). `script.js` currently keeps the generic listening text. This would help a singer distinguish a planned rest from an undetected voice input.
2. **Confirm actual spoken transition announcements** with a screen reader when one is available. The live-region semantics and text changes are tested, but speech output has not been observed.

## Detailed Findings

### Copywriting — 3/4

`index.html` and `script.js` use the specified page heading, provisional-observation label, primary actions, microphone errors, uncertainty text, and stop/retry text. The `Expected rest in the score` message from `01-UI-SPEC.md` has no corresponding branch in `script.js`; the score still draws its rest glyph.

### Visuals — 3/4

`index.html` places the score in the wider column, with preparation above and transport below. `script.js` draws staff, notes, rest, measure labels, and a narrow marker. The singer's Chrome acceptance confirms the score was visible and the marker moved; no screenshot was captured in this audit.

### Color — 3/4

The page uses the specified background, panel, accent, text, and border colors in inline CSS. The accent appears on the primary button, focus, active beat, and current position. Position uncertainty has words and a dashed marker, so it does not depend on color.

### Typography — 3/4

The interface uses system sans-serif and the specified 14px, 16px, 20px, and 28px sizes with regular and 600 weights. Text remains in sentence case.

### Spacing — 3/4

The 1200px page maximum, 32px/24px/16px side padding, 32px desktop grid gap, and 960px/600px reflow are implemented in `index.html`. Recorded Chrome checks at 320px, 600px, desktop, and 200% zoom found no whole-page overflow or clipped controls.

### Experience Design — 3/4

The controller guards start until microphone readiness, exposes device errors and retry, schedules count-in, shows current and uncertain position, and restores from a selected measure. `tests/live-announcement.test.cjs` confirms transition-only live-region updates. The missing rest-specific cue is the only confirmed UI-SPEC deviation; actual speech output remains an evidence limit.

## Files Audited

`index.html`, `script.js`, `practice-fixture.js`, `practice-audio.js`, Phase 1 UI spec, browser acceptance, and relevant tests.
