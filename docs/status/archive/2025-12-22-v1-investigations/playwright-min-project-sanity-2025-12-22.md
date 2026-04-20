# Playwright Minimal Project Sanity Test

**PROMPT-ID:** TD-RAWLS-001-MIN-PROJECT-SANITY-001  
**Date:** 2025-12-22  
**Purpose:** Prove whether page API hang is repo-specific or machine-level

## Test Location

C:\Users\schur\AppData\Local\Temp\pw-min-sanity-2025-12-22

## Environment

- Node version: v20.19.5
- Playwright version: 1.57.0 (freshly installed)
- npm init: SUCCESS
- npm i playwright: SUCCESS (added 2 packages)
- npx playwright install: SUCCESS (browsers already cached)

## Test Script

node -e "const { chromium } = require('playwright'); ... p.setContent(...) with 10s timeout ..."

## Result

**HANG / TIMEOUT** — Script hung for 2+ minutes before operator cancelled.

Same symptom as in Rawls repo:
- chromium.launch() succeeds
- browser.newPage() succeeds  
- page.setContent() HANGS indefinitely

## Interpretation

| Hypothesis | Result |
| ---------- | ------ |
| Repo config issue (angular.json, tsconfig, etc.) | **RULED OUT** — Fresh npm project has none of this |
| node_modules corruption | **RULED OUT** — Fresh install |
| Rawls-specific Playwright config | **RULED OUT** — No playwright.config.ts in temp folder |
| Machine-level Playwright IPC issue | **CONFIRMED** — Same hang in isolated minimal project |

## Conclusion

The Playwright page API hang is a **machine-level issue**, not specific to the Rawls codebase. Possible causes:

1. Windows Defender / security software intercepting browser IPC
2. Playwright 1.57.0 bug on this Windows version
3. Intel Arc GPU driver interference (though all 3 browser engines fail)
4. Some system-level pipe/socket configuration

## Recommended Next Steps

1. Try on a different Windows machine
2. Add Playwright folder to Windows Defender exclusions
3. Try Playwright 1.55.x or 1.56.x downgrade
4. Open Playwright GitHub issue with full machine report

---
*Temp folder left intact for inspection: C:\Users\schur\AppData\Local\Temp\pw-min-sanity-2025-12-22*
