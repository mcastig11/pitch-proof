# Pitch Proof

Pitch Proof is a browser practice platform for one singer and one selected melodic part. The current guest example is an original, manually verified vocal exercise with a pickup, four measures, and a fixed 96 BPM tempo. Microphone pitch observations are provisional; they are not measured grades. Personal PDF uploads, score correction, authoritative feedback, and saved practice history arrive in later phases.

## Guest example and Phase 1 checks

Use a modern browser with microphone support. Serve the example locally:

```sh
python -m http.server 8000
```

Open http://localhost:8000, select the starting measure, check the microphone, then start, stop, and retry. Practice includes a count-in and score-position display. Microphone permission requires localhost or HTTPS. The example needs no account or external service key.

Run the fixture, timeline, audio lifecycle, score-position replay, startup, and accessibility checks with:

```sh
npm test
```

On Windows PowerShell use `npm.cmd test`. Real microphone permission, count-in sound, and device behavior also need browser verification; automated tests do not establish those physical checks.

## Local account server

With the existing dependencies available, start the Node server:

```sh
node server/index.mjs
```

Open http://localhost:3000 for the guest example. The auth API requires email confirmation before private access. Local mode stores accounts in an in-memory database by default, so restarting clears them. For local persistence, set `DATABASE_PATH` to a private SQLite file outside the public repository and set a stable `BETTER_AUTH_SECRET` of at least 32 characters in the server environment. The parent directory must exist. `PORT` defaults to 3000; `PUBLIC_BASE_URL` defaults to http://localhost on that port. `HOST` defaults to 127.0.0.1.

Development and test modes capture verification and password-reset mail in process memory. They send no network requests and require no Resend account. Tests access messages only through their injected transport instance; there is no public mail inspector, token URL log, or captured-mail endpoint. An ordinary local CLI process does not print confirmation links. Account UI and ownership acceptance are still Phase 2 work.

Focused mail and account checks:

```sh
node --test tests/email-transport.test.cjs tests/auth-flow.test.cjs
```

These checks use isolated databases, captured messages, and stubbed fetch. They never send real mail.

## Production account email prerequisites

This repository contains no production credentials or deployment host. Before opening real accounts, configure HTTPS termination, private durable SQLite storage and backups, then set these values in the server host's environment or secret manager:

| Setting | Required production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `PUBLIC_BASE_URL` | The exact HTTPS origin, with no path, query, or embedded credentials |
| `BETTER_AUTH_SECRET` | A stable random secret of at least 32 characters |
| `DATABASE_PATH` | An absolute durable SQLite file path outside public assets; its private parent directory must exist |
| `RESEND_API_KEY` | A server-only key provisioned in Resend Dashboard → API Keys; use sending access restricted to the needed domain |
| `RESEND_FROM` | A sender on the verified domain, such as `Pitch Proof <accounts@your-domain.example>` |
| `PORT` / `HOST` | Optional listener settings; default 3000 / 127.0.0.1 behind the HTTPS proxy |

In Resend Dashboard → Domains, add the sending domain, configure the required DNS records, and wait for verification before using that sender. See Resend's [domain verification instructions](https://resend.com/docs/dashboard/domains/introduction) and [API key permissions](https://resend.com/docs/dashboard/api-keys/introduction).

Start with `node server/index.mjs` after the environment is configured. Missing required settings stop startup and report field names without printing values. Invalid origins, weak auth secrets, malformed senders, and in-memory production storage are rejected. HTTPS protects the public account links; `RESEND_FROM` is an email address, not a URL. Forward the original public Host header through the HTTPS proxy so the auth origin checks match `PUBLIC_BASE_URL`. Before multiple server replicas are exposed, replace the process-local auth limiter with a shared limiter and validate the storage architecture.

The server uses built-in fetch to [send one transactional message through Resend](https://resend.com/docs/api-reference/emails/send-email) at `https://api.resend.com/emails`, with a Bearer key. No Resend SDK or browser key is used. Only confirmation and reset mail is supported. Requests and response-body waits time out after 10 seconds; redirects, unsuccessful statuses, and malformed acceptance responses fail with a fixed diagnostic. Provider acceptance does not guarantee inbox delivery: an operator must monitor bounces and delivery in Resend. A delivery outage preserves generic signup/resend/reset responses to avoid exposing account existence; request a fresh message if none arrives. Password reset requires a fresh sign-in and revokes existing sessions on all devices.

Keep secrets in the server environment. Never put a key in browser code, commit environment files, or log full confirmation/reset links. The server exposes only declared browser assets; private server modules, storage, and captured mail are not public routes. The complete external API scope is recorded in [.planning/phases/02-private-practice-access/COVERAGE.md](.planning/phases/02-private-practice-access/COVERAGE.md).

## Scheduled GitHub publication on this Windows workstation

The user-authorized Task Scheduler task `PitchProof-Verified-GitHub-Push` runs at **noon and 8 PM Central** while the Windows user is signed in. The computer must be on; a missed run is eligible when the workstation becomes available.

The task runs [scripts/push-verified-work.ps1](scripts/push-verified-work.ps1). It requires the expected GitHub origin, a checked-out GSD branch, a clean working tree (excluding only the existing GSD dispatch sentinel), and passing tests within 120 seconds. It rechecks the branch, commit and working tree, then pushes the exact tested commit. It never stages files, creates commits, merges or force-pushes. Dirty work, failed tests, changed HEAD or unavailable credentials defer publication.

Git and Node/npm must be on the user PATH, the GSD runner must remain installed under the user's .codex directory, and the existing Git credential helper must support unattended access. No password or access token is stored in the script or task. Diagnostics are in the ignored `.planning/automation/verified-push.log`.

Inspect the task in Windows Task Scheduler to change times or disable it. To verify the helper without publishing, run:

```powershell
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/push-verified-work.ps1 -VerifyOnly
```

The execution-policy override applies only to that process; the system policy is unchanged.
