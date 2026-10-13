---
schema_version: 1
open_count: 7
waived_count: 0
fixed_count: 15
total_count: 22
last_updated: 2026-10-13T20:26:37.276Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 02 | skipped-test | tests/auth-flow.test.cjs | 172 | Verification resend response test remains a pre-existing TODO assigned to Plan 02-04. | fixed |  | 2026-10-07T05:44:42.896Z | 2026-10-09T00:33:36.096Z |
| 2 | 02 | skipped-test | tests/auth-flow.test.cjs | 173 | Corrected-address signup test remains a pre-existing TODO assigned to Plan 02-04. | fixed |  | 2026-10-07T05:45:26.899Z | 2026-10-09T00:33:36.800Z |
| 3 | 02 | skipped-test | tests/auth-flow.test.cjs | 174 | Unknown-account sign-in response test remains a pre-existing TODO assigned to Plan 02-04. | fixed |  | 2026-10-07T05:45:27.522Z | 2026-10-09T00:33:37.589Z |
| 4 | 02 | skipped-test | tests/auth-flow.test.cjs | 175 | Duplicate signup response test remains a pre-existing TODO assigned to Plan 02-04. | fixed |  | 2026-10-07T05:45:28.141Z | 2026-10-09T00:33:38.324Z |
| 5 | 02 | skipped-test | tests/auth-flow.test.cjs | 176 | Concurrent duplicate signup test remains a pre-existing TODO assigned to Plan 02-04. | fixed |  | 2026-10-07T05:45:28.776Z | 2026-10-09T00:33:39.087Z |
| 6 | 02 | skipped-test | tests/auth-flow.test.cjs | 177 | Password-reset flow test remains a pre-existing TODO assigned to Plan 02-04. | fixed |  | 2026-10-07T05:45:29.394Z | 2026-10-09T00:33:39.771Z |
| 7 | 02 | skipped-test | tests/auth-flow.test.cjs | 178 | Pending-account cleanup test remains a pre-existing TODO assigned to Plan 02-04. | fixed |  | 2026-10-07T05:45:30.019Z | 2026-10-09T00:33:40.534Z |
| 8 | 02 | skipped-test | tests/auth-ui.test.cjs | 8 | Plan 02-06 pending acceptance test: pending email state has clear confirmation copy, resend, and correction actions. | fixed |  | 2026-10-09T00:33:41.550Z | 2026-10-13T20:26:30.081Z |
| 9 | 02 | skipped-test | tests/auth-ui.test.cjs | 9 | Plan 02-06 pending acceptance test: signup, sign-in, and reset forms use accessible native semantics. | fixed |  | 2026-10-09T00:33:42.443Z | 2026-10-13T20:26:31.140Z |
| 10 | 02 | skipped-test | tests/auth-ui.test.cjs | 10 | Plan 02-06 pending acceptance test: first sign-in returns to example and later sign-in opens workspace. | fixed |  | 2026-10-09T00:33:43.230Z | 2026-10-13T20:26:32.267Z |
| 11 | 02 | skipped-test | tests/auth-ui.test.cjs | 11 | Plan 02-06 pending acceptance test: welcome page gives Try the example and Sign in equal weight. | fixed |  | 2026-10-09T00:33:44.153Z | 2026-10-13T20:26:33.211Z |
| 12 | 02 | skipped-test | tests/auth-ui.test.cjs | 12 | Plan 02-06 pending acceptance test: expired workspace session clears private content and offers sign-in. | fixed |  | 2026-10-09T00:33:44.993Z | 2026-10-13T20:26:34.173Z |
| 13 | 02 | skipped-test | tests/auth-ui.test.cjs | 13 | Plan 02-06 pending acceptance test: signed-in example shows My space and keeps sign-out in the account menu. | fixed |  | 2026-10-09T00:33:45.845Z | 2026-10-13T20:26:35.249Z |
| 14 | 02 | skipped-test | tests/auth-ui.test.cjs | 14 | Plan 02-06 pending acceptance test: D-03 invitation appears near practice and once after an attempt with exact copy. | fixed |  | 2026-10-09T00:33:46.587Z | 2026-10-13T20:26:36.184Z |
| 15 | 02 | skipped-test | tests/auth-ui.test.cjs | 15 | Plan 02-06 pending acceptance test: guest example practice continues uninterrupted after session expiry. | fixed |  | 2026-10-09T00:33:47.280Z | 2026-10-13T20:26:37.276Z |
| 16 | 02 | skipped-test | tests/ownership.test.cjs | 8 | Plan 02-07 pending acceptance test: unauthenticated requests cannot read private resource metadata or bytes. | open |  | 2026-10-09T00:33:48.068Z |  |
| 17 | 02 | skipped-test | tests/ownership.test.cjs | 9 | Plan 02-07 pending acceptance test: Alice cannot read Bob resource metadata. | open |  | 2026-10-09T00:33:48.787Z |  |
| 18 | 02 | skipped-test | tests/ownership.test.cjs | 10 | Plan 02-07 pending acceptance test: Alice cannot read Bob resource bytes. | open |  | 2026-10-09T00:33:49.498Z |  |
| 19 | 02 | skipped-test | tests/ownership.test.cjs | 11 | Plan 02-07 pending acceptance test: forged owner identifiers cannot bypass server-side ownership checks. | open |  | 2026-10-09T00:33:50.228Z |  |
| 20 | 02 | skipped-test | tests/ownership.test.cjs | 12 | Plan 02-07 pending acceptance test: resource metadata lists only the authenticated owner records. | open |  | 2026-10-09T00:33:50.969Z |  |
| 21 | 02 | skipped-test | tests/ownership.test.cjs | 13 | Plan 02-07 pending acceptance test: resource bytes are available to their authenticated owner. | open |  | 2026-10-09T00:33:51.686Z |  |
| 22 | 02 | unrun-verify | tests/auth-flow.test.cjs |  | Persistent browser restart on localhost and production-like HTTPS Secure cookie checks remain human-needed at Phase 2 acceptance; HTTP cookie output and seven-day server expiry passed. | open |  | 2026-10-09T00:33:52.711Z |  |

````json
[
  {
    "id": 1,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 172,
    "description": "Verification resend response test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-07T05:44:42.896Z",
    "resolved_at": "2026-10-09T00:33:36.096Z",
    "milestone": null
  },
  {
    "id": 2,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 173,
    "description": "Corrected-address signup test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:26.899Z",
    "resolved_at": "2026-10-09T00:33:36.800Z",
    "milestone": null
  },
  {
    "id": 3,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 174,
    "description": "Unknown-account sign-in response test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:27.522Z",
    "resolved_at": "2026-10-09T00:33:37.589Z",
    "milestone": null
  },
  {
    "id": 4,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 175,
    "description": "Duplicate signup response test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:28.141Z",
    "resolved_at": "2026-10-09T00:33:38.324Z",
    "milestone": null
  },
  {
    "id": 5,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 176,
    "description": "Concurrent duplicate signup test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:28.776Z",
    "resolved_at": "2026-10-09T00:33:39.087Z",
    "milestone": null
  },
  {
    "id": 6,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 177,
    "description": "Password-reset flow test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:29.394Z",
    "resolved_at": "2026-10-09T00:33:39.771Z",
    "milestone": null
  },
  {
    "id": 7,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 178,
    "description": "Pending-account cleanup test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:30.019Z",
    "resolved_at": "2026-10-09T00:33:40.534Z",
    "milestone": null
  },
  {
    "id": 8,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 8,
    "description": "Plan 02-06 pending acceptance test: pending email state has clear confirmation copy, resend, and correction actions.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:41.550Z",
    "resolved_at": "2026-10-13T20:26:30.081Z",
    "milestone": null
  },
  {
    "id": 9,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 9,
    "description": "Plan 02-06 pending acceptance test: signup, sign-in, and reset forms use accessible native semantics.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:42.443Z",
    "resolved_at": "2026-10-13T20:26:31.140Z",
    "milestone": null
  },
  {
    "id": 10,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 10,
    "description": "Plan 02-06 pending acceptance test: first sign-in returns to example and later sign-in opens workspace.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:43.230Z",
    "resolved_at": "2026-10-13T20:26:32.267Z",
    "milestone": null
  },
  {
    "id": 11,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 11,
    "description": "Plan 02-06 pending acceptance test: welcome page gives Try the example and Sign in equal weight.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:44.153Z",
    "resolved_at": "2026-10-13T20:26:33.211Z",
    "milestone": null
  },
  {
    "id": 12,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 12,
    "description": "Plan 02-06 pending acceptance test: expired workspace session clears private content and offers sign-in.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:44.993Z",
    "resolved_at": "2026-10-13T20:26:34.173Z",
    "milestone": null
  },
  {
    "id": 13,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 13,
    "description": "Plan 02-06 pending acceptance test: signed-in example shows My space and keeps sign-out in the account menu.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:45.845Z",
    "resolved_at": "2026-10-13T20:26:35.249Z",
    "milestone": null
  },
  {
    "id": 14,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 14,
    "description": "Plan 02-06 pending acceptance test: D-03 invitation appears near practice and once after an attempt with exact copy.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:46.587Z",
    "resolved_at": "2026-10-13T20:26:36.184Z",
    "milestone": null
  },
  {
    "id": 15,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-ui.test.cjs",
    "line": 15,
    "description": "Plan 02-06 pending acceptance test: guest example practice continues uninterrupted after session expiry.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:47.280Z",
    "resolved_at": "2026-10-13T20:26:37.276Z",
    "milestone": null
  },
  {
    "id": 16,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/ownership.test.cjs",
    "line": 8,
    "description": "Plan 02-07 pending acceptance test: unauthenticated requests cannot read private resource metadata or bytes.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:48.068Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 17,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/ownership.test.cjs",
    "line": 9,
    "description": "Plan 02-07 pending acceptance test: Alice cannot read Bob resource metadata.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:48.787Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 18,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/ownership.test.cjs",
    "line": 10,
    "description": "Plan 02-07 pending acceptance test: Alice cannot read Bob resource bytes.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:49.498Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 19,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/ownership.test.cjs",
    "line": 11,
    "description": "Plan 02-07 pending acceptance test: forged owner identifiers cannot bypass server-side ownership checks.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:50.228Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 20,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/ownership.test.cjs",
    "line": 12,
    "description": "Plan 02-07 pending acceptance test: resource metadata lists only the authenticated owner records.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:50.969Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 21,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/ownership.test.cjs",
    "line": 13,
    "description": "Plan 02-07 pending acceptance test: resource bytes are available to their authenticated owner.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:51.686Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 22,
    "kind": "unrun-verify",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": null,
    "description": "Persistent browser restart on localhost and production-like HTTPS Secure cookie checks remain human-needed at Phase 2 acceptance; HTTP cookie output and seven-day server expiry passed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-09T00:33:52.711Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
