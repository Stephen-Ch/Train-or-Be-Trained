import { test, expect } from '@playwright/test';

/**
 * @human Smoke test: app loads via static dist server
 * @proves TD-RAWLS-001 unblocked — Angular renders without ng serve hang
 * @lastTouched 2025-12-22
 */
test.describe('TD-RAWLS-001 Smoke (dist server)', () => {
  test('app loads and renders Angular content', async ({ page }) => {
    // Navigate to root (should redirect to /intro or render shell)
    await page.goto('/');

    // Wait for DOM to be ready
    await page.waitForLoadState('domcontentloaded');

    // Angular should render the app shell — look for router-outlet or a known component
    // The intro view or any Angular-rendered content proves the app loaded
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible({ timeout: 15_000 });

    // Verify some Angular-rendered content exists (not just empty shell)
    // The intro screen should show "Start Survey" or similar
    const startBtn = page.getByTestId('start-btn');
    const introView = page.getByTestId('view-intro');

    // Either intro view is visible OR we can see the start button
    const hasIntro = await introView.isVisible().catch(() => false);
    const hasStartBtn = await startBtn.isVisible().catch(() => false);

    expect(hasIntro || hasStartBtn).toBe(true);
  });

  test('can navigate to /select', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click Start Survey to go to select
    const startBtn = page.getByTestId('start-btn');
    await expect(startBtn).toBeVisible({ timeout: 10_000 });
    await startBtn.click();

    // Should navigate to /select
    await page.waitForURL(/\/select/, { timeout: 10_000 });

    // Select header should be visible
    const selectHeader = page.getByTestId('select-header');
    await expect(selectHeader).toBeVisible({ timeout: 5_000 });
  });
});
