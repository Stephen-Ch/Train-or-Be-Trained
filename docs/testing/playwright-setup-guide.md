# Rawls_Playwright.md (Rawls / JustSprites)

Repo path used during diagnosis:
- `C:\Users\schur\workspaces\Rawls\JustSprites`

Confirmed environment at time of capture:
- Node `v20.19.5`
- npm `10.8.2`
- Local Playwright available: `npx --no-install playwright --version` → `1.57.0`

---

## 1) Where Playwright is configured

Config file:
- `playwright.config.ts` (repo root)

Key settings:
- `testDir: './e2e'`
- `baseURL: 'http://localhost:4200'`
- `projects` includes `chromium`

So: **Playwright tests live in `e2e/`**.

---

## 2) Sanity: list discovered tests

From repo root:

```powershell
Set-Location "C:\Users\schur\workspaces\Rawls\JustSprites"
npx playwright test --list
```

---

## 3) Run all Playwright tests

```powershell
npx playwright test --project=chromium --workers=1 --reporter=line
```

---

## 4) Run a single test file (recommended path pattern)

Because `testDir` is `./e2e`, your file paths should be under `e2e/`.

```powershell
npx playwright test "e2e\single-category.spec.ts" --project=chromium --workers=1 --reporter=line
```

---

## 5) Temporary “example.com” smoke test (proves Playwright works)

Create file:
- `e2e/pw-diag-rawls-smoke.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("rawls smoke: example.com loads", async ({ page }) => {
  test.setTimeout(45_000);
  const resp = await page.goto("https://example.com", { waitUntil: "domcontentloaded", timeout: 15_000 });
  await expect(page).toHaveTitle(/Example/);
  console.log("status=", resp?.status(), "final=", page.url());
});
```

Run it:

```powershell
npx playwright test --project=chromium --workers=1 --reporter=line --grep "rawls smoke"
```

Delete afterward.

---

## 6) If app-based e2e tests fail (baseURL issues)

Config expects the app at:
- `http://localhost:4200`

Manual check:

```powershell
iwr http://localhost:4200 -UseBasicParsing -TimeoutSec 5 | Select-Object StatusCode
```

---

## 7) Common “No tests found” cause in Rawls

If you pass a file path outside `e2e/`, Playwright won’t pick it up because `testDir` is `./e2e`.
