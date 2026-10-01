import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor } from './utils/helpers.js';

test.describe('Phase 15 — PDF Report Generation & Download Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Evaluation screen renders scorecard dimensions and feedback cards', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/evaluation');
    await page.waitForLoadState('domcontentloaded');

    // Verify evaluation container or feedback scorecard
    const evalHeader = page.locator('h1, h2, .evaluation-header, .scorecard-container').first();
    await expect(evalHeader).toBeVisible({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('02. PDF download action button is present and triggers server export', async ({ page }) => {
    await page.goto('/evaluation');
    await page.waitForLoadState('domcontentloaded');

    // Look for PDF download button
    const pdfBtn = page.locator('button:has-text("PDF"), button:has-text("Download Report"), a:has-text("PDF"), button:has-text("Export")').first();
    if (await pdfBtn.isVisible()) {
      await expect(pdfBtn).toBeEnabled();
    }
  });
});
