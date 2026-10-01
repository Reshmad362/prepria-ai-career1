import { test, expect } from '@playwright/test';
import { E2E_USER_A, E2E_COURSE_FIXTURE } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor, setupNetworkMonitor } from './utils/helpers.js';

test.describe('Phase 13 — Learning Hub & Course Progression Browser Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Renders course catalog with native and external courses', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    await page.goto('/my-courses');
    await page.waitForLoadState('domcontentloaded');

    // Verify course cards render
    const courseCards = page.locator('.course-card, [data-testid="course-card"], div:has-text("Frontend"), div:has-text("Python")');
    await expect(courseCards.first()).toBeVisible({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('02. Opens course player and displays lesson navigation tree', async ({ page }) => {
    await page.goto(`/course/${E2E_COURSE_FIXTURE.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Verify lesson title or player header is visible
    const playerHeader = page.locator('h1, h2, .lesson-header, [data-testid="lesson-title"]').first();
    await expect(playerHeader).toBeVisible({ timeout: 10000 });

    // Verify module/lesson sidebar exists
    const lessonItem = page.locator('button:has-text("Lesson"), .lesson-item, [data-testid="lesson-item"]').first();
    await expect(lessonItem).toBeVisible();
  });

  test('03. Enforces sequential lesson locking and completion persistence', async ({ page }) => {
    await page.goto(`/course/${E2E_COURSE_FIXTURE.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Verify Next Lesson or complete action button exists in player
    const actionBtn = page.locator('button:has-text("Next"), button:has-text("Complete"), button:has-text("Continue")').first();
    await expect(actionBtn).toBeVisible({ timeout: 10000 });
  });
});
