<#
.SYNOPSIS
  Universal runner for vibe-coding-kit tools. Path-independent.
.DESCRIPTION
  Discovers tool paths from its own location (tools/ folder) and invokes
  the requested tool, forwarding any additional arguments.
  Works regardless of current working directory or DOCS_ROOT nesting depth.

  Common tool flags are declared explicitly so PS 5.1 binds them correctly.
  Any unlisted flags can still be passed via -ToolArgs (escape hatch).
.PARAMETER Tool
  Which tool to run: session-start, session-start-kit, kit-update, end-session, sync-forgpt, doc-audit.
.PARAMETER WhatIf
  Print what would be executed without running it.
.PARAMETER WriteReport
  (end-session) Write a markdown status report.
.PARAMETER SkipFetch
  (end-session) Skip git fetch origin.
.PARAMETER SkipUpdate
  (session-start) Deprecated compatibility flag.
.PARAMETER SkipAudit
  (session-start) Skip Consumer doc-audit step.
.PARAMETER Force
  (session-start) Deprecated compatibility flag.
.PARAMETER Mode
  (doc-audit) Explicit mode: Kit or Consumer.
.PARAMETER StartSession
  (doc-audit) Print session-start snippets before audit.
.PARAMETER ToolArgs
  Escape-hatch: extra arguments forwarded verbatim to the underlying tool.
.EXAMPLE
  .\run-vibe.ps1 -Tool session-start
  .\run-vibe.ps1 -Tool session-start-kit
  .\run-vibe.ps1 -Tool kit-update
  .\run-vibe.ps1 -Tool end-session -WriteReport
  .\run-vibe.ps1 -Tool doc-audit -Mode Consumer -StartSession
  .\run-vibe.ps1 -Tool sync-forgpt -WhatIf
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0)]
    [ValidateSet("session-start", "session-start-kit", "kit-update", "end-session", "sync-forgpt", "doc-audit")]
    [string]$Tool,

    [switch]$WhatIf,

    # end-session flags
    [switch]$WriteReport,
    [switch]$SkipFetch,

    # session-start flags
    [switch]$SkipUpdate,
    [switch]$SkipAudit,
    [switch]$Force,

    # doc-audit flags
    [string]$Mode,
    [switch]$StartSession,

    # escape hatch
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ToolArgs
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- Resolve paths from script location -------------------------
$kitHead = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$docsRootDisplay = "(kit source repo)"

if ((Split-Path $kitHead -Leaf) -eq "vibe-coding") {
    $docsRootFull = (Resolve-Path (Join-Path $kitHead "..")).Path
    try {
        $repoRoot = (git rev-parse --show-toplevel 2>&1) -replace '/', '\'
        $repoRootNorm = $repoRoot -replace '/', '\'
        $docsRootNorm = $docsRootFull -replace '/', '\'
        if ($docsRootNorm.Length -gt $repoRootNorm.Length -and $docsRootNorm.StartsWith($repoRootNorm)) {
            $docsRootDisplay = ($docsRootNorm.Substring($repoRootNorm.Length).TrimStart('\')) -replace '\\', '/'
        } elseif ($docsRootNorm -eq $repoRootNorm) {
            $docsRootDisplay = "."
        }
    } catch { }
}

# -- Map tool name to script ------------------------------------
$toolScript = Join-Path $PSScriptRoot "$Tool.ps1"
if (-not (Test-Path $toolScript)) {
    Write-Error "HARD STOP: Tool script not found: $toolScript"
    exit 1
}

# -- Build forwarding args (hashtable for named, array for positional) --
if (-not $ToolArgs) { $ToolArgs = @() }
$named = @{}

# Switches relevant to each tool
if ($WhatIf)       { $named["WhatIf"]       = $true }
if ($WriteReport)  { $named["WriteReport"]  = $true }
if ($SkipFetch)    { $named["SkipFetch"]    = $true }
if ($SkipUpdate)   { $named["SkipUpdate"]   = $true }
if ($SkipAudit)    { $named["SkipAudit"]    = $true }
if ($Force)        { $named["Force"]        = $true }
if ($StartSession) { $named["StartSession"] = $true }
if ($Mode)         { $named["Mode"]         = $Mode }

# Positional escape-hatch args
$positional = @($ToolArgs)

# -- Build display string for WhatIf ----------------------------
$displayParts = @()
foreach ($key in $named.Keys) {
    $val = $named[$key]
    if ($val -is [bool]) {
        $displayParts += "-$key"
    } else {
        $displayParts += "-$key $val"
    }
}
if ($positional.Count -gt 0) { $displayParts += $positional }
$displayStr = $displayParts -join ' '

# -- WhatIf: print and exit ------------------------------------
if ($WhatIf) {
    Write-Host ""
    Write-Host "========== RUN-VIBE (WhatIf) ==========" -ForegroundColor Cyan
    Write-Host "DOCS_ROOT  = $docsRootDisplay"
    Write-Host "KitHead    = $kitHead"
    Write-Host "Tool       = $Tool"
    Write-Host "ToolScript = $toolScript"
    if ($displayStr) {
        Write-Host "ForwardArgs = $displayStr"
    }
    Write-Host ""
    Write-Host "[WhatIf] Would run: & `"$toolScript`" $displayStr" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    exit 0
}

# -- Execute the tool (hashtable splat + positional splat) ------
Write-Host "run-vibe: invoking $Tool..." -ForegroundColor Yellow
if ($positional.Count -gt 0) {
    & $toolScript @named @positional
} else {
    & $toolScript @named
}
exit $LASTEXITCODE
