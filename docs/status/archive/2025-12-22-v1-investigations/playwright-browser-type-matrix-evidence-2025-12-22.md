# Playwright Browser-Type Matrix Evidence

**PROMPT-ID:** TD-RAWLS-001-BROWSER-TYPE-MATRIX-EVIDENCE-001  
**Date:** 2025-12-22T14:42 UTC  
**Machine:** Windows 11 Home, Dell XPS 15 9530, Intel Arc A370M, Node v20.19.5  
**Playwright:** 1.57.0 (@playwright/test → playwright)

## Hypothesis Under Test

Is the page API hang specific to **Chromium** (and possibly related to Intel Arc GPU/driver), or does it affect **all browser engines**?

## Preconditions Verified

| Check                       | Result                          |
| --------------------------- | ------------------------------- |
| Node version                | v20.19.5                        |
| npm version                 | 10.8.2                          |
| @playwright/test version    | 1.57.0                          |
| playwright version          | 1.57.0                          |
| chromium installed          | chromium-1200 ✅                |
| firefox installed           | firefox-1497 ✅ (freshly added) |
| webkit installed            | webkit-2227 ✅ (freshly added)  |

## Test Matrix

| Browser  | launch | newPage | setContent | evaluate | goto about:blank |
| -------- | ------ | ------- | ---------- | -------- | ---------------- |
| Chromium | ✅ PASS | ✅ PASS | ❌ TIMEOUT  | ❌ TIMEOUT | ❌ TIMEOUT        |
| Firefox  | ✅ PASS | ✅ PASS | ❌ TIMEOUT  | ❌ TIMEOUT | ❌ TIMEOUT        |
| WebKit   | ✅ PASS | ✅ PASS | ❌ TIMEOUT  | ❌ TIMEOUT | ❌ TIMEOUT        |

## Timestamps (from DEBUG=pw:api)

### Chromium
```
14:42:15.150 browserType.launch succeeded
14:42:15.921 browser.newPage succeeded
14:42:15.923 page.setContent started
14:42:16.348 "networkidle" event fired  ← browser side progressed
14:42:30.935 page.evaluate started      ← ~15s timeout
```

### Firefox
```
14:43:02.045 browserType.launch succeeded
14:43:03.199 browser.newPage succeeded
14:43:03.200 page.setContent started
14:43:18.215 page.evaluate started      ← ~15s timeout
```

### WebKit
```
14:43:48.775 browserType.launch succeeded
14:43:49.365 browser.newPage succeeded
14:43:49.365 page.setContent started
14:43:49.658 "networkidle" event fired  ← browser side progressed
14:44:04.367 page.evaluate started      ← ~15s timeout
```

## Interpretation

1. **All three engines** (Chromium, Firefox, WebKit) exhibit the **identical failure pattern**
2. **Rules out**: Chromium-specific bug, Intel Arc GPU driver, GPU acceleration issues
3. **Browser process launches successfully** — confirmed by `launch succeeded`
4. **Page object created successfully** — confirmed by `newPage succeeded`
5. **Page navigation events fire** — "commit", "domcontentloaded", "load", "networkidle"
6. **Node.js never receives responses** — promises never resolve, only our timeout catches them

## Root Cause Narrows To

The hang occurs in the **Playwright ↔ Browser communication layer** (CDP for Chromium, custom protocol for Firefox/WebKit). Possible causes:

| Possibility | Notes |
| ----------- | ----- |
| Windows firewall / Defender blocking IPC | Rare but possible; all 3 use different ports |
| Antivirus real-time scanning intercepting pipes | Windows Defender is active |
| Named pipe or socket exhaustion | Unlikely; machine is developer workstation |
| Node.js event loop blocked | Would affect launch/newPage too |
| Playwright bug on this Windows version | Version 1.57.0 is very recent |

## Recommended Next Steps

1. **Try headless: false** — Sometimes headed mode uses different IPC paths
2. **Check Windows Defender exclusions** — Add `%LOCALAPPDATA%\ms-playwright` to exclusions
3. **Test on another Windows machine** — Isolate to this specific system
4. **Downgrade Playwright** — Try 1.56.x or 1.55.x to rule out regression
5. **Open Playwright GitHub issue** — Reproducible across all browsers = likely bug

## Raw Log

See [playwright-browser-type-matrix-pwapi-2025-12-22.log](playwright-browser-type-matrix-pwapi-2025-12-22.log)

---
*This is evidence-only. No code changes made.*
