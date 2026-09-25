---
last_mapped_commit: 4704def55b2998953def280accaf6b2fa55b0fcb
last_mapped_at: 2026-09-24
---
# Technology Stack

**Analysis Date:** 2026-09-24

## Languages

**Primary:**

- JavaScript (browser, CommonJS package metadata) - all application behavior and audio/pitch processing in `script.js`
- HTML - page structure in `index.html`
- CSS - inline responsive UI styling in `index.html`

**Secondary:**

- Not detected

## Runtime

**Environment:**

- Modern browser with Web Audio, MediaRecorder, microphone permission, Canvas, Fetch, and Blob/Object URL support

**Package Manager:**

- npm
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**

- No application framework - static HTML page and vanilla JavaScript (`index.html`, `script.js`)

**Testing:**

- No test framework configured; `npm test` is an intentional placeholder that exits with an error (`package.json`)

**Build/Dev:**

- No bundler, transpiler, or dev server configured
- Development can use any static HTTP server; `README.md` documents `python -m http.server 8000`

## Key Dependencies

**Critical:**

- `pitchy` `^4.1.0` - declared in `package.json` and installed in the lockfile, but no import or usage is present; pitch detection is implemented locally in `script.js` via `detectPitch`

**Infrastructure:**

- None detected

## Configuration

**Environment:**

- No runtime configuration files or environment-variable loader detected
- Anthropic credentials are currently represented by the literal placeholder in `script.js`; `README.md` instructs manual replacement

**Build:**

- `package.json` contains package metadata and the placeholder test script
- `index.html` contains all page CSS and loads `script.js` directly

## Platform Requirements

**Development:**

- Serve over a local web server for reliable microphone permissions; browser must grant microphone access (`README.md`, `script.js`)

**Production:**

- Static web hosting capable of serving `index.html` and `script.js`
- HTTPS is required by browsers for microphone access outside localhost
- A secure server-side proxy is needed before exposing a real Anthropic API key; direct browser access is explicitly a demonstration setup (`README.md`)

---

*Stack analysis: 2026-09-24*
