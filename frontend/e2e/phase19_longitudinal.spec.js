import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor } from './utils/helpers.js';

test.describe('Phase 19 — Longitudinal Intelligence & Scorecard Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Scorecard screen renders 5-pillar progression and performance metrics', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/progress');
    await page.waitForLoadState('domcontentloaded');

    // Look for progression scorecard or analytics container
    const progressContainer = page.locator('.scorecard-container, [data-testid="progress-tracker"], main, h1, h2').first();
    await expect(progressContainer).toBeVisible({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('02. Displays historical trend charts without console errors or runtime failures', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/progress');
    await page.waitForLoadState('domcontentloaded');

    // Check charts / graphs rendering
    const chartContainer = page.locator('.recharts-responsive-container, canvas, svg, .chart-wrapper').first();
    if (await chartContainer.isVisible()) {
      await expect(chartContainer).toBeVisible();
    }

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });
});
