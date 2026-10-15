[CmdletBinding()]
param(
  [switch]$VerifyOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $repoRoot '.planning/automation'
$logPath = Join-Path $logDirectory 'verified-push.log'
$mutex = New-Object System.Threading.Mutex($false, 'Local\PitchProofVerifiedGitHubPush')
$locked = $false

function Write-PushLog([string]$Message) {
  Add-Content -LiteralPath $logPath -Encoding UTF8 -Value ("{0} {1}" -f [DateTime]::UtcNow.ToString('o'), $Message)
}

function Get-GitValue([string[]]$GitArguments) {
  $result = & git -C $repoRoot @GitArguments
  if ($LASTEXITCODE -ne 0) { throw 'Git inspection failed.' }
  return ($result -join "`n").Trim()
}

function Assert-PublishableTree {
  $changes = Get-GitValue @('status', '--porcelain', '--untracked-files=all', '--', '.', ':(exclude).gsd/dispatch-isolation-sentinel.json')
  if ($changes) { throw 'Uncommitted work is present; publication deferred.' }
  $origin = Get-GitValue @('remote', 'get-url', '--push', 'origin')
  if ($origin -ne 'https://github.com/mcastig11/pitch-proof.git') { throw 'Unexpected push origin; publication deferred.' }
}

try {
  $locked = $mutex.WaitOne(0)
  if (-not $locked) { exit 0 }
  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
  $env:GIT_TERMINAL_PROMPT = '0'
  $env:GCM_INTERACTIVE = 'Never'
  Assert-PublishableTree
  $branch = Get-GitValue @('branch', '--show-current')
  if ($branch -notmatch '^gsd/[A-Za-z0-9._/-]+$') { throw 'A GSD work branch must be checked out; publication deferred.' }
  $verifiedHead = Get-GitValue @('rev-parse', 'HEAD')
  $gsdTools = Join-Path $env:USERPROFILE '.codex/gsd-core/bin/gsd-tools.cjs'
  if (-not (Test-Path -LiteralPath $gsdTools -PathType Leaf)) { throw 'The bounded GSD test runner is unavailable.' }
  Write-PushLog "Verifying $branch at $verifiedHead."
  Push-Location -LiteralPath $repoRoot
  try {
    & node $gsdTools run-with-timeout 120 -- npm.cmd test 2>&1 | Out-File -FilePath $logPath -Append -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw 'Tests failed or timed out; nothing pushed.' }
    Assert-PublishableTree
    if ((Get-GitValue @('rev-parse', 'HEAD')) -ne $verifiedHead -or (Get-GitValue @('branch', '--show-current')) -ne $branch) {
      throw 'HEAD or branch changed during verification; nothing pushed.'
    }
    if ($VerifyOnly) {
      Write-PushLog "Verification passed; VerifyOnly did not push $verifiedHead."
    } else {
      # Publish the exact tested commit, even if another process commits afterward.
      $ErrorActionPreference = 'Continue'
      & git push origin "${verifiedHead}:refs/heads/$branch" 2>&1 | Out-File -FilePath $logPath -Append -Encoding UTF8
      $pushExitCode = $LASTEXITCODE
      $ErrorActionPreference = 'Stop'
      if ($pushExitCode -ne 0) { throw 'Push failed; no force push or merge attempted.' }
      Write-PushLog "Pushed $branch at $verifiedHead."
    }
  } finally {
    Pop-Location
  }
} catch {
  if (Test-Path -LiteralPath $logDirectory) { Write-PushLog $_.Exception.Message }
  exit 1
} finally {
  if ($locked) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
