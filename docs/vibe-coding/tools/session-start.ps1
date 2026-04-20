<#
.SYNOPSIS
  Session-start wrapper: updates kit subtree > prints kit version > syncs forGPT > runs Consumer doc-audit > prints audit block.
.DESCRIPTION
  Run this from ANY consumer repo (any subdirectory). It detects repo root and DOCS_ROOT automatically.
  Designed to be invoked by Copilot when the user says: RUN START OF SESSION DOCS AUDIT
.PARAMETER SkipUpdate
  Skip the subtree pull even if the vibe-coding-kit remote exists.
.PARAMETER SkipAudit
  Skip the Consumer doc-audit step (still prints kit version).
.PARAMETER Force
  Continue on dirty tree instead of hard-stopping. Tree=DIRTY will still be reported.
.PARAMETER WhatIf
  Print commands that would run without executing subtree pull, forGPT sync, or doc-audit.
#>
[CmdletBinding()]
param(
    [switch]$SkipUpdate,
    [switch]$SkipAudit,
    [switch]$Force,
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

# -- 1. Branch + tree state ------------------------------------
$branch = (git branch --show-current 2>$null) -join ""
$dirtyFiles = git status --porcelain | Where-Object { $_ -notmatch '^\?\?' }
$treeState = if ($dirtyFiles) { "DIRTY" } else { "CLEAN" }

if ($treeState -eq "DIRTY" -and -not $Force) {
    Write-Host "HARD STOP: Working tree is dirty. Commit or stash first, or use -Force." -ForegroundColor Red
    Write-Host "Dirty files:" -ForegroundColor Yellow
    $dirtyFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    exit 1
}

# -- 2. Detect DOCS_ROOT --------------------------------------
# Prefer script-relative: tools/ -> vibe-coding/ (kit head) -> DOCS_ROOT
$docsRoot = $null
$docsReason = ""

$kitHead = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Split-Path $kitHead -Leaf) -eq "vibe-coding") {
    $docsRootFull = (Resolve-Path (Join-Path $kitHead "..")).Path
    $repoRootNorm = $repoRoot -replace '/', '\'
    $docsRootNorm = $docsRootFull -replace '/', '\'
    if ($docsRootNorm.Length -gt $repoRootNorm.Length -and $docsRootNorm.StartsWith($repoRootNorm)) {
        $docsRoot = ($docsRootNorm.Substring($repoRootNorm.Length).TrimStart('\')) -replace '\\', '/'
        $docsReason = "script-relative (vibe-coding parent)"
    } elseif ($docsRootNorm -eq $repoRootNorm) {
        # DOCS_ROOT is repo root itself — use '.' to keep Join-Path sane
        $docsRoot = "."
        $docsReason = "script-relative (vibe-coding at repo root)"
    }
}

# Fallback: repo-root detection (Kit source repo or unusual layout)
if (-not $docsRoot) {
    $deDir = Join-Path $repoRoot "docs-engineering"
    $docsDir = Join-Path $repoRoot "docs"
    if ((Test-Path $deDir) -and ((Test-Path (Join-Path $deDir "vibe-coding")) -or (Test-Path (Join-Path $deDir "forGPT")))) {
        $docsRoot = "docs-engineering"
        $docsReason = "docs-engineering/ contains vibe-coding or forGPT"
    } elseif (Test-Path $docsDir) {
        $docsRoot = "docs"
        $docsReason = "docs/ exists"
    } else {
        Write-Error "HARD STOP: Neither docs-engineering/ nor docs/ found at repo root: $repoRoot"
        exit 1
    }
}

$subtreePrefix = "$docsRoot/vibe-coding"
if (-not (Test-Path (Join-Path $repoRoot $subtreePrefix))) {
    Write-Error "HARD STOP: Subtree prefix $subtreePrefix does not exist. Has the kit been added as a subtree?"
    exit 1
}

# -- 2b. Overlay-outside-head check (Octopus Invariant 2) ------
# See OCTOPUS-INVARIANTS.md — overlays MUST NOT live inside the kit head.
$overlaysInsideHead = Join-Path $repoRoot "$docsRoot/vibe-coding/overlays"
if (Test-Path $overlaysInsideHead) {
    Write-Error "HARD STOP: Overlays detected inside kit head ($docsRoot/vibe-coding/overlays/). Move overlays to $docsRoot/overlays/ and re-run. See OCTOPUS-INVARIANTS.md."
    exit 1
}
$overlayIndex = Join-Path $repoRoot "$docsRoot/overlays/OVERLAY-INDEX.md"
if (-not (Test-Path $overlayIndex)) {
    Write-Host "WARNING: Overlay index missing at $docsRoot/overlays/OVERLAY-INDEX.md. Create it per OCTOPUS-INVARIANTS.md." -ForegroundColor Yellow
}

# -- 3. Kit update (subtree pull) ------------------------------
$kitUpdateResult = "NOOP"
$kitRemoteUrl = "https://github.com/Stephen-Ch/vibe-coding-kit.git"
$kitRemoteName = $null

if ($SkipUpdate) {
    $kitUpdateResult = "SKIPPED(Flag)"
} else {
    # Find existing remote whose URL matches vibe-coding-kit
    $remotes = git remote -v 2>$null
    foreach ($line in $remotes) {
        if ($line -match '(\S+)\s+.*vibe-coding-kit.*\(fetch\)') {
            $kitRemoteName = $Matches[1]
            break
        }
    }

    if (-not $kitRemoteName) {
        # Add the remote automatically
        $kitRemoteName = "vibe-coding-kit"
        if ($WhatIf) {
            Write-Host "[WhatIf] Would run: git remote add $kitRemoteName $kitRemoteUrl" -ForegroundColor Cyan
        } else {
            Write-Host "Adding remote '$kitRemoteName'..." -ForegroundColor Yellow
            Invoke-GitSafe remote add $kitRemoteName $kitRemoteUrl | Out-Null
        }
    }

    if ($WhatIf) {
        Write-Host "[WhatIf] Would run: git fetch $kitRemoteName" -ForegroundColor Cyan
        Write-Host "[WhatIf] Would run: git subtree pull --prefix $subtreePrefix $kitRemoteName main --squash" -ForegroundColor Cyan
        $kitUpdateResult = "SKIPPED(WhatIf)"
    } else {
        Write-Host "Fetching $kitRemoteName..." -ForegroundColor Yellow
        Invoke-GitSafe fetch $kitRemoteName | Out-Null

        Write-Host "Pulling subtree ($subtreePrefix)..." -ForegroundColor Yellow
        try {
            $pullOutput = Invoke-GitSafe subtree pull --prefix $subtreePrefix $kitRemoteName main --squash
            $pullText = ($pullOutput | Out-String).Trim()
            if ($pullText -match "Already up to date") {
                $kitUpdateResult = "NOOP"
            } else {
                $kitUpdateResult = "DONE"
            }
            Write-Host $pullText -ForegroundColor Gray
        } catch {
            Write-Host "HARD STOP: Subtree pull failed." -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
            Write-Host "Suggested fix: Ensure '$subtreePrefix' was originally added with 'git subtree add --prefix $subtreePrefix $kitRemoteName main --squash'" -ForegroundColor Yellow
            exit 1
        }
    }
}

# -- 3b. Kit version print ------------------------------------
$kitVersion = "(unknown)"
$kitEffective = "(unknown)"
$versionFile = Join-Path $repoRoot (Join-Path $subtreePrefix "VIBE-CODING.VERSION.md")
if (Test-Path $versionFile) {
    $vContent = Get-Content $versionFile -Raw
    if ($vContent -match '\*\*Version:\*\*\s*(v[\d.]+)') {
        $kitVersion = $Matches[1]
    }
    if ($vContent -match '\*\*Effective Date:\*\*\s*(\d{4}-\d{2}-\d{2})') {
        $kitEffective = $Matches[1]
    }
}
Write-Host "KitVersion: $kitVersion (Effective $kitEffective)" -ForegroundColor Green

# -- 3c. Kit version lag check (WARN only) --------------------
$kitVersionRemote = "(unavailable)"
$kitLagResult = "SKIP"
try {
    # Determine the remote ref to read from
    $lagRef = $null
    if ($kitRemoteName) {
        # Remote was already fetched in step 3; use its main ref
        $lagRef = "$kitRemoteName/main"
    } else {
        # Kit mode or SkipUpdate — try fetching the ref directly
        try {
            git fetch $kitRemoteUrl main --depth=1 2>$null | Out-Null
            $lagRef = "FETCH_HEAD"
        } catch { }
    }

    if ($lagRef) {
        $remoteContent = git show "${lagRef}:VIBE-CODING.VERSION.md" 2>$null | Out-String
        if ($remoteContent -match '\*\*Version:\*\*\s*(v[\d.]+)') {
            $kitVersionRemote = $Matches[1]
        }
    }
} catch {
    # Network unavailable or other error — continue silently
}

Write-Host "KitVersionLocal=$kitVersion" -ForegroundColor Gray
if ($kitVersionRemote -eq "(unavailable)") {
    Write-Host "KitVersionRemote=(unavailable)" -ForegroundColor Yellow
    Write-Host "WARN: Could not check remote kit version (offline or fetch failed)." -ForegroundColor Yellow
    $kitLagResult = "WARN(unavailable)"
} elseif ($kitVersion -ne $kitVersionRemote) {
    Write-Host "KitVersionRemote=$kitVersionRemote" -ForegroundColor Yellow
    Write-Host "WARN: Kit version lag - local $kitVersion vs remote $kitVersionRemote. Run kit subtree pull to update." -ForegroundColor Yellow
    $kitLagResult = "WARN(lag)"
} else {
    Write-Host "KitVersionRemote=$kitVersionRemote" -ForegroundColor Green
    Write-Host "OK: Kit version is current." -ForegroundColor Green
    $kitLagResult = "OK"
}

# -- 4. forGPT sync -------------------------------------------
$forGptStatus = "MISSING"
$vmDate = "MISSING"
$vmCommit = "MISSING"

# Check two possible locations for sync-forgpt.ps1
$syncScript = Join-Path $repoRoot "$docsRoot/forGPT/sync-forgpt.ps1"
if (-not (Test-Path $syncScript)) {
    $syncScript = Join-Path $repoRoot "$docsRoot/vibe-coding/tools/sync-forgpt.ps1"
}

if (Test-Path $syncScript) {
    $forGptStatus = "PRESENT"
    if ($WhatIf) {
        Write-Host "[WhatIf] Would run: $syncScript -Force" -ForegroundColor Cyan
    } else {
        Write-Host "Running forGPT sync..." -ForegroundColor Yellow
        try {
            & $syncScript -Force 2>&1 | Out-Null
        } catch {
            Write-Host "  Warning: forGPT sync failed: $_" -ForegroundColor Yellow
        }
    }
}

# Parse VERSION-MANIFEST if present
$vmPath = Join-Path $repoRoot "$docsRoot/forGPT/VERSION-MANIFEST.md"
if (Test-Path $vmPath) {
    $vmContent = Get-Content $vmPath -Raw
    if ($vmContent -match '\*\*Generated\*\*\s*\|\s*(\d{4}-\d{2}-\d{2})') {
        $vmDate = $Matches[1]
    }
    if ($vmContent -match '\*\*Git Commit\*\*\s*\|\s*`([^`]+)`') {
        $vmCommit = $Matches[1]
    }
}

# -- 4b. Consumer doc-audit (hard fail) -----------------------
$auditResult = "SKIPPED"
$auditScript = Join-Path $repoRoot (Join-Path $subtreePrefix "tools/doc-audit.ps1")
if ($SkipAudit) {
    $auditResult = "SKIPPED(Flag)"
} elseif ($WhatIf) {
    # Detect whether doc-audit supports -StartSession
    $auditHasStartSession = $false
    try {
        $auditParams = (Get-Command $auditScript -ErrorAction SilentlyContinue).Parameters
        if ($auditParams -and $auditParams.ContainsKey('StartSession')) {
            $auditHasStartSession = $true
        }
    } catch { }
    if ($auditHasStartSession) {
        Write-Host "[WhatIf] Would run: $auditScript -Mode Consumer -StartSession" -ForegroundColor Cyan
    } else {
        Write-Host "[WhatIf] Would run: $auditScript -Mode Consumer" -ForegroundColor Cyan
    }
    $auditResult = "SKIPPED(WhatIf)"
} elseif (Test-Path $auditScript) {
    Write-Host "Running Consumer doc-audit..." -ForegroundColor Yellow
    # Detect whether doc-audit supports -StartSession
    $auditHasStartSession = $false
    try {
        $auditParams = (Get-Command $auditScript -ErrorAction SilentlyContinue).Parameters
        if ($auditParams -and $auditParams.ContainsKey('StartSession')) {
            $auditHasStartSession = $true
        }
    } catch { }
    if ($auditHasStartSession) {
        & $auditScript -Mode Consumer -StartSession
    } else {
        & $auditScript -Mode Consumer
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "HARD STOP: Consumer doc-audit FAILED (exit $LASTEXITCODE). Fix issues above before proceeding." -ForegroundColor Red
        exit 1
    }
    $auditResult = "PASS"
} else {
    Write-Host "WARNING: doc-audit.ps1 not found at $auditScript" -ForegroundColor Yellow
    $auditResult = "MISSING"
}

# -- 5. ResearchIndex -----------------------------------------
$riPath = "MISSING"
$riDate = "MISSING"
$riCandidate = Join-Path $repoRoot "$docsRoot/research/ResearchIndex.md"
if (Test-Path $riCandidate) {
    $riPath = "$docsRoot/research/ResearchIndex.md"
    $riContent = Get-Content $riCandidate -Raw
    if ($riContent -match 'Last updated:\s*(\d{4}-\d{2}-\d{2})') {
        $riDate = $Matches[1]
    }
}

# -- 6. Open PRs ----------------------------------------------
$prCount = "UNKNOWN"
$prList = "gh CLI not available"
try {
    $ghVersion = gh --version 2>$null
    if ($ghVersion) {
        $prs = gh pr list --state open --json number,title 2>$null | ConvertFrom-Json
        if ($null -eq $prs -or $prs.Count -eq 0) {
            $prCount = "0"
            $prList = "none"
        } else {
            $prCount = "$($prs.Count)"
            $prList = ($prs | ForEach-Object { "#$($_.number) $($_.title)" }) -join "; "
        }
    }
} catch {
    # gh not available or auth issue - UNKNOWN is fine
}

# -- 7. Print 5-line audit ------------------------------------
Write-Host ""
Write-Host "========== SESSION START AUDIT ==========" -ForegroundColor Cyan
Write-Host "RepoRoot=$repoRoot | Branch=$branch | Tree=$treeState"
Write-Host "DOCS_ROOT=$docsRoot | Reason=$docsReason"
Write-Host "forGPT=$forGptStatus | VERSION-MANIFEST=$vmDate | Commit=$vmCommit | KitUpdate=$kitUpdateResult"
Write-Host "KitVersion=$kitVersion | Effective=$kitEffective | KitLag=$kitLagResult | ConsumerAudit=$auditResult"
Write-Host "ResearchIndex=$riPath | LastUpdated=$riDate"
Write-Host "OpenPRs=$prCount - $prList"
Write-Host "=========================================" -ForegroundColor Cyan

} finally {
    Pop-Location
}
