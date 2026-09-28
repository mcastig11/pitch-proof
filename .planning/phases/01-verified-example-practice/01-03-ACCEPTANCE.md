# Plan 01-03 browser acceptance (in progress)

Date: 2026-09-27

## Environment

- Browser: Google Chrome; installed executable reports version 152.0.7977.84. Running-browser version not separately confirmed.
- Page: `http://localhost:8000/`.
- Input: User reports the laptop microphone. Windows lists one present input endpoint, `Microphone Array (2- Intel® Smart Sound Technology for Digital Microphones)`; the exact Chrome-selected input is not confirmed.
- Output: User reports hearing count-in clicks. Windows lists one present output endpoint, `Speakers (15- Cirrus Logic XU (with APO Extensions))`; the exact Chrome-selected output is not confirmed.

## Results

| Check | Result | Evidence |
|---|---|---|
| Example score metadata loads | Pass | User confirmed after hard refresh following the DOM mapping fix. |
| Visible score and moving marker | Pass | After a hard refresh, the user confirmed the score is visible, notes are on the staff, and the marker moves from Pickup into Measure 1. The served `script.js` removes the SVG `hidden` attribute explicitly. |
| Check microphone by mouse | Pass | User confirmed the control works after hard refresh. |
| Count-in sound and live pitch/input observations | Pass | User confirmed both during practice. |
| Keyboard focus and activation | Pass | Chrome reported `#mic-button.disabled === false`. The score frame is a focus stop between the measure selector and microphone button. After using the second Tab, user confirmed the focused button activates with Space. On 2026-09-27, user confirmed Tab gives the score frame a visible outline. |
| Stop, retry, and lost-place recovery by keyboard | Pass | User completed start, lost-place recovery from a chosen measure, stop, and retry by keyboard, with working status messages. |
| Count-in cue boundary | Pass | User heard a distinct first click and confirmed clicks stop before singing with no extra cue. |
| Pickup, rest/silence, wrong pitch, octave ambiguity, and ungraded uncertainty in the browser | Pass | User confirmed the visible pickup and moving marker, then reported that silence through a rest, a deliberately different pitch, and a note an octave higher stayed under “Live observations · not graded,” with no grade or mark added to the score. User previously confirmed the explicit ungraded uncertainty message. Deterministic Node replay also passes. |
| 320px, 600px, desktop, and 200% zoom | Pass | User inspected these sizes in Chrome and reported no whole-page horizontal scrolling, clipped controls, or unreadable text. Sideways score-frame scrolling was allowed. |
| Explicit uncertainty state | Pass | After `I lost my place`, user copied: `Position uncertain. This passage is ungraded. Choose a measure to resume.` |
| Reduced motion and visible beat numbers | Pass for specified pulse/number behavior | User confirmed count-in numbers 1–4 are visible. CSS contains no pulsing animation in any motion mode and includes a `prefers-reduced-motion: reduce` rule. Browser emulation of the media preference was not performed. |
| Live-region semantics and transition updates | Pass with limitation | `#live-announcement` has `role="status"` and `aria-live="polite"`. The static contract test checks those semantics and absence of per-beat live regions. A DOM interaction test confirms microphone-ready and count-in-start changes reach this region and beat callbacks do not overwrite it. User reports no screen reader is available, so actual spoken announcements were not observed. |

## Automated checks

`npm.cmd test` passes 32/32 on 2026-09-27, including page-startup, visible SVG, audio lifecycle, replay, timeline, accessibility contract, and dynamic live-region transition tests.

## Next evidence needed

The score-frame focus outline is confirmed by the user. No screen reader was available, so the alternate check establishes the live-region semantics and actual text updates but cannot establish spoken output. The named Windows audio endpoints are recorded above; Chrome's exact selected endpoints remain unconfirmed. Browser emulation of reduced motion was not performed, although the page has no pulse animation and the count-in numbers were observed. Carry these limits into plan and phase verification without claiming direct assistive-technology observation.
