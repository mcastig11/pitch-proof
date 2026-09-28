---
status: resolved
trigger: "check microphone does not work?"
created: 2026-09-26
updated: 2026-09-26
---

## Symptoms

- Expected: Check microphone requests access and updates the status.
- Actual: The button does nothing; the example score remains at "Loading example score…".
- Reproduction: Open `http://localhost:8000/` in Chrome and click Check microphone.
- Console: `script.js:362 Uncaught TypeError: Cannot read properties of undefined (reading 'addEventListener')`.

## Current Focus

- hypothesis: `ui` stores DOM elements under kebab-case IDs, while consumers read camelCase properties.
- test: Add a startup test that evaluates `script.js` with a minimal DOM and confirms button handlers attach.
- expecting: The test fails before the mapping fix and passes afterward.
- next_action: Complete.

## Evidence

- timestamp: 2026-09-26
  observation: `script.js:362` calls `ui.micButton.addEventListener`, but `Object.fromEntries` creates a `mic-button` key.

## Eliminated

- hypothesis: The local server is missing script assets.
  reason: All three JavaScript URLs return HTTP 200 with `application/javascript`.

## Resolution

- root_cause: DOM references were stored under kebab-case IDs but read as camelCase properties, causing startup to throw at `ui.micButton.addEventListener`.
- fix: Convert ID keys to camelCase when building the `ui` map.
- verification: The new startup test fails with the reported Chrome error before the fix and passes after it. `npm.cmd test` passes all 30 tests. User confirmed the score loads and the microphone check works after a hard refresh.
- files_changed: `script.js`, `tests/page-startup.test.cjs`
