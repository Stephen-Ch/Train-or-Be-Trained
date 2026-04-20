<#
.SYNOPSIS
    Check protocol-v7.md file size and heading-extraction performance.
.DESCRIPTION
    Resolves protocol-v7.md relative to the kit head (parent of the tools/
    directory where this script lives), so it works whether invoked from the
    kit repo root or from a consumer subtree.
.PARAMETER ProtocolPath
    Path to protocol-v7.md. Default: auto-detected relative to script location.
.EXAMPLE
    .\check-protocol-v7-budget.ps1
#>
param(
    [string]$ProtocolPath
)

# Kit head = parent of tools/ (where this script lives)
$kitHead = Split-Path $PSScriptRoot -Parent

if (-not $ProtocolPath) {
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

$exitCode = 0

if (-not (Test-Path $ProtocolPath)) {
    Write-Host "FAIL: Protocol file not found: $ProtocolPath" -ForegroundColor Red
    exit 1
}

# --- Size check ---
$fileInfo = Get-Item $ProtocolPath
$bytes = $fileInfo.Length
$kb = [math]::Round($bytes / 1024, 1)
$mb = [math]::Round($bytes / (1024 * 1024), 3)

Write-Host "File: $ProtocolPath" -ForegroundColor Gray
Write-Host "Size: $bytes bytes ($kb KB, $mb MB)" -ForegroundColor Gray

$sizeWarn = $bytes -gt (1 * 1024 * 1024)   # > 1.0 MB
$sizeFail = $bytes -gt (2 * 1024 * 1024)   # > 2.0 MB

if ($sizeFail) {
    Write-Host "FAIL: File exceeds 2.0 MB budget" -ForegroundColor Red
    $exitCode = 1
} elseif ($sizeWarn) {
    Write-Host "WARN: File exceeds 1.0 MB (consider splitting)" -ForegroundColor Yellow
} else {
    Write-Host "Size: OK (under 1.0 MB)" -ForegroundColor Green
}

# --- Performance check: read + extract headings ---
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$content = Get-Content $ProtocolPath
$headingCount = 0
foreach ($line in $content) {
    if ($line -match '^#{1,6}\s+') { $headingCount++ }
}
$sw.Stop()

$elapsed = $sw.Elapsed.TotalSeconds
$ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 0)

Write-Host "Headings: $headingCount extracted in ${ms}ms" -ForegroundColor Gray

$perfWarn = $elapsed -gt 2.0   # > 2 seconds
$perfFail = $elapsed -gt 10.0  # > 10 seconds

if ($perfFail) {
    Write-Host "FAIL: Heading extraction took > 10 seconds" -ForegroundColor Red
    $exitCode = 1
} elseif ($perfWarn) {
    Write-Host "WARN: Heading extraction took > 2 seconds" -ForegroundColor Yellow
} else {
    Write-Host "Performance: OK" -ForegroundColor Green
}

# --- Summary ---
Write-Host ""
$lineCount = $content.Count
Write-Host "Summary: $lineCount lines, $headingCount headings, $kb KB, ${ms}ms" -ForegroundColor Gray

if ($exitCode -eq 0) {
    Write-Host "Result: PASS" -ForegroundColor Green
} else {
    Write-Host "Result: FAIL" -ForegroundColor Red
}

exit $exitCode
