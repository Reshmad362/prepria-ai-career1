import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor, setupNetworkMonitor } from './utils/helpers.js';

test.describe('Phase 20 — Closed-Loop End-to-End Product Intelligence Flow', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Seamless navigation across Dashboard -> Mock Interview -> Learning Hub -> Roadmap', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    const netMon = setupNetworkMonitor(page);

    // 1. Dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main, h1, h2').first()).toBeVisible();

    // 2. Mock Interview
    await page.goto('/mock-interview');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main, h1, h2, .interview-container').first()).toBeVisible();

    // 3. Learning Hub
    await page.goto('/my-courses');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main, h1, h2, .course-card').first()).toBeVisible();

    // 4. Progress Tracker
    await page.goto('/progress');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main, h1, h2, .scorecard-container').first()).toBeVisible();

    // 5. Career Roadmap
    await page.goto('/career-roadmap');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main, h1, h2, .career-roadmap-container').first()).toBeVisible();

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
    expect(netMon.failedRequests.filter(r => r.status >= 500)).toHaveLength(0);
  });
});
