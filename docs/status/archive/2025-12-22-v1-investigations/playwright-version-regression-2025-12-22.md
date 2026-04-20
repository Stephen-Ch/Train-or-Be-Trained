# Playwright Version Regression Test

**PROMPT-ID:** TD-RAWLS-001-PLAYWRIGHT-VERSION-REGRESSION-001  
**Date:** 2025-12-22  
**Purpose:** Test if Playwright 1.56.x works while 1.57.0 hangs (version regression hypothesis)

## Test Location

C:\Users\schur\AppData\Local\Temp\pw-version-regression-2025-12-22

## Environment

- Node version: v20.19.5
- Node path: C:\Program Files\nodejs\node.exe
- npm version: 10.8.2

## Playwright Version Installed

playwright@1.56.1 (via npm i playwright@1.56.1)

## Browser Install

npx playwright install — SUCCESS (browsers already cached)

## Test Script

node -e "... p.setContent(...) with 10s timeout ... console.log('PW156_OK')"

## Result

**HANG** — Script hung for 2+ minutes before operator cancelled.

Same symptom as Playwright 1.57.0:
- chromium.launch() succeeds
- browser.newPage() succeeds
- page.setContent() HANGS indefinitely

## Interpretation

| Hypothesis | Result |
| ---------- | ------ |
| Playwright 1.57.0 regression | **RULED OUT** — 1.56.1 has identical hang |
| Version-specific bug | **RULED OUT** — Multiple versions fail |
| Machine-level IPC/environment issue | **CONFIRMED** — Same hang across versions |

## Version Comparison Summary

| Version | Launch | newPage | setContent |
| ------- | ------ | ------- | ---------- |
| 1.57.0 (main repo) | ✅ | ✅ | ❌ HANG |
| 1.57.0 (fresh temp) | ✅ | ✅ | ❌ HANG |
| 1.56.1 (fresh temp) | ✅ | ✅ | ❌ HANG |

## Conclusion

The Playwright page API hang is NOT a version regression. Both 1.56.1 and 1.57.0 exhibit the same failure on this machine. The root cause is environment-level, not Playwright version-specific.

## Remaining Hypotheses

1. Windows Defender / security software intercepting browser IPC
2. System-level pipe/socket configuration
3. Intel Arc GPU driver interference (though Firefox/WebKit also fail)
4. Windows 11 specific issue

---
*Temp folder left intact for inspection: C:\Users\schur\AppData\Local\Temp\pw-version-regression-2025-12-22*
