import { defineConfig } from '@playwright/test';

/**
 * Playwright config for running e2e tests against a pre-built static dist bundle.
 * This avoids the ng serve webServer hang issue (TD-RAWLS-001).
 *
 * Usage: npm run e2e:dist
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/td-rawls-001-*.spec.ts'], // Only run dist-specific smoke tests
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:8080',
    headless: true,
    // Block service workers to avoid caching issues in e2e
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npm run serve:dist',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
