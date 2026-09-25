---
last_mapped_commit: 4704def55b2998953def280accaf6b2fa55b0fcb
last_mapped_at: 2026-09-24
---
# External Integrations

**Analysis Date:** 2026-09-24

## APIs & External Services

**AI feedback:**

- Anthropic Messages API (`https://api.anthropic.com/v1/messages`) - receives an aggregated pitch summary and returns vocal-coach feedback (`script.js`)
  - SDK/Client: native browser `fetch`; no Anthropic SDK
  - Auth: `x-api-key` header, currently literal `YOUR_API_KEY_HERE` in `script.js`; `README.md` documents manual configuration
  - Model: `claude-sonnet-4-20250514`; request includes `anthropic-version: 2023-06-01` and direct-browser access opt-in header

**Fonts:**

- Google Fonts - loads Inter CSS from `fonts.googleapis.com` (`index.html`)
  - SDK/Client: stylesheet `<link>` and preconnect
  - Auth: none

## Data Storage

**Databases:**

- None detected; pitch samples exist only in the in-memory `pitchLog` array in `script.js`

**File Storage:**

- Local browser memory only: `MediaRecorder` chunks are combined into an in-memory WebM `Blob`; an object URL is used for playback and download (`script.js`)

**Caching:**

- None detected

## Authentication & Identity

**Auth Provider:**

- None
  - Implementation: no user accounts or identity layer; the Anthropic request relies on a client-side API key placeholder

## Monitoring & Observability

**Error Tracking:**

- None detected

**Logs:**

- Browser console only for microphone and API errors (`console.error` in `script.js`); user-facing status text is updated in the page

## CI/CD & Deployment

**Hosting:**

- Not detected; repository is a static site and `README.md` suggests local Python HTTP serving

**CI Pipeline:**

- None detected

## Environment Configuration

**Required env vars:**

- None implemented
- A usable Anthropic key is manually inserted into `script.js` for the AI feedback feature (`README.md`)

**Secrets location:**

- No secret store detected. The documented client-side key approach is unsafe for production; `README.md` recommends proxying through a backend.

## Webhooks & Callbacks

**Incoming:**

- None detected

**Outgoing:**

- Browser POST to Anthropic Messages API from `getAIFeedback()` in `script.js`

---

*Integration audit: 2026-09-24*
