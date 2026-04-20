<#
.SYNOPSIS
  Kit-mode session start: runs kit gates and prints summary.
.DESCRIPTION
  Designed for the vibe-coding-kit source repo only.
  Runs doc-audit (Kit mode), verify-protocol-index, and check-protocol-v7-budget,
  then prints a structured summary. Does NOT perform any consumer-only steps
  (subtree pull, forGPT sync, overlay checks, open-PR queries).
.EXAMPLE
  .\session-start-kit.ps1
  .\run-vibe.ps1 -Tool session-start-kit
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- 0. Repo root + identity -----------------------------------
try {
    $repoRoot = (git rev-parse --show-toplevel 2>&1) -replace '/', '\'
} catch {
    Write-Error "HARD STOP: Not inside a git repository."
    exit 1
}
Push-Location $repoRoot

try {

$branch  = (git branch --show-current 2>$null) -join ""
$commitHash = (git rev-parse --short HEAD 2>$null) -join ""
$dirtyFiles = git status --porcelain | Where-Object { $_ -notmatch '^\?\?' }
$treeState = if ($dirtyFiles) { "DIRTY" } else { "CLEAN" }

# -- 1. Kit version -------------------------------------------
$kitVersion   = "(unknown)"
$kitEffective = "(unknown)"
$versionFile  = Join-Path $repoRoot "VIBE-CODING.VERSION.md"
if (Test-Path $versionFile) {
    $vContent = Get-Content $versionFile -Raw
    if ($vContent -match '\*\*Version:\*\*\s*(v[\d.]+)') {
        $kitVersion = $Matches[1]
    }
    if ($vContent -match '\*\*Effective Date:\*\*\s*(\d{4}-\d{2}-\d{2})') {
        $kitEffective = $Matches[1]
    }
}

Write-Host ""
Write-Host "========== KIT SESSION START ==========" -ForegroundColor Cyan
Write-Host "Branch=$branch | Commit=$commitHash | Tree=$treeState"
Write-Host "KitVersion=$kitVersion | Effective=$kitEffective"
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# -- 2. Run kit gates (fail fast) ------------------------------
$toolsDir = $PSScriptRoot

# Gate 1: doc-audit (Kit mode)
Write-Host "--- Gate 1: doc-audit (Kit mode) ---" -ForegroundColor Yellow
$docAuditScript = Join-Path $toolsDir "doc-audit.ps1"
if (-not (Test-Path $docAuditScript)) {
    Write-Host "FAIL: doc-audit.ps1 not found at $docAuditScript" -ForegroundColor Red
    exit 1
}
& $docAuditScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: doc-audit FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}
$docAuditResult = "PASS"
Write-Host ""

# Gate 2: verify-protocol-index
Write-Host "--- Gate 2: verify-protocol-index ---" -ForegroundColor Yellow
$indexScript = Join-Path $toolsDir "verify-protocol-index.ps1"
if (-not (Test-Path $indexScript)) {
    Write-Host "FAIL: verify-protocol-index.ps1 not found at $indexScript" -ForegroundColor Red
    exit 1
}
& $indexScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: verify-protocol-index FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}
# Capture anchor count from script output (re-run is cheap; parse from prior output is fragile)
$indexResult = "PASS"
Write-Host ""

# Gate 3: check-protocol-v7-budget
Write-Host "--- Gate 3: check-protocol-v7-budget ---" -ForegroundColor Yellow
$budgetScript = Join-Path $toolsDir "check-protocol-v7-budget.ps1"
if (-not (Test-Path $budgetScript)) {
    Write-Host "FAIL: check-protocol-v7-budget.ps1 not found at $budgetScript" -ForegroundColor Red
    exit 1
}
& $budgetScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: check-protocol-v7-budget FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}
$budgetResult = "PASS"
Write-Host ""

# -- 3. Summary ------------------------------------------------
Write-Host "========== KIT SESSION SUMMARY ==========" -ForegroundColor Green
Write-Host "Vibe-Kit Version : $kitVersion (effective $kitEffective)"
Write-Host "Branch           : $branch"
Write-Host "Commit           : $commitHash"
Write-Host "Tree             : $treeState"
Write-Host "Doc Audit        : $docAuditResult (Kit mode)"
Write-Host "Protocol Index   : $indexResult"
Write-Host "Protocol Budget  : $budgetResult"
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Session start completed successfully." -ForegroundColor Green

} finally {
    Pop-Location
}

exit 0
