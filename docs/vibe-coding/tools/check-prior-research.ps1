<#
.SYNOPSIS
    Prior Research Lookup — search ResearchIndex.md and research/ folder before starting new research.
.DESCRIPTION
    Searches <DOCS_ROOT>/research/ResearchIndex.md and all R-###-*.md files for
    the given search terms. Designed to be called by Copilot/agents BEFORE any
    RESEARCH-ONLY work begins. Returns matching entries with context.

    Exits 0 if matches found, 1 if no matches, 2 on error.
.PARAMETER Terms
    One or more search terms (strings or keywords). Multiple terms are OR'd.
.PARAMETER DocsRoot
    Override DOCS_ROOT detection. When omitted, auto-detects from repo structure.
.PARAMETER Exact
    Use exact (literal) matching instead of regex.
.EXAMPLE
    .\check-prior-research.ps1 -Terms "scoring","NRE"
    .\check-prior-research.ps1 -Terms "affixing" -Exact
    .\check-prior-research.ps1 -Terms "hot file" -DocsRoot docs-engineering
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string[]]$Terms,

    [string]$DocsRoot,

    [switch]$Exact
)

$ErrorActionPreference = "Stop"

# -- 0. Repo root ------------------------------------------------
try {
    $repoRoot = (git rev-parse --show-toplevel 2>&1) -replace '/', '\'
} catch {
    Write-Error "HARD STOP: Not inside a git repository."
    exit 2
}

# -- 1. Detect DOCS_ROOT -----------------------------------------
if (-not $DocsRoot) {
    $deDir = Join-Path $repoRoot "docs-engineering"
    $docsDir = Join-Path $repoRoot "docs"

    if ((Test-Path $deDir) -and
        ((Test-Path (Join-Path $deDir "vibe-coding")) -or
         (Test-Path (Join-Path $deDir "research")))) {
        $DocsRoot = "docs-engineering"
    } elseif (Test-Path $docsDir) {
        $DocsRoot = "docs"
    } else {
        Write-Error "HARD STOP: Cannot detect DOCS_ROOT. Use -DocsRoot parameter."
        exit 2
    }
}

$researchDir = Join-Path $repoRoot "$DocsRoot/research"
$indexFile   = Join-Path $researchDir "ResearchIndex.md"

# -- 2. Validate paths -------------------------------------------
if (-not (Test-Path $researchDir)) {
    Write-Host "INFO: Research directory not found: $DocsRoot/research/"
    Write-Host "  No prior research exists. Proceeding with new research is valid."
    Write-Host ""
    Write-Host "RESULT: NO PRIOR RESEARCH (directory missing)"
    exit 1
}

$hasIndex = Test-Path $indexFile
$researchFiles = @(Get-ChildItem -Path $researchDir -Filter "*.md" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "ResearchIndex.md" })

Write-Host "===== PRIOR RESEARCH LOOKUP ====="
Write-Host "DOCS_ROOT:      $DocsRoot"
Write-Host "Research dir:   $DocsRoot/research/"
Write-Host "Index exists:   $hasIndex"
Write-Host "Research files: $($researchFiles.Count)"
Write-Host "Search terms:   $($Terms -join ', ')"
Write-Host ""

# -- 3. Build search pattern -------------------------------------
if ($Exact) {
    $patterns = $Terms | ForEach-Object { [regex]::Escape($_) }
} else {
    $patterns = $Terms
}
$combinedPattern = ($patterns -join '|')

# -- 4. Search index first ---------------------------------------
$indexMatches = @()
if ($hasIndex) {
    $indexMatches = @(Select-String -Path $indexFile -Pattern $combinedPattern -AllMatches -ErrorAction SilentlyContinue)
}

# -- 5. Search all research files --------------------------------
$fileMatches = @()
if ($researchFiles.Count -gt 0) {
    $fileMatches = @($researchFiles | ForEach-Object {
        Select-String -Path $_.FullName -Pattern $combinedPattern -AllMatches -ErrorAction SilentlyContinue
    })
}

$totalMatches = $indexMatches.Count + $fileMatches.Count

# -- 6. Report results -------------------------------------------
if ($totalMatches -eq 0) {
    Write-Host "No matches found for: $($Terms -join ', ')"
    Write-Host ""
    Write-Host "RESULT: NO PRIOR RESEARCH FOUND"
    Write-Host ""
    Write-Host "Paste into your research output:"
    Write-Host "  ## Prior Research Lookup"
    Write-Host "  Search: ``$($Terms -join ', ')``"
    Write-Host "  Command: ``.\tools\check-prior-research.ps1 -Terms $($Terms | ForEach-Object { "`"$_`"" } | Join-String -Separator ',')``"
    Write-Host "  Result: No relevant prior research found."
    exit 1
}

Write-Host "--- Index Matches ($($indexMatches.Count)) ---"
if ($indexMatches.Count -gt 0) {
    $indexMatches | ForEach-Object {
        Write-Host "  L$($_.LineNumber): $($_.Line.Trim())"
    }
} else {
    Write-Host "  (none)"
}
Write-Host ""

Write-Host "--- Research File Matches ($($fileMatches.Count)) ---"
if ($fileMatches.Count -gt 0) {
    $grouped = $fileMatches | Group-Object { Split-Path $_.Path -Leaf }
    foreach ($group in $grouped) {
        Write-Host "  [$($group.Name)] ($($group.Count) match(es))"
        $group.Group | Select-Object -First 5 | ForEach-Object {
            Write-Host "    L$($_.LineNumber): $($_.Line.Trim())"
        }
        if ($group.Count -gt 5) {
            Write-Host "    ... and $($group.Count - 5) more"
        }
    }
} else {
    Write-Host "  (none)"
}

# -- 7. Extract document IDs from matches -------------------------
Write-Host ""
$allMatchLines = ($indexMatches + $fileMatches) | ForEach-Object { $_.Line }
$docIds = @($allMatchLines | Select-String -Pattern '\b(R-\d{3}|REPORT-[A-Z0-9-]+|POLICY-[A-Z0-9-]+)' -AllMatches |
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique)

if ($docIds.Count -gt 0) {
    Write-Host "Referenced document IDs: $($docIds -join ', ')"
    Write-Host "READ THESE before starting new research."
}

Write-Host ""
Write-Host "RESULT: $totalMatches MATCH(ES) FOUND — review before proceeding"
Write-Host ""
Write-Host "Paste into your research output:"
Write-Host "  ## Prior Research Lookup"
Write-Host "  Search: ``$($Terms -join ', ')``"
Write-Host "  Command: ``.\tools\check-prior-research.ps1 -Terms $($Terms | ForEach-Object { "`"$_`"" } | Join-String -Separator ',')``"
Write-Host "  Result: $totalMatches match(es). Reviewed: $($docIds -join ', ')"
exit 0
