<#
.SYNOPSIS
  End-of-session repo hygiene check: tracked changes, untracked items, orphan branches.
.DESCRIPTION
  Run this from ANY consumer repo (any subdirectory). It detects repo root
  and DOCS_ROOT automatically. Hard-stops (exit 1) only if tracked changes exist.
  Everything else is report-only.
.PARAMETER SkipFetch
  Skip git fetch origin (use stale remote refs for branch check).
.PARAMETER WriteReport
  Write a markdown status report under <DOCS_ROOT>/status/.
.PARAMETER WhatIf
  Print what would happen without fetching or writing files.
#>
[CmdletBinding()]
param(
    [switch]$SkipFetch,
    [switch]$WriteReport,
    [switch]$WhatIf
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- Helper: run git tolerant of stderr progress ---------------
function Invoke-GitSafe {
    <#
    .SYNOPSIS
      Runs git with stderr tolerance so progress output does not
      become a terminating error under $ErrorActionPreference=Stop.
      Throws only when git returns a non-zero exit code.
    #>
    [CmdletBinding()]
    param([Parameter(ValueFromRemainingArguments)][string[]]$GitArgs)
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = & git @GitArgs 2>&1
        if ($LASTEXITCODE -ne 0) {
            $ErrorActionPreference = $prevEAP
            $errText = ($output | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] } | Out-String).Trim()
            if (-not $errText) { $errText = ($output | Out-String).Trim() }
            throw "git $($GitArgs -join ' ') failed (exit $LASTEXITCODE): $errText"
        }
        return $output
    } finally {
        $ErrorActionPreference = $prevEAP
    }
}

# -- 0. Repo root ----------------------------------------------
try {
    $repoRoot = (git rev-parse --show-toplevel 2>&1) -replace '/', '\'
} catch {
    Write-Error "HARD STOP: Not inside a git repository."
    exit 1
}
if (-not (Test-Path $repoRoot)) {
    Write-Error "HARD STOP: git rev-parse returned invalid path: $repoRoot"
    exit 1
}
Push-Location $repoRoot

try {

# -- 1. DOCS_ROOT (prefer script-relative) ----------------------
$docsRoot = $null

$kitHead = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Split-Path $kitHead -Leaf) -eq "vibe-coding") {
    $docsRootFull = (Resolve-Path (Join-Path $kitHead "..")).Path
    $repoRootNorm = $repoRoot -replace '/', '\'
    $docsRootNorm = $docsRootFull -replace '/', '\'
    if ($docsRootNorm.Length -gt $repoRootNorm.Length -and $docsRootNorm.StartsWith($repoRootNorm)) {
        $docsRoot = ($docsRootNorm.Substring($repoRootNorm.Length).TrimStart('\')) -replace '\\', '/'
    } elseif ($docsRootNorm -eq $repoRootNorm) {
        $docsRoot = "."
    }
}

# Fallback: repo-root detection
if (-not $docsRoot) {
    $deDir = Join-Path $repoRoot "docs-engineering"
    $docsDir = Join-Path $repoRoot "docs"
    if ((Test-Path $deDir) -and ((Test-Path (Join-Path $deDir "vibe-coding")) -or (Test-Path (Join-Path $deDir "forGPT")))) {
        $docsRoot = "docs-engineering"
    } elseif (Test-Path $docsDir) {
        $docsRoot = "docs"
    } else {
        $docsRoot = "docs"  # safe default for path construction
    }
}

# -- 2. Current branch + HEAD ----------------------------------
$branch = (git branch --show-current 2>$null) -join ""
$headSha = (git rev-parse --short HEAD 2>$null) -join ""

# -- 3. Default branch (origin/HEAD) ---------------------------
$defaultBranch = "main"
try {
    $symRef = (git symbolic-ref refs/remotes/origin/HEAD 2>$null) -join ""
    if ($symRef -match 'refs/remotes/origin/(.+)') {
        $defaultBranch = $Matches[1]
    }
} catch { }

# -- 4. Fetch origin (unless skipped) --------------------------
if ($SkipFetch) {
    Write-Host "[SkipFetch] Skipping git fetch origin" -ForegroundColor Yellow
} elseif ($WhatIf) {
    Write-Host "[WhatIf] Would run: git fetch origin" -ForegroundColor Cyan
} else {
    Write-Host "Fetching origin..." -ForegroundColor Yellow
    try {
        Invoke-GitSafe fetch origin | Out-Null
    } catch {
        Write-Host "  Warning: fetch failed: $_" -ForegroundColor Yellow
    }
}

# -- 5. Print summary header -----------------------------------
Write-Host ""
Write-Host "========== END OF SESSION CHECK ==========" -ForegroundColor Cyan
Write-Host "RepoRoot     = $repoRoot"
Write-Host "DOCS_ROOT    = $docsRoot"
Write-Host "Branch       = $branch"
Write-Host "origin/HEAD  = origin/$defaultBranch"
Write-Host "HEAD         = $headSha"
Write-Host ""

# -- 6. Tracked changes ----------------------------------------
$statusLines = @(git status --porcelain)
$trackedChanges = @($statusLines | Where-Object { $_ -notmatch '^\?\?' })
$untrackedItems = @($statusLines | Where-Object { $_ -match '^\?\?' })

$hasTracked = $trackedChanges.Count -gt 0

if ($hasTracked) {
    Write-Host "TRACKED CHANGES ($($trackedChanges.Count)):" -ForegroundColor Red
    foreach ($line in $trackedChanges) {
        Write-Host "  $line" -ForegroundColor Red
    }
} else {
    Write-Host "Tracked changes: none" -ForegroundColor Green
}

# -- 7. Untracked items ----------------------------------------
Write-Host ""
if ($untrackedItems.Count -gt 0) {
    Write-Host "UNTRACKED ITEMS ($($untrackedItems.Count)):" -ForegroundColor Yellow
    foreach ($line in $untrackedItems) {
        Write-Host "  $line" -ForegroundColor Yellow
    }
} else {
    Write-Host "Untracked items: none" -ForegroundColor Green
}

# -- 8. Non-merged branches ------------------------------------
Write-Host ""
$baseRef = "origin/$defaultBranch"
# Check if origin/<default> exists; fall back to local <default>
$refExists = git rev-parse --verify $baseRef 2>$null
if ($LASTEXITCODE -ne 0) {
    $baseRef = $defaultBranch
}

$nonMergedRaw = @(git branch --no-merged $baseRef 2>$null)
# Filter out the current branch indicator and trim whitespace
$nonMerged = @($nonMergedRaw | ForEach-Object { ($_ -replace '^\*?\s+', '').Trim() } | Where-Object { $_ -ne '' })

if ($nonMerged.Count -gt 0) {
    Write-Host "NON-MERGED BRANCHES (vs $baseRef) ($($nonMerged.Count)):" -ForegroundColor Yellow
    foreach ($b in $nonMerged) {
        Write-Host "  $b" -ForegroundColor Yellow
    }
    Write-Host "  (No deletes performed - review per repo policy)" -ForegroundColor Gray
} else {
    Write-Host "Non-merged branches (vs $baseRef): none" -ForegroundColor Green
}

# -- 9. Optional report file -----------------------------------
if ($WriteReport) {
    $statusDir = Join-Path $repoRoot (Join-Path $docsRoot "status")
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    $reportPath = Join-Path $statusDir "END-SESSION-REPORT-$ts.md"

    if ($WhatIf) {
        Write-Host ""
        Write-Host "[WhatIf] Would write report to: $reportPath" -ForegroundColor Cyan
    } else {
        if (-not (Test-Path $statusDir)) {
            New-Item -ItemType Directory -Path $statusDir -Force | Out-Null
        }

        $trackedBlock = if ($hasTracked) {
            ($trackedChanges | ForEach-Object { "- ``$_``" }) -join "`n"
        } else { "None" }

        $untrackedBlock = if ($untrackedItems.Count -gt 0) {
            ($untrackedItems | ForEach-Object { "- ``$_``" }) -join "`n"
        } else { "None" }

        $branchBlock = if ($nonMerged.Count -gt 0) {
            ($nonMerged | ForEach-Object { "- ``$_``" }) -join "`n"
        } else { "None" }

        $reportLines = @()
        $reportLines += "# End-of-Session Report"
        $reportLines += ""
        $reportLines += "> Auto-generated by end-session.ps1"
        $reportLines += ""
        $reportLines += "| Field | Value |"
        $reportLines += "|-------|-------|"
        $reportLines += "| **Time** | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') |"
        $reportLines += "| **Branch** | ``$branch`` |"
        $reportLines += "| **HEAD** | ``$headSha`` |"
        $reportLines += "| **DOCS_ROOT** | ``$docsRoot`` |"
        $reportLines += ""
        $reportLines += "## Tracked Changes ($($trackedChanges.Count))"
        $reportLines += ""
        $reportLines += $trackedBlock
        $reportLines += ""
        $reportLines += "## Untracked Items ($($untrackedItems.Count))"
        $reportLines += ""
        $reportLines += $untrackedBlock
        $reportLines += ""
        $reportLines += "## Non-Merged Branches vs $baseRef ($($nonMerged.Count))"
        $reportLines += ""
        $reportLines += $branchBlock
        $reportLines += ""
        $reportLines += "## Suggested Next Steps"
        $reportLines += ""
        $reportLines += "- If tracked changes exist: commit or stash before closing the session."
        $reportLines += "- If non-merged branches exist: open PRs or delete after merge per repo policy."
        $reportLines += "- If untracked items exist: decide whether to add, .gitignore, or remove."

        $reportContent = $reportLines -join "`n"

        Set-Content -Path $reportPath -Value $reportContent -Encoding UTF8
        Write-Host ""
        Write-Host "Report written: $reportPath" -ForegroundColor Green
    }
}

# -- 10. Footer + exit -----------------------------------------
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

if ($hasTracked) {
    Write-Host "HARD STOP: Tracked changes exist. Commit or stash before closing session." -ForegroundColor Red
    exit 1
} else {
    Write-Host "END OF SESSION: Clean." -ForegroundColor Green
    exit 0
}

} finally {
    Pop-Location
}
