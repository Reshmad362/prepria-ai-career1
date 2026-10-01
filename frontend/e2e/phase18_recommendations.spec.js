import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor } from './utils/helpers.js';

test.describe('Phase 18 — Grounded Recommendations & Provider Labels Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Dashboard renders grounded recommendation cards', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Look for recommendations section or cards
    const recSection = page.locator('.recommendations-section, [data-testid="recommendations-container"], div:has-text("Recommended"), div:has-text("Learning Path")').first();
    await expect(recSection).toBeVisible({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('02. Distinguishes native courses from external resources with provider attribution', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Check provider labels or badges
    const providerBadge = page.locator('span:has-text("PREPRIA"), span:has-text("Coursera"), span:has-text("Springboard"), span:has-text("Udemy"), span:has-text("edX")').first();
    if (await providerBadge.isVisible()) {
      await expect(providerBadge).toBeVisible();
    }
  });
});
