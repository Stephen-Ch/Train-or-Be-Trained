# Playwright goto() Matrix Evidence — 2025-12-22

**Purpose:** Determine which navigations hang and which waitUntil modes fail

---

## 1) Preconditions

node -v: v20.19.5
node -p "process.execPath": C:\Program Files\nodejs\node.exe

npm ls @playwright/test playwright:
rawls-game@0.0.0 C:\Users\schur\workspaces\Rawls\JustSprites
└─┬ @playwright/test@1.57.0
  └── playwright@1.57.0

Playwright browser dirs:

| Name | LastWriteTime |
|------|---------------|
| chromium-1200 | 11/26/2025 6:48 PM |
| chromium_headless_shell-1200 | 11/26/2025 6:48 PM |
| chromium-1194 | 10/10/2025 11:15 AM |
| (plus older versions) | |

---

## 2) Matrix results (PASS/FAIL/TIMEOUT)

| Case | Result | Error |
|------|--------|-------|
| about:blank waitUntil=commit | FAIL | TIMEOUT_15000ms |
| about:blank waitUntil=domcontentloaded | FAIL | TIMEOUT_15000ms |
| about:blank waitUntil=load | FAIL | TIMEOUT_15000ms |
| data: waitUntil=load | FAIL | TIMEOUT_15000ms |
| file: waitUntil=load | FAIL | TIMEOUT_15000ms |
| setContent no goto | FAIL | TIMEOUT_15000ms |
| evaluate basic | FAIL | TIMEOUT_15000ms |
| waitForLoadState(load) | PASS | — |

---

## 3) Raw log excerpt (last 40 lines)

2025-12-22T14:22:40.178Z pw:api => browserType.launch started
2025-12-22T14:22:40.335Z pw:api <= browserType.launch succeeded
2025-12-22T14:22:40.336Z pw:api => browser.newPage started
2025-12-22T14:22:40.592Z pw:api   "commit" event fired
2025-12-22T14:22:40.779Z pw:api   "commit" event fired
2025-12-22T14:22:40.779Z pw:api   navigated to "data:text/html,"
2025-12-22T14:22:40.783Z pw:api   "domcontentloaded" event fired
2025-12-22T14:22:40.783Z pw:api   "load" event fired
2025-12-22T14:22:40.903Z pw:api   "commit" event fired
2025-12-22T14:22:40.903Z pw:api   navigated to "https://playwright/index.html"
2025-12-22T14:22:40.938Z pw:api   "domcontentloaded" event fired
2025-12-22T14:22:40.938Z pw:api   "load" event fired
2025-12-22T14:22:41.067Z pw:api <= browser.newPage succeeded
2025-12-22T14:22:41.069Z pw:api => page.goto started
2025-12-22T14:22:41.492Z pw:api   "networkidle" event fired
RESULT about:blank waitUntil=commit FAIL TIMEOUT_15000ms
2025-12-22T14:22:56.082Z pw:api => page.goto started
RESULT about:blank waitUntil=domcontentloaded FAIL TIMEOUT_15000ms
2025-12-22T14:23:11.095Z pw:api => page.goto started
RESULT about:blank waitUntil=load FAIL TIMEOUT_15000ms
2025-12-22T14:23:26.098Z pw:api => page.goto started
RESULT data: waitUntil=load FAIL TIMEOUT_15000ms
2025-12-22T14:23:41.116Z pw:api => page.goto started
RESULT file: waitUntil=load FAIL TIMEOUT_15000ms
2025-12-22T14:23:56.131Z pw:api => page.setContent started
RESULT setContent no goto FAIL TIMEOUT_15000ms
2025-12-22T14:24:11.134Z pw:api => page.evaluate started
RESULT evaluate basic FAIL TIMEOUT_15000ms
2025-12-22T14:24:26.135Z pw:api => page.waitForLoadState started
2025-12-22T14:24:26.136Z pw:api <= page.waitForLoadState succeeded
RESULT waitForLoadState(load) PASS
2025-12-22T14:24:26.137Z pw:api => browser.close started
2025-12-22T14:24:26.204Z pw:api <= page.setContent failed
2025-12-22T14:24:26.204Z pw:api <= page.evaluate failed
2025-12-22T14:24:26.204Z pw:api <= page.goto failed
2025-12-22T14:24:26.560Z pw:api <= browser.close succeeded
DONE

---

## 4) Interpretation (facts only)

- browserType.launch SUCCEEDED (browser starts)
- browser.newPage SUCCEEDED (page created, internal nav to playwright/index.html worked)
- ALL page.goto() calls TIMEOUT regardless of URL (about:blank, data:, file:)
- ALL page.goto() calls TIMEOUT regardless of waitUntil mode (commit, domcontentloaded, load)
- page.setContent() TIMEOUT
- page.evaluate() TIMEOUT
- page.waitForLoadState('load') PASS (the only API that worked)
- The hang is NOT specific to URL or waitUntil — it affects ALL page communication after newPage()
- Internal "https://playwright/index.html" navigation during newPage() worked, but subsequent API calls to page do not

---

## 5) Next evidence steps (no execution)

1. Run same test with chromium_headless_shell instead of full chromium to see if channel differs
2. Try context.newPage() instead of browser.newPage() to see if context isolation matters
3. Run with --disable-gpu flag to rule out Intel Arc GPU issues
4. Test with Firefox instead of Chromium to isolate browser-specific issue
5. Check Windows Event Viewer for Chromium crash/hang events
