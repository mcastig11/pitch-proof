---
phase: 02-private-practice-access
reviewed: 2026-10-15
depth: standard
files_reviewed: 24
files_reviewed_list:
  - README.md
  - auth.html
  - client/auth.js
  - client/workspace.js
  - index.html
  - package.json
  - script.js
  - server/app.mjs
  - server/auth.mjs
  - server/db.mjs
  - server/email.mjs
  - server/index.mjs
  - server/owner-resources.mjs
  - tests/auth-flow.test.cjs
  - tests/auth-ui.test.cjs
  - tests/email-transport.test.cjs
  - tests/harness.test.cjs
  - tests/ownership.test.cjs
  - tests/session-security.test.cjs
  - tests/support/browser-harness.cjs
  - tests/support/capture-email.cjs
  - tests/support/server-fixture.cjs
  - welcome.html
  - workspace.html
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
resolved_findings: 3
status: clean
---

# Phase 2: Code Review Report

## Summary

Reviewed account server, owner predicates, email boundaries, account forms, workspace lifecycle, test helpers and the phase's public-practice modifications. Scope is the 24 source/documentation files changed since the parent of phase context commit 00cc459; lockfiles and planning artifacts are excluded. Existing practice code was reviewed at its changed integration points. Review ran inline under the skills' Codex no-automatic-spawn fallback; no independent reviewer lane or structural analyzer was run.

The final source has no unresolved correctness/security finding in this scope. Tests establish server behavior and DOM transitions, not physical microphone, rendered layout, speech, inbox delivery or browser restart behavior.

## Narrative Findings (AI reviewer)

Three findings were resolved in local commit **0a97574**:

1. **WR-01 — URL-controlled success states and inherited object properties.** `client/auth.js`, initial mode selection near the file end, formerly allowed every definitions key from the URL. `?mode=verified` displayed Email confirmed without proof; inherited object keys could crash state rendering. Entry modes now use an explicit allowlist. Completion states require a server response in this lifecycle. The new URL-mode test failed intentionally on the fabricated confirmation before the fix and now passes for success and inherited-property inputs. This defect never bypassed server authorization.
2. **WR-02 — Error focus was overwritten or unavailable.** `client/auth.js`, submit's finally block, formerly restored the submit button after moving focus to the error summary. It now retains explicit error-summary focus. `workspace.html`, account-status paragraph, now has tabindex=-1 so the sign-out error focus destination is focusable. The new submitted-credential-error test checks final focus, cleared password and re-enabled submit.
3. **IN-01 — Muted status CSS overrode error color.** `auth.html` and `workspace.html`, inline `.muted`/`.error` declarations, previously gave muted text the later equal-specificity rule. The error rule now follows muted, retaining explicit error text and the prescribed error color. This did not affect authorization.

## Validation

- Account UI focused suite: **22 passed**, 0 failed/skipped/TODO.
- Final bounded gate: `gsd-tools.cjs run-with-timeout 120 -- npm.cmd test`: **96 passed**, 0 failed/cancelled/skipped/TODO, exit 0, **12,788ms**.
- Owner/session focused suite before the UI corrections: **19 passed**, no skipped or TODO cases; all remain covered by the final full run.
- Browser scripts pass `node --check`; whitespace check passes.
- Disabled-test/stub scan found no active TODO/skip in requirement-linked tests and no unfinished production handler. The browser-storage keyword hit is the negative assertion that forbids storage.
- Schema and UI gates pass. Codebase drift remains an explicitly nonblocking `warn` directive with no mapper dispatch requested. The older codebase maps are not used as source-of-truth implementation evidence.

## Limits

No GitHub push, merge, deployment, new dependency installation or live mail occurred. Real-device, browser persistence, HTTPS and accessibility acceptance is recorded in 02-UAT.md. This review does not certify production deployment configuration or substitute for that acceptance.
