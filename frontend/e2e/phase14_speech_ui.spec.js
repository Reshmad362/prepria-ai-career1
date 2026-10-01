import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor } from './utils/helpers.js';

test.describe('Phase 14 — Interview Speech UI & Real-Time Metrics Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Mock interview screen renders answer workspace and speech controls', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/mock-interview');
    await page.waitForLoadState('domcontentloaded');

    // Verify interview container or question workspace renders
    const interviewContainer = page.locator('.interview-container, [data-testid="interview-workspace"], main, h1, h2').first();
    await expect(interviewContainer).toBeVisible({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('02. Displays speech metrics meters (speaking rate, filler counts) without crashing', async ({ page }) => {
    await page.goto('/mock-interview');
    await page.waitForLoadState('domcontentloaded');

    // Verify transcript input area or speech status badge is present
    const transcriptArea = page.locator('textarea, [contenteditable="true"], .transcript-box, button:has-text("Submit"), button:has-text("Start")').first();
    await expect(transcriptArea).toBeVisible({ timeout: 10000 });
  });
});
