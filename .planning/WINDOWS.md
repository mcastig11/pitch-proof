---
schema_version: 1
open_count: 7
waived_count: 0
fixed_count: 0
total_count: 7
last_updated: 2026-10-07T05:45:30.019Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 02 | skipped-test | tests/auth-flow.test.cjs | 172 | Verification resend response test remains a pre-existing TODO assigned to Plan 02-04. | open |  | 2026-10-07T05:44:42.896Z |  |
| 2 | 02 | skipped-test | tests/auth-flow.test.cjs | 173 | Corrected-address signup test remains a pre-existing TODO assigned to Plan 02-04. | open |  | 2026-10-07T05:45:26.899Z |  |
| 3 | 02 | skipped-test | tests/auth-flow.test.cjs | 174 | Unknown-account sign-in response test remains a pre-existing TODO assigned to Plan 02-04. | open |  | 2026-10-07T05:45:27.522Z |  |
| 4 | 02 | skipped-test | tests/auth-flow.test.cjs | 175 | Duplicate signup response test remains a pre-existing TODO assigned to Plan 02-04. | open |  | 2026-10-07T05:45:28.141Z |  |
| 5 | 02 | skipped-test | tests/auth-flow.test.cjs | 176 | Concurrent duplicate signup test remains a pre-existing TODO assigned to Plan 02-04. | open |  | 2026-10-07T05:45:28.776Z |  |
| 6 | 02 | skipped-test | tests/auth-flow.test.cjs | 177 | Password-reset flow test remains a pre-existing TODO assigned to Plan 02-04. | open |  | 2026-10-07T05:45:29.394Z |  |
| 7 | 02 | skipped-test | tests/auth-flow.test.cjs | 178 | Pending-account cleanup test remains a pre-existing TODO assigned to Plan 02-04. | open |  | 2026-10-07T05:45:30.019Z |  |

````json
[
  {
    "id": 1,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 172,
    "description": "Verification resend response test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-07T05:44:42.896Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 2,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 173,
    "description": "Corrected-address signup test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:26.899Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 3,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 174,
    "description": "Unknown-account sign-in response test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:27.522Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 4,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 175,
    "description": "Duplicate signup response test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:28.141Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 5,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 176,
    "description": "Concurrent duplicate signup test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:28.776Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 6,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 177,
    "description": "Password-reset flow test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:29.394Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 7,
    "kind": "skipped-test",
    "phase": "02",
    "file": "tests/auth-flow.test.cjs",
    "line": 178,
    "description": "Pending-account cleanup test remains a pre-existing TODO assigned to Plan 02-04.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-07T05:45:30.019Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
