<#
.SYNOPSIS
  Session-start wrapper: updates kit subtree > prints kit version > Consumer-Kit Drift Gate > syncs forGPT > runs Consumer doc-audit > Staleness Expiry Gate > Decision-Queue Gate > Tool/Auth Fragility Gate > prints audit block.
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
$autoStashed = $false
$stashName = $null

# -- Tool/Auth Fragility tracking (populated throughout script) --
$taGhStatus = "UNAVAILABLE"     # AVAILABLE | DEGRADED | UNAVAILABLE
$taFetchStatus = "UNAVAILABLE"  # AVAILABLE | DEGRADED | UNAVAILABLE

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

# -- 2c. Dirty-file classification + auto-stash ----------------
if ($treeState -eq "DIRTY" -and -not $SkipUpdate) {
    $subtreeDirty = @()
    $nonSubtreeDirty = @()
    foreach ($line in $dirtyFiles) {
        $path = $line.Substring(3).Trim()
        if ($path -match ' -> (.+)$') { $path = $Matches[1] }
        if ($path.StartsWith("$subtreePrefix/")) {
            $subtreeDirty += $line
        } else {
            $nonSubtreeDirty += $line
        }
    }

    if ($subtreeDirty.Count -gt 0) {
        Write-Host "HARD STOP: Kit subtree files are dirty. Commit or stash these manually before session-start:" -ForegroundColor Red
        $subtreeDirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        if ($nonSubtreeDirty.Count -gt 0) {
            Write-Host "Non-subtree dirty files (not blocking, but also present):" -ForegroundColor Yellow
            $nonSubtreeDirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        }
        Write-Host "Note: -Force bypasses the initial precheck but does NOT bypass git subtree merge safety." -ForegroundColor Yellow
        exit 1
    }

    if ($nonSubtreeDirty.Count -gt 0) {
        $stashName = "session-start-autostash-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-Host "Auto-stashing $($nonSubtreeDirty.Count) non-subtree dirty file(s) before kit update..." -ForegroundColor Yellow
        $nonSubtreeDirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        try {
            Invoke-GitSafe stash push -m $stashName
            $autoStashed = $true
            Write-Host "Stashed as: $stashName" -ForegroundColor Green
        } catch {
            Write-Host "HARD STOP: Auto-stash failed. Commit or stash manually, then re-run session-start." -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
            exit 1
        }
    }
} elseif ($treeState -eq "DIRTY" -and $SkipUpdate) {
    if (-not $Force) {
        Write-Host "HARD STOP: Working tree is dirty. Commit or stash first, or use -Force." -ForegroundColor Red
        Write-Host "Dirty files:" -ForegroundColor Yellow
        $dirtyFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        exit 1
    }
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
        $taFetchStatus = "AVAILABLE"

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
            if ($taFetchStatus -eq "UNAVAILABLE") { $taFetchStatus = "AVAILABLE" }
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

# -- 3d. Consumer-Kit Drift Gate --------------------------------
$driftStatus = "PASS"
$driftClassification = "CURRENT"
$driftNotes = @()

# Factor 1: Kit version currency (from 3c)
if ($kitLagResult -eq "WARN(lag)") {
    $driftStatus = "WARN"
    $driftClassification = "STALE"
    $driftNotes += "Kit version lag: local $kitVersion vs remote $kitVersionRemote"
} elseif ($kitLagResult -eq "WARN(unavailable)") {
    $driftStatus = "WARN"
    $driftNotes += "Remote kit version unavailable — cannot confirm currency"
}

# Factor 2: Sentinel file integrity (committed divergence detection)
# Only meaningful when version matches (or pull just completed) AND remote ref available
$sentinelRef = $null
if ($kitRemoteName) {
    $sentinelRef = "$kitRemoteName/main"
} elseif ($lagRef -and $lagRef -ne "(unavailable)") {
    $sentinelRef = $lagRef
}

if ($sentinelRef -and ($kitLagResult -eq "OK" -or $kitUpdateResult -eq "DONE")) {
    $sentinelFiles = @("VIBE-CODING.VERSION.md", "protocol/protocol-v7.md", "protocol-lite.md")
    $divergentFiles = @()
    foreach ($sf in $sentinelFiles) {
        try {
            $localBlob = (git rev-parse "HEAD:${subtreePrefix}/$sf" 2>$null) | Out-String
            $localBlob = $localBlob.Trim()
            $remoteBlob = (git rev-parse "${sentinelRef}:$sf" 2>$null) | Out-String
            $remoteBlob = $remoteBlob.Trim()
            if ($localBlob -and $remoteBlob -and $localBlob -ne $remoteBlob) {
                $divergentFiles += $sf
            }
        } catch { }
    }
    if ($divergentFiles.Count -gt 0) {
        $driftStatus = "BLOCKED"
        $driftClassification = "DIVERGENT"
        $driftNotes += "Sentinel files differ from kit source: $($divergentFiles -join ', ')"
    }
}

# Factor 3: Required consumer wiring
$overlayIdxPath = Join-Path $repoRoot "$docsRoot/overlays/OVERLAY-INDEX.md"
if (-not (Test-Path $overlayIdxPath)) {
    if ($driftStatus -ne "BLOCKED") { $driftStatus = "WARN" }
    $driftNotes += "Missing consumer wiring: $docsRoot/overlays/OVERLAY-INDEX.md"
}

Write-Host ""
Write-Host "--- Consumer-Kit Drift Gate ---" -ForegroundColor Cyan
Write-Host ("  Classification : {0}" -f $driftClassification) -ForegroundColor $(if ($driftClassification -eq 'CURRENT') { 'Green' } elseif ($driftClassification -eq 'STALE') { 'Yellow' } else { 'Red' })
Write-Host ("  Drift Status   : {0}" -f $driftStatus) -ForegroundColor $(if ($driftStatus -eq 'PASS') { 'Green' } elseif ($driftStatus -eq 'WARN') { 'Yellow' } else { 'Red' })
foreach ($note in $driftNotes) { Write-Host "    -> $note" -ForegroundColor Yellow }

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

# -- 5b. NEXT.md date + ResearchIndex drift warning -----------
$nextDate = $null
$nextCandidate = Join-Path $repoRoot "$docsRoot/project/NEXT.md"
if (Test-Path $nextCandidate) {
    $nextContent = Get-Content $nextCandidate -Raw
    if ($nextContent -match 'Last [Uu]pdated:\s*(\d{4}-\d{2}-\d{2})') {
        $nextDate = [datetime]::ParseExact($Matches[1], 'yyyy-MM-dd', $null)
    }
}

$riDateParsed = $null
if ($riDate -ne "MISSING") {
    try { $riDateParsed = [datetime]::ParseExact($riDate, 'yyyy-MM-dd', $null) } catch { }
}

if ($nextDate -and $riDateParsed -and $riDateParsed -gt $nextDate) {
    Write-Host "WARNING: ResearchIndex.md ($riDate) is newer than NEXT.md ($($nextDate.ToString('yyyy-MM-dd'))); review whether NEXT.md should be updated." -ForegroundColor Yellow
}

# -- 5c. Staleness Expiry Gate (PAUSE.md freshness) ------------
$stalenessStatus = "PASS"
$stalenessClassification = "N/A"
$stalenessAge = -1
$stalenessNotes = @()

# Locate consumer PAUSE.md (not the kit template)
$pausePath = $null
$pauseCandidates = @(
    (Join-Path $repoRoot "PAUSE.md"),
    (Join-Path $repoRoot (Join-Path $docsRoot "PAUSE.md"))
)
foreach ($candidate in $pauseCandidates) {
    if (Test-Path $candidate) {
        $pausePath = $candidate
        break
    }
}

if ($pausePath) {
    $pauseContent = Get-Content $pausePath -Raw
    if ($pauseContent -match '\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})') {
        $pauseDate = [datetime]::ParseExact($Matches[1], 'yyyy-MM-dd', $null)
        $stalenessAge = ([datetime]::Today - $pauseDate).Days

        if ($stalenessAge -le 7) {
            $stalenessStatus = "PASS"
            $stalenessClassification = "CURRENT"
        } elseif ($stalenessAge -le 30) {
            $stalenessStatus = "WARN"
            $stalenessClassification = "STALE"
            $stalenessNotes += "PAUSE.md is $stalenessAge days old — review and confirm handoff state before relying on it"
        } else {
            $stalenessStatus = "BLOCKED"
            $stalenessClassification = "EXPIRED"
            $stalenessNotes += "PAUSE.md is $stalenessAge days old (>30 days) — re-verify all handoff state before proceeding"
        }
    } elseif ($pauseContent -match 'YYYY-MM-DD') {
        # Unpopulated template — no active handoff state
        $stalenessClassification = "TEMPLATE"
        $stalenessNotes += "PAUSE.md contains template placeholder — no active handoff state to check"
    } else {
        $stalenessStatus = "WARN"
        $stalenessClassification = "UNKNOWN"
        $stalenessNotes += "PAUSE.md found but no parseable Date field"
    }
} else {
    $stalenessNotes += "No PAUSE.md found — staleness check skipped"
}

# -- NEXT.md staleness (Covered Artifact: NEXT.md active step) --
$nextmdStalenessClassification = "N/A"
$nextmdStalenessAge = -1
$nextmdStalenessRelPath = "$docsRoot/project/NEXT.md"
$nextmdStalenessFullPath = Join-Path $repoRoot $nextmdStalenessRelPath

if (Test-Path $nextmdStalenessFullPath) {
    try {
        $nextmdLastCommitRaw = (git log -1 --format="%ci" -- $nextmdStalenessRelPath 2>$null) | Out-String
        $nextmdLastCommitRaw = $nextmdLastCommitRaw.Trim()
        if ($nextmdLastCommitRaw -match '^\d{4}-\d{2}-\d{2}') {
            $nextmdCommitDate = [datetime]::ParseExact($nextmdLastCommitRaw.Substring(0, 10), 'yyyy-MM-dd', $null)
            $nextmdStalenessAge = ([datetime]::Today - $nextmdCommitDate).Days

            if ($nextmdStalenessAge -le 7) {
                $nextmdStalenessClassification = "CURRENT"
            } elseif ($nextmdStalenessAge -le 21) {
                $nextmdStalenessClassification = "STALE"
                if ($stalenessStatus -ne "BLOCKED") { $stalenessStatus = "WARN" }
                $stalenessNotes += "NEXT.md last committed $nextmdStalenessAge days ago — review Immediate Next Steps before trusting"
            } else {
                $nextmdStalenessClassification = "EXPIRED"
                $stalenessStatus = "BLOCKED"
                $stalenessNotes += "NEXT.md last committed $nextmdStalenessAge days ago (>21 days) — re-verify active step before proceeding"
            }
        } else {
            $nextmdStalenessClassification = "UNKNOWN"
            $stalenessNotes += "NEXT.md exists but no git commit history found"
        }
    } catch {
        $nextmdStalenessClassification = "UNKNOWN"
        $stalenessNotes += "NEXT.md: could not determine last commit date"
    }
} else {
    $stalenessNotes += "No NEXT.md found at $nextmdStalenessRelPath — NEXT.md staleness check skipped"
}

Write-Host ""
Write-Host "--- Staleness Expiry Gate ---" -ForegroundColor Cyan
Write-Host ("  PAUSE.md       : {0}" -f $stalenessClassification) -ForegroundColor $(if ($stalenessClassification -eq 'CURRENT' -or $stalenessClassification -eq 'N/A' -or $stalenessClassification -eq 'TEMPLATE') { 'Green' } elseif ($stalenessClassification -eq 'STALE') { 'Yellow' } else { 'Red' })
if ($stalenessAge -ge 0) { Write-Host ("  PAUSE.md Age   : {0} day(s)" -f $stalenessAge) -ForegroundColor $(if ($stalenessAge -le 7) { 'Green' } elseif ($stalenessAge -le 30) { 'Yellow' } else { 'Red' }) }
Write-Host ("  NEXT.md        : {0}" -f $nextmdStalenessClassification) -ForegroundColor $(if ($nextmdStalenessClassification -eq 'CURRENT' -or $nextmdStalenessClassification -eq 'N/A') { 'Green' } elseif ($nextmdStalenessClassification -eq 'STALE') { 'Yellow' } else { 'Red' })
if ($nextmdStalenessAge -ge 0) { Write-Host ("  NEXT.md Age    : {0} day(s)" -f $nextmdStalenessAge) -ForegroundColor $(if ($nextmdStalenessAge -le 7) { 'Green' } elseif ($nextmdStalenessAge -le 21) { 'Yellow' } else { 'Red' }) }
Write-Host ("  Staleness      : {0}" -f $stalenessStatus) -ForegroundColor $(if ($stalenessStatus -eq 'PASS') { 'Green' } elseif ($stalenessStatus -eq 'WARN') { 'Yellow' } else { 'Red' })
foreach ($note in $stalenessNotes) { Write-Host "    -> $note" -ForegroundColor Yellow }

# -- 5d. Decision-Queue Gate (PAUSE.md decision items) ---------
$dqStatus = "PASS"
$dqCount = 0
$dqMalformed = 0
$dqOldestAge = -1
$dqNotes = @()

if ($pausePath -and (Test-Path $pausePath)) {
    $pauseLines = Get-Content $pausePath
    $inDecisionQueue = $false
    $headerParsed = $false
    foreach ($line in $pauseLines) {
        # Detect Decision Queue section start
        if ($line -match '^\s*##\s+Decision Queue') {
            $inDecisionQueue = $true
            continue
        }
        # Detect next section (exit Decision Queue)
        if ($inDecisionQueue -and $line -match '^\s*##\s' -and $line -notmatch 'Decision Queue') {
            break
        }
        if (-not $inDecisionQueue) { continue }
        # Skip header row and separator
        if ($line -match '^\s*\|.*Item.*Decision Owner') { $headerParsed = $true; continue }
        if ($line -match '^\s*\|[\s-:|]+\|?\s*$') { continue }
        # Skip template placeholder rows
        if ($line -match '_\(item label\)_' -or $line -match 'YYYY-MM-DD') { continue }
        # Parse data rows
        if ($headerParsed -and $line -match '^\s*\|') {
            $cells = $line -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
            if ($cells.Count -ge 4) {
                $dqCount++
                $itemLabel = $cells[0]
                $owner = $cells[1]
                $why = $cells[2]
                $dateAdded = $cells[3]
                # Check well-formedness (required fields non-empty)
                if ([string]::IsNullOrWhiteSpace($owner) -or [string]::IsNullOrWhiteSpace($why) -or [string]::IsNullOrWhiteSpace($dateAdded)) {
                    $dqMalformed++
                    $dqNotes += "Malformed: '$itemLabel' missing required field(s)"
                }
                # Check age
                if ($dateAdded -match '^\d{4}-\d{2}-\d{2}$') {
                    try {
                        $itemDate = [datetime]::ParseExact($dateAdded, 'yyyy-MM-dd', $null)
                        $itemAge = ([datetime]::Today - $itemDate).Days
                        if ($itemAge -gt $dqOldestAge) { $dqOldestAge = $itemAge }
                    } catch { }
                }
            } else {
                $dqCount++
                $dqMalformed++
                $dqNotes += "Malformed: row has fewer than 4 columns"
            }
        }
    }

    # Determine verdict
    if ($dqCount -eq 0) {
        $dqStatus = "PASS"
    } else {
        # Count thresholds
        if ($dqCount -gt 5) { $dqStatus = "BLOCKED"; $dqNotes += "DECISION NEEDED count ($dqCount) exceeds cap of 5" }
        elseif ($dqCount -gt 3) { if ($dqStatus -ne "BLOCKED") { $dqStatus = "WARN" }; $dqNotes += "DECISION NEEDED count ($dqCount) elevated (cap: 3)" }
        # Malformed thresholds
        if ($dqMalformed -ge 2) { $dqStatus = "BLOCKED"; $dqNotes += "$dqMalformed malformed item(s) — BLOCKED" }
        elseif ($dqMalformed -eq 1 -and $dqStatus -ne "BLOCKED") { $dqStatus = "WARN" }
        # Age thresholds
        if ($dqOldestAge -gt 30) { $dqStatus = "BLOCKED"; $dqNotes += "Oldest item is $dqOldestAge days old (>30) — BLOCKED" }
        elseif ($dqOldestAge -gt 14 -and $dqStatus -ne "BLOCKED") { $dqStatus = "WARN"; $dqNotes += "Oldest item is $dqOldestAge days old (>14) — review needed" }
    }
} else {
    $dqNotes += "No PAUSE.md found — decision-queue check skipped"
}

Write-Host ""
Write-Host "--- Decision-Queue Gate ---" -ForegroundColor Cyan
Write-Host ("  Items          : {0}" -f $dqCount) -ForegroundColor $(if ($dqCount -le 3) { 'Green' } elseif ($dqCount -le 5) { 'Yellow' } else { 'Red' })
Write-Host ("  Malformed      : {0}" -f $dqMalformed) -ForegroundColor $(if ($dqMalformed -eq 0) { 'Green' } elseif ($dqMalformed -eq 1) { 'Yellow' } else { 'Red' })
Write-Host ("  DecisionQueue  : {0}" -f $dqStatus) -ForegroundColor $(if ($dqStatus -eq 'PASS') { 'Green' } elseif ($dqStatus -eq 'WARN') { 'Yellow' } else { 'Red' })
if ($dqOldestAge -ge 0) { Write-Host ("  Oldest Item    : {0} day(s)" -f $dqOldestAge) -ForegroundColor $(if ($dqOldestAge -le 14) { 'Green' } elseif ($dqOldestAge -le 30) { 'Yellow' } else { 'Red' }) }
foreach ($note in $dqNotes) { Write-Host "    -> $note" -ForegroundColor Yellow }

# -- 6. Open PRs ----------------------------------------------
$prCount = "UNKNOWN"
$prList = "gh CLI not available"
try {
    $ghVersion = gh --version 2>$null
    if ($ghVersion) {
        $taGhStatus = "AVAILABLE"
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
    # gh not available or auth issue
    if ($taGhStatus -eq "AVAILABLE") { $taGhStatus = "DEGRADED" }
}

# -- 6b. Tool/Auth Fragility Gate ------------------------------
$taStatus = "PASS"
$taNotes = @()

if ($taGhStatus -ne "AVAILABLE") {
    $taNotes += "gh CLI: $taGhStatus — PR count and Remote Reality may be unverifiable"
}
if ($taFetchStatus -ne "AVAILABLE") {
    $taNotes += "git fetch: $taFetchStatus — remote-dependent checks use stale or missing refs"
}

# Determine verdict: BLOCKED only if a degraded tool's effect is not already reflected
# In session-start context, gh unavailability is reflected in OpenPRs=UNKNOWN (informational, no gate)
# Fetch unavailability is reflected in kitLag WARN(unavailable) and drift WARN
# So typically WARN, not BLOCKED — unless future gates claim PASS despite tool absence
if ($taGhStatus -eq "AVAILABLE" -and $taFetchStatus -eq "AVAILABLE") {
    $taStatus = "PASS"
} elseif ($taNotes.Count -gt 0) {
    $taStatus = "WARN"
}

Write-Host ""
Write-Host "--- Tool/Auth Fragility Gate ---" -ForegroundColor Cyan
Write-Host ("  gh CLI         : {0}" -f $taGhStatus) -ForegroundColor $(if ($taGhStatus -eq 'AVAILABLE') { 'Green' } elseif ($taGhStatus -eq 'DEGRADED') { 'Yellow' } else { 'Red' })
Write-Host ("  git fetch      : {0}" -f $taFetchStatus) -ForegroundColor $(if ($taFetchStatus -eq 'AVAILABLE') { 'Green' } elseif ($taFetchStatus -eq 'DEGRADED') { 'Yellow' } else { 'Red' })
Write-Host ("  ToolAuth       : {0}" -f $taStatus) -ForegroundColor $(if ($taStatus -eq 'PASS') { 'Green' } elseif ($taStatus -eq 'WARN') { 'Yellow' } else { 'Red' })
foreach ($note in $taNotes) { Write-Host "    -> $note" -ForegroundColor Yellow }

# -- 6c. Visibility Contract surfacing -------------------------
$vcStatus = "NOT_FOUND"
$vcFields = @{}
$vcFile = $null

# Locate visibility-contract overlay in consumer repo
if ($docsRoot) {
    $vcRelative = Join-Path $docsRoot "overlays/visibility-contract.md"
    $vcCandidate = Join-Path $repoRoot $vcRelative
    if (Test-Path $vcCandidate) { $vcFile = $vcCandidate }
}

if ($vcFile) {
    # Parse markdown table rows: | **field_name** | value |
    $vcPlaceholderPattern = 'TODO|TBD|PLACEHOLDER|FILL|TEMPLATE|example\.com|example\.org'
    foreach ($line in (Get-Content $vcFile -ErrorAction SilentlyContinue)) {
        if ($line -match '^\|\s*\*{0,2}(\w+)\*{0,2}\s*\|\s*(.+?)\s*\|?\s*$') {
            $fName  = $Matches[1].Trim()
            $fValue = $Matches[2].Trim().Trim('`').Trim()
            # Skip header row and empty/placeholder values
            if ($fName -eq 'Field' -or $fName -eq 'Required') { continue }
            if (-not $fValue) { continue }
            if ($fValue -match '<[^>]+>') { continue }           # template variable
            if ($fValue -match $vcPlaceholderPattern) { continue } # placeholder token
            $vcFields[$fName] = $fValue
        }
    }
    if ($vcFields.Count -gt 0) {
        $vcStatus = "OK"
    } else {
        $vcStatus = "UNPOPULATED"
    }
}

Write-Host ""
if ($vcStatus -eq "OK") {
    Write-Host "--- Visibility Links ---" -ForegroundColor Cyan
    foreach ($entry in $vcFields.GetEnumerator()) {
        Write-Host ("  {0} : {1}" -f $entry.Key, $entry.Value)
    }
} elseif ($vcStatus -eq "UNPOPULATED") {
    Write-Host "  Visibility: overlay found but no values populated — see templates/visibility-contract-overlay.example.md" -ForegroundColor DarkGray
} else {
    Write-Host "  Visibility: no overlay at <DOCS_ROOT>/overlays/visibility-contract.md — see templates/visibility-contract-overlay.example.md" -ForegroundColor DarkGray
}

# -- 6d. PROJECT-STATE-SUMMARY.md generation (consumer only) ----
$pssStatus = "SKIP"
$pssForGptDir = Join-Path $repoRoot "$docsRoot/forGPT"
if (Test-Path $pssForGptDir) {
    $pssPath = Join-Path $pssForGptDir "PROJECT-STATE-SUMMARY.md"

    if ($WhatIf) {
        Write-Host "[WhatIf] Would generate: $docsRoot/forGPT/PROJECT-STATE-SUMMARY.md" -ForegroundColor Cyan
        $pssStatus = "SKIP(WhatIf)"
    } else {
        try {
            # -- Gather additional data --

            # Recent commits (last 5)
            $pssCommits = @()
            try { $pssCommits = @(git log --oneline -5 2>$null) } catch { }

            # Parse NEXT.md for active story + next step
            $pssActiveStory = $null
            $pssNextStep = $null
            if ($nextCandidate -and (Test-Path $nextCandidate)) {
                $pssNextLines = Get-Content $nextCandidate
                $pssSection = $null
                foreach ($pssLine in $pssNextLines) {
                    if ($pssLine -match '^\s*##\s+.*\b(Active|Current)\b.*\b(Story|Lane)\b') {
                        $pssSection = "story"; continue
                    }
                    if ($pssLine -match '^\s*##\s+.*\b(Immediate|Next)\b.*\b(Step|Action)\b') {
                        $pssSection = "nextstep"; continue
                    }
                    if ($pssLine -match '^\s*##\s') { $pssSection = $null; continue }
                    $pssTrimmed = $pssLine.Trim()
                    if ($pssSection -and $pssTrimmed -and $pssTrimmed -notmatch '^[\|+-]') {
                        if ($pssSection -eq "story" -and -not $pssActiveStory) {
                            $pssActiveStory = $pssTrimmed -replace '^[-*]\s*', ''
                        }
                        if ($pssSection -eq "nextstep" -and -not $pssNextStep) {
                            $pssNextStep = $pssTrimmed -replace '^[-*]\s*', ''
                        }
                    }
                }
            }
            if (-not $pssActiveStory) { $pssActiveStory = "(see NEXT.md)" }
            if (-not $pssNextStep) { $pssNextStep = "(see NEXT.md)" }

            # Parse PAUSE.md blockers section
            $pssBlockers = @()
            if ($pausePath -and (Test-Path $pausePath)) {
                $pssPauseLines = Get-Content $pausePath
                $pssInBlockers = $false
                foreach ($pssLine in $pssPauseLines) {
                    if ($pssLine -match '^\s*##\s+.*\bBlock') { $pssInBlockers = $true; continue }
                    if ($pssInBlockers -and $pssLine -match '^\s*##\s') { break }
                    $pssTrimmed = $pssLine.Trim()
                    if ($pssInBlockers -and $pssTrimmed -and $pssTrimmed -ne 'None.' -and $pssTrimmed -ne 'None' -and $pssTrimmed -notmatch 'YYYY-MM-DD' -and $pssTrimmed -notmatch '^[\|+-]') {
                        $pssBlockers += $pssTrimmed
                    }
                }
            }

            # -- Build summary content --
            $pssTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
            $pssContent = @()
            $pssRepoName = Split-Path $repoRoot -Leaf
            $pssContent += "# Project State Summary"
            $pssContent += ""
            $pssContent += "> **Project:** $pssRepoName"
            $pssContent += "> **Generated:** $pssTimestamp by session-start.ps1"
            $pssContent += "> **Branch:** $branch | **Tree:** $treeState"
            $pssContent += ""
            $pssContent += "**This is a generated snapshot, not a source of truth.**"
            $pssContent += "Confirm important decisions against NEXT.md and PAUSE.md."
            $pssContent += ""
            $pssContent += "---"
            $pssContent += ""
            $pssContent += "## Active Work"
            $pssContent += ""
            $pssNextAge = if ($nextmdStalenessAge -ge 0) { " ($nextmdStalenessAge days old)" } else { "" }
            $pssContent += "- **NEXT.md:** $nextmdStalenessClassification$pssNextAge"
            $pssContent += "- **Active Story:** $pssActiveStory"
            $pssContent += "- **Next Step:** $pssNextStep"
            $pssContent += "- **Branch:** $branch"
            $pssContent += ""
            $pssContent += "## Session Gates"
            $pssContent += ""
            $pssContent += "| Gate | Verdict |"
            $pssContent += "|------|--------|"
            $pssContent += "| Consumer Audit | $auditResult |"
            $pssContent += "| Consumer-Kit Drift | $driftStatus ($driftClassification) |"
            $pssContent += "| Staleness Expiry | $stalenessStatus (PAUSE=$stalenessClassification, NEXT=$nextmdStalenessClassification) |"
            $pssContent += "| Decision Queue | $dqStatus (items=$dqCount) |"
            $pssContent += "| Tool/Auth | $taStatus |"
            $pssContent += ""
            $pssContent += "## Context"
            $pssContent += ""
            $pssContent += "- **Kit Version:** $kitVersion (Effective $kitEffective)"
            $pssContent += "- **Open PRs:** $prCount -- $prList"
            if ($dqCount -gt 0) {
                $pssContent += "- **Decision Queue Items:** $dqCount"
            }
            $pssContent += ""
            $pssContent += "## Recent Commits"
            $pssContent += ""
            if ($pssCommits.Count -gt 0) {
                foreach ($pssC in $pssCommits) {
                    $pssContent += "- $pssC"
                }
            } else {
                $pssContent += "- (none available)"
            }
            $pssContent += ""
            $pssContent += "## PAUSE State"
            $pssContent += ""
            $pssPauseAge = if ($stalenessAge -ge 0) { " ($stalenessAge days old)" } else { "" }
            $pssContent += "- **Classification:** $stalenessClassification$pssPauseAge"
            if ($pssBlockers.Count -gt 0) {
                $pssContent += "- **Blockers:**"
                foreach ($pssB in $pssBlockers) {
                    $pssContent += "  - $pssB"
                }
            } else {
                $pssContent += "- **Blockers:** None detected"
            }
            $pssContent += ""

            $pssContent | Set-Content -Path $pssPath -Encoding utf8
            if (Test-Path $pssPath) {
                $pssStatus = "GENERATED"
                Write-Host "Generated: $docsRoot/forGPT/PROJECT-STATE-SUMMARY.md" -ForegroundColor Green
            } else {
                $pssStatus = "FAILED(write)"
                Write-Host "WARNING: PROJECT-STATE-SUMMARY.md was not written (check permissions/disk)." -ForegroundColor Yellow
            }
        } catch {
            $pssStatus = "FAILED"
            Write-Host "WARNING: PROJECT-STATE-SUMMARY.md generation failed: $_" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "ProjectStateSummary: SKIP (no forGPT directory at $docsRoot/forGPT)" -ForegroundColor DarkGray
}

# -- 7. Print session audit block ------------------------------
Write-Host ""
Write-Host "========== SESSION START AUDIT ==========" -ForegroundColor Cyan
Write-Host "RepoRoot=$repoRoot | Branch=$branch | Tree=$treeState"
Write-Host "DOCS_ROOT=$docsRoot | Reason=$docsReason"
Write-Host "forGPT=$forGptStatus | VERSION-MANIFEST=$vmDate | Commit=$vmCommit | KitUpdate=$kitUpdateResult"
Write-Host "KitVersion=$kitVersion | Effective=$kitEffective | KitLag=$kitLagResult | ConsumerAudit=$auditResult"
Write-Host "ConsumerDrift=$driftStatus ($driftClassification)"
Write-Host "StalenessExpiry=$stalenessStatus (PAUSE=$stalenessClassification, NEXT=$nextmdStalenessClassification)"
Write-Host "DecisionQueue=$dqStatus (items=$dqCount, malformed=$dqMalformed)"
Write-Host "ToolAuth=$taStatus (gh=$taGhStatus, fetch=$taFetchStatus)"
Write-Host "Visibility=$vcStatus"
if ($pssStatus -match '^FAILED') {
    Write-Host "ProjectStateSummary=$pssStatus  <- WARNING: see above for error details" -ForegroundColor Yellow
} else {
    Write-Host "ProjectStateSummary=$pssStatus"
}
Write-Host "ResearchIndex=$riPath | LastUpdated=$riDate"
Write-Host "OpenPRs=$prCount - $prList"
Write-Host "=========================================" -ForegroundColor Cyan

} finally {
    if ($autoStashed) {
        Write-Host "" -ForegroundColor Yellow
        Write-Host "Restoring auto-stashed changes..." -ForegroundColor Yellow
        try {
            Invoke-GitSafe stash pop
            Write-Host "Auto-stash restored successfully." -ForegroundColor Green
        } catch {
            Write-Host "WARNING: Auto-stash restore failed or had conflicts." -ForegroundColor Red
            Write-Host "Your changes are preserved in stash '$stashName'." -ForegroundColor Yellow
            Write-Host "The kit update may have completed, but your non-subtree changes need manual recovery." -ForegroundColor Yellow
            Write-Host "Recovery steps:" -ForegroundColor Yellow
            Write-Host "  1. git stash show    — review stashed changes" -ForegroundColor Yellow
            Write-Host "  2. git stash pop     — retry applying the stash" -ForegroundColor Yellow
            Write-Host "  3. Resolve any conflicts, then: git stash drop" -ForegroundColor Yellow
        }
    }
    Pop-Location
}
