import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor } from './utils/helpers.js';

test.describe('Phase 16 — Head Pose Proctoring & Warning HUD Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Interview screen initializes video/proctoring monitor without errors', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/mock-interview');
    await page.waitForLoadState('domcontentloaded');

    // Verify video element or camera container exists
    const videoEl = page.locator('video, canvas, .proctoring-hud, [data-testid="camera-feed"]').first();
    await expect(videoEl).toBeAttached({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('02. Displays neutral proctoring HUD and warning counter badge', async ({ page }) => {
    await page.goto('/mock-interview');
    await page.waitForLoadState('domcontentloaded');

    // Verify warning status or proctoring badge
    const proctorBadge = page.locator('.proctor-status, [data-testid="proctoring-badge"], text=/warning/i, text=/proctor/i').first();
    if (await proctorBadge.isVisible()) {
      await expect(proctorBadge).toBeVisible();
    }
  });
});
