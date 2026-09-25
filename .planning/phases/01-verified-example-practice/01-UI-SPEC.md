---
phase: "1"
slug: "verified-example-practice"
status: approved
shadcn_initialized: false
preset: none
created: "2026-09-24"
reviewed_at: "2026-09-25"
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the manually verified example practice slice. Phase 1 observations are provisional; measured per-note grades belong to Phase 4.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | none; use text labels, with optional decorative inline SVG |
| Font | system sans-serif for interface text; score notation uses the score renderer's music glyphs |

The repository has a static `index.html` with inline CSS and `script.js`, no React, Next.js, Vite, `components.json`, or installed UI library. The existing prototype establishes browser capabilities, not a design system or visual constraint. Use native HTML controls for the measure selector and transport; keep score status in DOM text as well as notation graphics. Source: `AGENTS.md`, `PROJECT.md`, and repository inspection. The shadcn initialization gate does not apply to this stack.

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon and label gaps |
| sm | 8px | Inline controls and compact status gaps |
| md | 16px | Control groups and card interiors |
| lg | 24px | Section padding and adjacent cards |
| xl | 32px | Main column gap and section breaks |
| 2xl | 48px | Major vertical separation |
| 3xl | 64px | Maximum page-level separation |

Exceptions: none. Use at least 44px height and width for primary touch targets; 44px is on the four-pixel grid. Desktop content has a 1200px maximum width, 32px side padding; below 960px use 24px side padding; below 600px use 16px. These are Phase 1 defaults because upstream artifacts do not prescribe spacing.

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Label / metadata | 14px | 600 | 1.4 |
| Body / control | 16px | 400 | 1.5 |
| Section heading / live status | 20px | 600 | 1.2 |
| Page heading | 28px | 600 | 1.2 |

Exactly four interface sizes and two weights are declared. Score glyph sizing follows notation readability and is not an interface text size. Use sentence case; avoid all-caps status text. These are Phase 1 defaults.

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FCFBF8` | Page background and broad score surround |
| Secondary (30%) | `#EAF0EF` | Configuration panel, observation panel, status strip, and transport surround |
| Accent (10%) | `#135E63` | Primary Start/Resume button, visible keyboard focus ring, active measure outline, and current score-position marker only |
| Destructive | `#A32929` | Reserved for future destructive actions; unused in Phase 1 |

Accent reserved for: primary Start/Resume button, keyboard focus ring, active measure outline, and current score-position marker. Use `#17292B` for primary text, `#506063` for secondary text, `#FFFFFF` for score paper, and `#AAB9BA` for borders. Status words and shapes carry meaning: color never distinguishes correct/incorrect pitch or timing. An error may use `#A32929` text with an explicit error heading; it is not a per-note grade. These are Phase 1 palette defaults.

## Copywriting Contract

| Element | Copy |
|---------|------|
| Page heading | Practice the example score |
| Scope note | This verified example lets you try score-guided practice. Pitch and timing observations are provisional, not grades. |
| Primary CTA | Start practice |
| Microphone CTA | Check microphone |
| Microphone ready | Microphone ready. Sing a note to check the input level. |
| Microphone denied error | Microphone access is off. Allow access in your browser, then choose Try microphone again. |
| Microphone unavailable error | No microphone input was found. Connect a microphone, then choose Try microphone again. |
| Microphone retry | Try microphone again |
| Count-in | Count-in: {beat} of {beats}. Start at measure {measure}. |
| Following status | Following score: measure {measure}, beat {beat}. |
| Expected rest | Rest in the score — listening for the next entrance. |
| Provisional observation label | Live observations · not graded |
| Pitch observation | Pitch heard: {note} / Listening for a sung note |
| Timing observation | Onset heard near beat {beat} / No onset detected yet |
| Tracking loss | Position uncertain. This passage is ungraded. Choose a measure to resume. |
| Last confident position | Last confirmed position: measure {measure}. Current position unknown. |
| Recovery CTA | Resume with count-in |
| Stop CTA | Stop practice |
| Retry CTA | Retry attempt |
| Completed | Attempt ended. You can retry from measure {measure}. No grades were saved. |
| Empty state heading | Example score unavailable |
| Empty state body | The verified example could not be opened. Reload the example to practice. |
| Empty state CTA | Reload example |
| General error state | Practice could not continue. Check your microphone and audio output, then choose Try again. |
| Destructive confirmation | None in Phase 1. Stop and retry act on an unsaved, provisional attempt and need no confirmation dialog. |

Dynamic values come from the verified fixture and actual session state; do not invent a title, measure count, meter, part name, or tempo. Use the fixture's numbering for a pickup (for example, `Pickup` rather than a fabricated measure number). Source: `ROADMAP.md` Phase 1, `REQUIREMENTS.md` PRAC-01–04 and ACCESS-01; all literal copy is a Phase 1 default.

## Layout and Visual Hierarchy

1. Header: product name and one concise `Example practice` context label. No History, PDF upload, account, recording, or AI coach entry point in this phase.
2. Preparation panel: verified example title, selected vocal part, read-only tempo and meter, and a native `Starting measure` selector. Display the fixture's valid measures, including a pickup if present. The one available vocal part is visibly selected in a labeled native selector; the singer can inspect it even when it is the only option. Tempo is shown as `{bpm} BPM`, not editable in Phase 1.
3. Score region: the visual center of the page, on white paper. Render clef, key signature, time signature, notes, rests, barlines, and measure labels from the verified score. Use a narrow vertical position marker and an outline around the current measure; never use pitch-grade colors or a graded note badge. Keep the next measure visible where space permits. Provide a text position line immediately above the score.
4. Session rail: microphone readiness, metronome/count-in status, tracking status, and the `Live observations · not graded` panel. Show pitch heard and onset timing only when detected; otherwise show the documented listening/no-onset text. Do not show sharp/flat/in-tune or early/late/on-time labels, cents scores, accuracy percentages, or a saved result.
5. Transport: Check microphone, Start practice, Stop practice, and Retry attempt according to session state. The active primary action is visually dominant; secondary controls use neutral outlines. A dedicated `Starting measure` selector remains available for recovery.

At 960px and wider, use a two-column grid: score at 2fr, session rail at 1fr, with a 32px gap. The preparation panel spans both columns. Below 960px, stack preparation, score, session rail, and transport in that order. At narrow widths the notation region may scroll horizontally inside its labeled container; the page itself must not overflow horizontally. Keep the position text and transport visible without relying on the score graphic. On session start or recovery, scroll the selected measure into view without moving keyboard focus. If the notation is wider than its frame, provide visible scroll affordance and preserve barline/measure context.

## Interaction Contract

| State / event | Visible behavior | Available action and transition |
|---------------|------------------|---------------------------------|
| Example loading | Score region shows `Loading example score…`; setup and Start are disabled. | On success, show verified fixture and valid measures; on failure, show the empty state and Reload example. |
| Ready, microphone unchecked | Score and selected part/tempo/measure are visible. Status reads `Microphone not checked`. | Check microphone requests browser permission and shows live input presence; it does not begin the attempt. |
| Microphone ready | Input status reads `Microphone ready`; show a simple activity indicator plus text `Input detected` or `Waiting for sound`. Do not route the user's mic back to speakers. | Start practice becomes available. |
| Start practice | Lock the chosen start measure for this attempt; show the selected measure and a full-bar count-in aligned to its meter and tempo. The metronome is audible; count-in beats are also numbered on screen. | After count-in, enter Following state. Stop practice is available during count-in. |
| Following | Keep current measure and beat in text and in the score marker. Show provisional heard pitch and onset beat without judging written notes. During scored rests or silence, show the expected-rest/listening state without inventing a missed note. | Stop practice ends the attempt; tracker confidence loss enters Position uncertain. |
| Position uncertain | Freeze the last confident marker as `last confirmed`; remove any current-position claim. The status strip says the passage is ungraded and live observations do not attach to score notes. | Choose a valid measure, then Resume with count-in. The attempt remains open and the app does not reload. |
| Recovery count-in | Show the newly chosen measure, restart the metronome count-in from that measure, and clear stale provisional observations. | When count-in finishes and position is established, return to Following. If uncertainty persists, remain ungraded and offer recovery again. |
| Stopped or fixture end | Stop mic capture and metronome, show `Attempt ended` and the original start measure. No grade summary, history card, recording download, or AI response appears. | Retry attempt rechecks mic availability and runs count-in from the chosen start measure. |
| Permission/device failure | Show the specific microphone error adjacent to the mic control; preserve score and measure selection. | Try microphone again; Start stays unavailable until ready. |

The metronome click and visual count-in use the fixture's fixed tempo and meter. At a pickup, the score and beat labels must reflect the verified fixture's pickup timing; do not silently renumber it as a full measure. Wrong pitch, octave ambiguity, silence, and score-following uncertainty must never turn into an authoritative wrong-note grade in this phase. If audio cannot be classified, show `Listening for a sung note` and keep tracking confidence separate from pitch detection. Source: `ROADMAP.md` Phase 1 success criteria and exit gate; transition details are Phase 1 defaults.

## Accessibility and Feedback

- Use native buttons and a native labeled measure selector in DOM order matching visual order. All controls work with Tab, Shift+Tab, Enter, Space, and arrow keys where the native selector provides them. Show an accent focus ring at least 2px thick with 2px offset. Do not trap focus in the score.
- Provide an accessible score summary such as `Example score, selected Voice part, {measureCount} measures, {tempo} BPM`, plus measure labels and the separate live position text. Canvas or SVG notation alone cannot be the sole source of score position.
- Announce state changes through a polite live region: microphone ready/error, count-in start, practice start/stop, position uncertain, and recovery complete. Do not announce every animation frame, pitch sample, or metronome beat. Keep count-in beat numbers visible for users who cannot hear the click.
- Give the metronome a visible beat number and a shape/weight pulse; never rely on color or sound alone. Respect reduced-motion preference by removing pulsing animation while retaining the changing beat number.
- Position, confidence, and provisional observations always have explicit text. A lost position is labeled `Position uncertain` and `ungraded`; it is distinct from an expected rest, a quiet microphone, and a confidently followed position.
- Keep controls at least 44×44px, body text at least 16px, and secondary text at least 14px. Maintain readable contrast for text, score notation, and focus indication. Verify these in the browser at 320px, 600px, and desktop widths and at 200% zoom.

## UI Considerations

> Shape-rooted state coverage confirmed by the user on 2026-09-25. The probe classified six surfaces; mixed-kind overrides add score media, preparation metadata, microphone media, and metronome status. Empty/error wording remains in the Copywriting Contract above.

Applicable considerations: 28 resolved (explicit), 0 backstop, 0 unresolved.

| ID | Surface | Confirmed kinds |
|----|---------|-----------------|
| E1 | Example score viewport and measures | list-collection, static-content, media |
| E2 | Part/start-measure preparation and tempo/meter | form, static-content |
| E3 | Microphone input and check control | form, interactive-control, media |
| E4 | Transport, metronome, and count-in | interactive-control, static-content |
| E5 | Position and provisional-observation status | static-content |
| E6 | Product and example-practice header | static-content |

Every row below is `resolved` with `verification: explicit`; each statement is a visible acceptance truth, not a fallback suggestion.

| ID | Category | Explicit state truth |
|----|----------|----------------------|
| E1 | empty | If the example score is absent, show the documented Example score unavailable state and Reload example; no attempt can start. |
| E1 | loading | While the example loads, show `Loading example score…` in the score region and disable setup and Start. |
| E1 | error | If fixture loading fails, show the documented unavailable message and reload action, without presenting a playable score. |
| E1 | populated | A valid fixture shows notation, rests, barlines, measure labels, an accessible score summary, and the current-position text and marker. |
| E1 | partial | Missing essential notation or timing prevents Start and uses the unavailable state; no measure or beat is invented. |
| E1 | overflow | Wide notation scrolls only inside its labeled score frame; the page does not scroll horizontally and measure context remains visible. |
| E1 | zero-one-many | Zero valid measures blocks Start; one remains labeled and selectable; many retain verified fixture order and Pickup labeling. |
| E1 | long-text | A long score title and accessible summary wrap without clipping; notation retains readable measure context. |
| E2 | empty | With no valid part or starting measure, selectors have no fabricated option and Start remains disabled. |
| E2 | loading | Part and measure selectors remain labeled but disabled until the verified fixture and its tempo/meter load. |
| E2 | error | Invalid or unavailable fixture metadata shows the documented unavailable state and Reload example; Start remains disabled. |
| E2 | partial | Missing part, measure, tempo, or meter is not guessed; setup stays incomplete and Start stays disabled. |
| E2 | overflow | At 320px width and 200% zoom, selector labels and tempo/meter details reflow without clipping or page overflow. |
| E2 | long-text | Long fixture and part names remain readable through wrapping or adjacent full-text labeling; the chosen option stays identifiable. |
| E3 | empty | No microphone device shows the documented unavailable-device error and retry action; Start remains disabled. |
| E3 | loading | A permission request shows `Checking microphone…`; duplicate requests are disabled while score access remains available. |
| E3 | error | Denied access and device failure show their specific documented messages next to the mic control and offer Try microphone again. |
| E3 | populated | Granted input shows Microphone ready and either Input detected or Waiting for sound; mic audio is never played through speakers. |
| E3 | partial | Permission granted without detected sound remains Waiting for sound, not a false pitch or a device error. |
| E3 | long-text | Long permission or device messages wrap in the mic panel while the retry control remains visible and operable. |
| E4 | loading | During count-in, show the changing beat number and selected measure, prevent duplicate Start, and keep Stop available. |
| E4 | error | Metronome or audio-output failure stops the attempt, shows the documented general error and Try again, and leaves measure selection available. |
| E4 | overflow | Transport controls stack or wrap on narrow screens; count-in status remains visible without horizontal page overflow. |
| E4 | long-text | Transport labels remain complete as controls grow vertically, with at least 44px touch targets. |
| E5 | overflow | Position, uncertainty, and observation text wraps inside its panel without obscuring the score or controls. |
| E5 | long-text | Longer status text wraps; `Position uncertain` and `ungraded` are never truncated or replaced by color alone. |
| E6 | overflow | The header reflows at 320px width and 200% zoom without horizontal page overflow. |
| E6 | long-text | Product and context labels wrap rather than using an ellipsis that hides their meaning. |

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None | None | Not applicable: no shadcn initialization or third-party blocks. |

## Decision Provenance and Phase Boundary

| Source | Contract decisions carried forward |
|--------|------------------------------------|
| `REQUIREMENTS.md` | Starting measure/part/tempo review, metronome/count-in, microphone readiness, transport, position recovery, keyboard and non-color operation. |
| `ROADMAP.md` | Verified example only; provisional observations; ungraded tracking loss; pickup, silence, wrong pitch, and octave ambiguity in the exit gate. |
| `PROJECT.md` and `AGENTS.md` | Browser experience, single singer/part, confidence-aware feedback, prototype redesign permitted, no browser-exposed service secrets. |
| Repository inspection | Vanilla HTML/CSS/JS and no component library; existing Inter styling and pitch-meter layout are not binding. |
| Phase 1 defaults | Exact palette, spacing, typography, layout breakpoints, literal copy, one-bar recovery count-in, and state presentation. |

PDF upload/correction, accounts, authoritative per-note pitch/timing grades, attempt history, retained recordings, tempo adjustment, and phrase loops are outside this phase. The interface does not imply those features are available. The current prototype's automatic recording download and AI coach are not part of this contract.

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS

**Approval:** user-approved UI states and element kinds, 2026-09-25; checker 7/7 PASS.
