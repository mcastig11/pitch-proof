---
type: quick
status: planned
autonomous: true
files_modified:
  - scripts/push-verified-work.ps1
  - .gitignore
---

# Schedule twice-daily verified GitHub pushes

User request: "pls continue to push to github at least twice a day".

Run a Windows user task at noon and 8 PM Central, as selected by the user. Publish existing committed work on the current GSD branch to the existing mcastig11/pitch-proof origin after tests pass. Never stage, auto-commit, merge or force-push.

1. Add a project-local PowerShell helper with origin/branch checks, a clean-worktree check excluding only the pre-existing GSD dispatch sentinel, a bounded test run, and HEAD/branch/worktree rechecks before push. Prevent overlapping scheduled runs and record local diagnostics in ignored files.
2. Parse the script, register one current-user interactive Task Scheduler task with two daily triggers, and run the exact helper once to verify tests and publication. Inspect the registered trigger/action settings. Record results and any prerequisite block in SUMMARY.md and STATE.md.

The computer must be on and the Windows user session available; credentials remain in the existing Git credential helper. Task execution fails safely when prerequisites or tests fail.
