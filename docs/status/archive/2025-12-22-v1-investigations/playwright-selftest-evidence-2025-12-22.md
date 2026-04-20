# Playwright Self-Test Evidence — 2025-12-22

**Purpose:** Determine if Playwright can launch Chromium independent of Rawls app

---

## 1) Repo + git

git rev-parse --show-toplevel: C:/Users/schur/workspaces/Rawls/JustSprites
git branch --show-current: main
git rev-parse HEAD: 08d8e162e46470fae07b26186e13cead6748497d
git status --porcelain: ?? docs/status/playwright-windows-machine-report-2025-12-22.md

---

## 2) Node/npm identity (PATH + execPath)

where node:
C:\Program Files\nodejs\node.exe
C:\nvm4w\nodejs\node.exe

node -v: v20.19.5

node -p "process.execPath": C:\Program Files\nodejs\node.exe

where npm:
C:\Program Files\nodejs\npm
C:\Program Files\nodejs\npm.cmd
C:\nvm4w\nodejs\npm
C:\nvm4w\nodejs\npm.cmd

npm -v: 10.8.2

npm config get prefix: C:\Users\schur\AppData\Roaming\npm

---

## 3) Playwright packages present

npm ls @playwright/test playwright:
rawls-game@0.0.0 C:\Users\schur\workspaces\Rawls\JustSprites
└─┬ @playwright/test@1.57.0
  └── playwright@1.57.0

npx playwright --version: Version 1.57.0

npx playwright --help: (full help output available, commands include open, codegen, install, test, etc.)

---

## 4) Playwright browser install location

PLAYWRIGHT_BROWSERS_PATH: (empty/not set)

dir $env:LOCALAPPDATA\ms-playwright:

| Folder | LastWriteTime |
|--------|---------------|
| chromium-1200 | 11/26/2025 6:48 PM |
| chromium_headless_shell-1200 | 11/26/2025 6:48 PM |
| chromium-1194 | 10/10/2025 11:15 AM |
| chromium-1187 | 9/14/2025 8:30 AM |
| chromium-1181 | 7/14/2025 11:19 AM |
| firefox-1495 | 10/10/2025 11:15 AM |
| webkit-2215 | 10/10/2025 11:15 AM |
| (plus older versions) | |

---

## 5) Self-test: chromium launch (headless)

**Command:** node -e with chromium.launch({headless:true}), newPage(), goto('about:blank'), close()

**Result:** TIMED OUT after 15 seconds

**SELFTEST_OK_HEADLESS appeared:** NO

**Log file contents (last 15 lines):**

2025-12-22T13:49:10.483Z pw:api => browserType.launch started
2025-12-22T13:49:10.652Z pw:api <= browserType.launch succeeded
2025-12-22T13:49:10.653Z pw:api => browser.newPage started
2025-12-22T13:49:10.910Z pw:api   "commit" event fired
2025-12-22T13:49:10.912Z pw:api   "domcontentloaded" event fired
2025-12-22T13:49:10.912Z pw:api   "load" event fired
2025-12-22T13:49:11.004Z pw:api   "commit" event fired
2025-12-22T13:49:11.004Z pw:api   navigated to "https://playwright/index.html"
2025-12-22T13:49:11.042Z pw:api   "domcontentloaded" event fired
2025-12-22T13:49:11.042Z pw:api   "load" event fired
2025-12-22T13:49:11.170Z pw:api <= browser.newPage succeeded
2025-12-22T13:49:11.170Z pw:api => page.goto started
2025-12-22T13:49:11.585Z pw:api   "networkidle" event fired
Error: SELFTEST_TIMEOUT_15s
    at Timeout._onTimeout ([eval]:1:281)

---

## 6) Self-test: chromium launch (headed)

**Result:** NOT RUN — headless test timed out, skipped per protocol

---

## 7) Interpretation (facts only)

- browserType.launch SUCCEEDED (Chromium process started)
- browser.newPage SUCCEEDED (new page created)
- page.goto('about:blank') STARTED but never completed (hung)
- "networkidle" event fired but goto never resolved
- The hang is NOT in browser launch — it is in page navigation
- Internal page "https://playwright/index.html" loaded successfully during newPage
- The problem appears to be page.goto() not resolving even for about:blank

---

## 8) Next evidence to collect (no execution)

1. Test with page.goto() using a different URL (e.g., 'data:text/html,hello' instead of 'about:blank')
2. Test with explicit timeout on goto: page.goto('about:blank', {timeout: 5000}) to see error message
3. Check if Windows Defender SmartScreen or other security is intercepting network requests
4. Run with PWDEBUG=1 for interactive step-through to see exactly where it stalls
5. Test in headed mode to visually observe what the browser is doing during goto

---

**Key Finding:** Chromium DOES launch successfully. The hang occurs during page.goto(), not during browser launch.
