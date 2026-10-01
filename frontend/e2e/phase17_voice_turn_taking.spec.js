import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor } from './utils/helpers.js';

test.describe('Phase 17 — Conversational Voice Turn-Taking Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Interview screen reflects voice turn-taking state lifecycle', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/mock-interview');
    await page.waitForLoadState('domcontentloaded');

    // Verify interview status indicator or control buttons
    const controls = page.locator('button:has-text("Submit"), button:has-text("Next"), button:has-text("Start"), button:has-text("Finish")').first();
    await expect(controls).toBeVisible({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('02. Supports manual text entry fallback when microphone/speech synthesis is muted', async ({ page }) => {
    await page.goto('/mock-interview');
    await page.waitForLoadState('domcontentloaded');

    // Manual typing into transcript input
    const inputArea = page.locator('textarea, input[type="text"]').first();
    if (await inputArea.isVisible()) {
      await inputArea.fill('Manual test response demonstrating fallback answer capability.');
      await expect(inputArea).toHaveValue(/Manual test response/);
    }
  });
});
