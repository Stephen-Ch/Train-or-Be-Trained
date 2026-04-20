import { test, expect } from '@playwright/test';

/**
 * Single-category e2e flow test.
 * Selects one category, answers all questions/follow-ups, clicks Continue,
 * and asserts navigation to /review.
 */
test('single-category flow completes and reaches review', async ({ page }) => {
  // 1. Start at home
  await page.goto('/');
  await expect(page.getByTestId('view-intro')).toBeVisible();

  // 2. Click "Start Survey" button
  await page.getByTestId('start-btn').click();

  // 3. Wait for category selection screen
  await page.waitForURL(/\/select/);
  await expect(page.getByTestId('select-header')).toBeVisible();

  // 4. Select exactly one category (first checkbox)
  const categoryCheckbox = page.locator('input[type="checkbox"]').first();
  await categoryCheckbox.check();

  // 5. Click Continue to start questions
  await page.getByTestId('continue-btn').click();

  // 6. Wait for question route
  await page.waitForURL(/\/q\//);

  // 7. Answer all questions in this category
  let safetyCounter = 0;
  const maxIterations = 30;

  while (safetyCounter < maxIterations) {
    safetyCounter++;

    // Check if we've left the question flow
    if (!page.url().includes('/q/')) {
      break;
    }

    // Wait for either a radio input or the continue button
    const radioInputs = page.locator('input[type="radio"]');
    const continueBtn = page.getByTestId('continue');

    // Check for unanswered radio groups and answer them
    const uncheckedRadio = radioInputs.first();
    if (await uncheckedRadio.isVisible({ timeout: 500 }).catch(() => false)) {
      // Find a radio group that isn't answered yet - click value 3 (neutral)
      const radioGroups = await page.locator('fieldset').all();
      let answeredAny = false;

      for (const fieldset of radioGroups) {
        const radios = fieldset.locator('input[type="radio"]');
        const checkedRadio = fieldset.locator('input[type="radio"]:checked');
        const hasAnswer = await checkedRadio.count() > 0;

        if (!hasAnswer && await radios.count() > 0) {
          // Click the middle option (value 3)
          const middleRadio = radios.nth(2);
          if (await middleRadio.isVisible()) {
            await middleRadio.click();
            answeredAny = true;
          }
        }
      }

      // If we answered something, wait for UI to settle
      if (answeredAny) {
        await page.waitForTimeout(200);
        continue;
      }
    }

    // All radios answered, try clicking Continue
    if (await continueBtn.isEnabled({ timeout: 500 }).catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(300);
    } else {
      // Button disabled, wait a bit and retry
      await page.waitForTimeout(200);
    }
  }

  // 8. Assert we reached /review (or /result)
  await expect(page).toHaveURL(/\/(review|result)/, { timeout: 10000 });
});
