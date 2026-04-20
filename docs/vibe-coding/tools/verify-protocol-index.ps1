<#
.SYNOPSIS
    Verify protocol index links resolve to valid protocol-v7 headings.
.DESCRIPTION
    Resolves protocol-v7.md and PROTOCOL-INDEX.md relative to the kit head
    (parent of the tools/ directory where this script lives), so it works
    whether invoked from the kit repo root or from a consumer subtree.
.PARAMETER ProtocolPath
    Path to protocol-v7.md. Default: auto-detected relative to script location.
.PARAMETER IndexPath
    Path to PROTOCOL-INDEX.md. Default: auto-detected relative to script location.
.EXAMPLE
    .\verify-protocol-index.ps1
    .\verify-protocol-index.ps1 -ProtocolPath custom/protocol.md -IndexPath custom/INDEX.md
#>
param(
    [string]$ProtocolPath,
    [string]$IndexPath
)

# Kit head = parent of tools/ (where this script lives)
$kitHead = Split-Path $PSScriptRoot -Parent

if (-not $ProtocolPath) {
    # Try two candidate locations relative to kit head
    $candidate1 = Join-Path $kitHead "protocol\protocol-v7.md"
    $candidate2 = Join-Path $kitHead "protocol-v7.md"
    if (Test-Path $candidate1) {
        $ProtocolPath = $candidate1
    } elseif (Test-Path $candidate2) {
        $ProtocolPath = $candidate2
    } else {
        Write-Host "FAIL: Cannot find protocol-v7.md. Checked:" -ForegroundColor Red
        Write-Host "  $candidate1" -ForegroundColor Red
        Write-Host "  $candidate2" -ForegroundColor Red
        Write-Host "  PSScriptRoot: $PSScriptRoot" -ForegroundColor Red
        Write-Host "  Pass -ProtocolPath explicitly." -ForegroundColor Red
        exit 1
    }
}

if (-not $IndexPath) {
    $candidate1 = Join-Path $kitHead "protocol\PROTOCOL-INDEX.md"
    $candidate2 = Join-Path $kitHead "PROTOCOL-INDEX.md"
    if (Test-Path $candidate1) {
        $IndexPath = $candidate1
    } elseif (Test-Path $candidate2) {
        $IndexPath = $candidate2
    } else {
        Write-Host "FAIL: Cannot find PROTOCOL-INDEX.md. Checked:" -ForegroundColor Red
        Write-Host "  $candidate1" -ForegroundColor Red
        Write-Host "  $candidate2" -ForegroundColor Red
        Write-Host "  PSScriptRoot: $PSScriptRoot" -ForegroundColor Red
        Write-Host "  Pass -IndexPath explicitly." -ForegroundColor Red
        exit 1
    }
}

$exitCode = 0
$warnCount = 0

# --- Check A: Both files exist ---
if (-not (Test-Path $ProtocolPath)) {
    Write-Host "FAIL: Protocol file not found: $ProtocolPath" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $IndexPath)) {
    Write-Host "FAIL: Index file not found: $IndexPath" -ForegroundColor Red
    exit 1
}

Write-Host "Protocol: $ProtocolPath" -ForegroundColor Gray
Write-Host "Index:    $IndexPath" -ForegroundColor Gray
Write-Host ""

# --- Check B: Extract anchors from index ---
$indexContent = Get-Content $IndexPath
$anchors = @()
foreach ($line in $indexContent) {
    # Match markdown links like (protocol-v7.md#some-anchor)
    $matches2 = [regex]::Matches($line, '\(protocol-v7\.md#([^)]+)\)')
    foreach ($m in $matches2) {
        $anchors += $m.Groups[1].Value
    }
}

if ($anchors.Count -eq 0) {
    Write-Host "WARN: No protocol-v7 anchors found in index file." -ForegroundColor Yellow
    $warnCount++
} else {
    Write-Host "Found $($anchors.Count) anchor link(s) in index." -ForegroundColor Gray
}

# --- Check C: Extract headings from protocol-v7.md and compute slugs ---
$protocolContent = Get-Content $ProtocolPath
$headings = @()
foreach ($line in $protocolContent) {
    if ($line -match '^#{1,6}\s+(.+)$') {
        $headings += $Matches[1].Trim()
    }
}

# Compute GitHub-style slug: lowercase, spaces to -, strip most punctuation,
# collapse consecutive dashes, handle duplicates with -1, -2, etc.
function ConvertTo-GithubSlug {
    param([string]$heading)
    $slug = $heading.ToLower()
    # Remove characters that GitHub strips (keep letters, digits, spaces, hyphens)
    $slug = $slug -replace '[^a-z0-9 \-]', ''
    # Each space becomes a hyphen (do NOT collapse multiple spaces)
    $slug = $slug -replace ' ', '-'
    # Note: GitHub does NOT collapse consecutive hyphens (e.g., from / or em-dash)
    # Trim leading/trailing hyphens
    $slug = $slug.Trim('-')
    return $slug
}

$slugCounts = @{}
$slugSet = @{}
foreach ($h in $headings) {
    $base = ConvertTo-GithubSlug $h
    if ($slugCounts.ContainsKey($base)) {
        $slugCounts[$base]++
        $final = "$base-$($slugCounts[$base] - 1)"
    } else {
        $slugCounts[$base] = 1
        $final = $base
    }
    $slugSet[$final] = $h
}

# --- Check D: Validate each anchor ---
$passCount = 0
$failAnchors = @()

foreach ($anchor in $anchors) {
    if ($slugSet.ContainsKey($anchor)) {
        $passCount++
    } else {
        $failAnchors += $anchor
        $warnCount++
    }
}

Write-Host ""
Write-Host "Anchor validation: $passCount PASS, $($failAnchors.Count) WARN" -ForegroundColor $(if ($failAnchors.Count -gt 0) { 'Yellow' } else { 'Green' })

foreach ($bad in $failAnchors) {
    # Find closest match (simple: check if any slug starts with the anchor or vice versa)
    $closest = ""
    $bestLen = 0
    foreach ($slug in $slugSet.Keys) {
        # Longest common prefix
        $len = 0
        $minLen = [Math]::Min($bad.Length, $slug.Length)
        for ($i = 0; $i -lt $minLen; $i++) {
            if ($bad[$i] -eq $slug[$i]) { $len++ } else { break }
        }
        if ($len -gt $bestLen) {
            $bestLen = $len
            $closest = $slug
        }
    }
    $suggestion = if ($closest) { " (closest: $closest)" } else { "" }
    Write-Host "  WARN: Anchor '$bad' not found in protocol-v7 headings$suggestion" -ForegroundColor Yellow
}

Write-Host ""
if ($warnCount -gt 0) {
    Write-Host "Result: PASS with $warnCount warning(s)" -ForegroundColor Yellow
} else {
    Write-Host "Result: PASS -- all $passCount anchors validated" -ForegroundColor Green
}

exit $exitCode
