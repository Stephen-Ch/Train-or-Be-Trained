# Playwright Node Version A/B Evidence — 2025-12-22

**Purpose:** Determine if Playwright page API hangs are caused by Node version

---

## A) Current Node (baseline)

**Identity:**

where node:
C:\Program Files\nodejs\node.exe
C:\nvm4w\nodejs\node.exe

node -v: v20.19.5
node -p "process.execPath": C:\Program Files\nodejs\node.exe
npm -v: 10.8.2

npm ls playwright @playwright/test:
rawls-game@0.0.0 C:\Users\schur\workspaces\Rawls\JustSprites
└─┬ @playwright/test@1.57.0
  └── playwright@1.57.0

**Matrix results (from previous run):**

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

## B) Node LTS (candidate)

**NVM availability:**

where nvm: C:\Users\schur\AppData\Local\nvm\nvm.exe
nvm version: 1.2.2
nvm list: 22.19.0

**Identity (Node 22.19.0):**

Ran via: C:\Users\schur\AppData\Local\nvm\v22.19.0\node.exe
node -v: v22.19.0

**Matrix results (new run under Node 22):**

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

## C) A/B Comparison Summary (facts only)

- Node version A: v20.19.5 => ALL page APIs TIMEOUT except waitForLoadState
- Node version B: v22.19.0 => ALL page APIs TIMEOUT except waitForLoadState
- Any difference observed: NO
- Both versions produce identical failure pattern
- browserType.launch succeeds in both
- browser.newPage succeeds in both
- page.goto / setContent / evaluate all timeout in both

---

## D) Conclusion (facts only)

The Playwright page API hang is NOT caused by Node version. Both Node 20.19.5 and Node 22.19.0 produce identical timeout behavior for page.goto(), page.setContent(), and page.evaluate() after browser.newPage() succeeds.

---

## E) Next step recommendation (single sentence)

Investigate GPU/driver interaction by running with --disable-gpu flag, or test with Firefox browser instead of Chromium to isolate whether this is Chromium-specific.
