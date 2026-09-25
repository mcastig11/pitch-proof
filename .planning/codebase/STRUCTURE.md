---
last_mapped_commit: 4704def55b2998953def280accaf6b2fa55b0fcb
last_mapped_at: 2026-09-24
---
# Codebase Structure

**Analysis Date:** 2026-09-24

## Directory Layout

```text
pitch-proof/
├── index.html          # Complete browser UI, inline CSS, and script entry
├── script.js           # Client runtime, audio analysis, recording, AI feedback
├── package.json        # Minimal npm metadata and pitchy dependency declaration
├── package-lock.json   # npm lockfile
├── README.md           # Product, setup, and security notes
├── .gitignore          # Ignored files
└── .planning/          # GSD planning artifacts
    └── codebase/       # Generated architecture/quality/stack maps
```

## Directory Purposes

**Project root:**

- Purpose: Contains the entire deployable static application.
- Contains: `index.html`, `script.js`, package metadata, and documentation.
- Key files: `index.html`, `script.js`, `README.md`.

**`.planning/`:**

- Purpose: Planning and codebase-analysis artifacts consumed by GSD workflows.
- Contains: `codebase/` documents and future phase planning directories.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.

**`node_modules/` (if installed):**

- Purpose: npm-installed dependencies.
- Contains: Packages resolved from `package-lock.json`.
- Generated: Yes; do not add application source here.

## Key File Locations

**Entry Points:**

- `index.html`: Browser document entry, complete UI shell, inline styles, and `<script src="script.js">`.
- `script.js`: Runtime entry executed after the DOM has been parsed; binds event listeners immediately.

**Configuration:**

- `package.json`: npm metadata, CommonJS package setting, and the only declared dependency (`pitchy`).
- `README.md`: Local server setup instructions and API-key configuration guidance.
- `.gitignore`: Repository ignore rules.

**Core Logic:**

- `script.js`: `detectPitch` and `freqToNote` implement pitch processing; `startRecording`/`stopRecording` own capture; `drawLoop` owns live updates; `getAIFeedback` owns summarization and API access.
- `index.html`: All visual structure and CSS selectors consumed by `script.js`.

**Testing:**

- No test directory or test files are present.
- `package.json` contains a placeholder `npm test` script that exits with an error.

## Naming Conventions

**Files:**

- Root files use lowercase names with conventional extensions: `index.html`, `script.js`, `package.json`, `README.md`.
- Planning documents use uppercase names: `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/STRUCTURE.md`.

**Directories:**

- Current application has no source subdirectories; planning uses lowercase `.planning/codebase`.
- Keep future feature directories purpose-based and shallow; align new code with an explicit separation such as `src/audio`, `src/ui`, or `src/services` if the application is modularized.

**JavaScript symbols:**

- DOM references and state use descriptive camelCase (`recordBtn`, `pitchLog`, `lastRecordingURL`).
- Constants use uppercase names for fixed domain values (`NOTE_NAMES`); functions use camelCase (`detectPitch`, `updateCentsMeter`).

## Where to Add New Code

**New feature (current structure):**

- Primary code: Add the smallest cohesive implementation to `script.js`, alongside the relevant lifecycle or UI handler.
- Markup/styles: Add controls and presentation to `index.html`, preserving the existing IDs/classes used by `script.js`.
- Tests: No established location; create a test setup and a dedicated test directory before adding meaningful automated coverage.

**New component/module:**

- Current implementation has no component system. For a larger feature, introduce a `src/` tree and move cohesive logic out of `script.js` incrementally, keeping `index.html` as the page shell.

**Utilities:**

- Small pure helpers currently belong near the related logic in `script.js` (`freqToNote`, `detectPitch`). If helpers multiply or require independent tests, place them in a focused module such as `src/audio/pitch.js`.

**External integrations:**

- The current integration lives in `script.js` (`getAIFeedback`). New network integrations should be isolated behind a service module or server endpoint rather than adding more direct `fetch` calls to the render loop.

## Special Directories

**`.planning/codebase/`:**

- Purpose: Generated repository maps for planning and execution.
- Generated: Yes.
- Committed: Intended as planning artifacts; follow the orchestrator's repository policy.

**`node_modules/`:**

- Purpose: Installed npm packages.
- Generated: Yes.
- Committed: No; generated from `package-lock.json`.

---

*Structure analysis: 2026-09-24*
