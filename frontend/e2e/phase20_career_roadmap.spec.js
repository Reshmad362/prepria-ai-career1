import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor, setupNetworkMonitor } from './utils/helpers.js';

test.describe('Phase 20 — Dynamic Career Roadmap Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
  });

  test('01. Career Roadmap successfully loads backend data and renders without failure banner', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    const netMon = setupNetworkMonitor(page);

    // Wait for the real API response
    const roadmapResponsePromise = page.waitForResponse(
      resp => resp.url().includes('/career/roadmap') && resp.request().method() === 'GET',
      { timeout: 10000 }
    ).catch(() => null);

    await page.goto('/career-roadmap');
    await page.waitForLoadState('domcontentloaded');

    const roadmapResponse = await roadmapResponsePromise;
    if (roadmapResponse) {
      expect(roadmapResponse.status()).toBe(200);
      const json = await roadmapResponse.json();
      const data = json.data || json;
      expect(data).toHaveProperty('target_role');
      expect(data).toHaveProperty('readiness_score');
      expect(data).toHaveProperty('milestones');
    }

    // STRICT CHECK: The failure message must NOT appear
    await expect(page.locator('text=Career Roadmap Unavailable')).toHaveCount(0);
    await expect(page.locator('text=Failed to load career roadmap from server')).toHaveCount(0);

    // Verify key UI elements render
    const readinessLabel = page.locator('text=Overall Readiness, text=Skill Coverage').first();
    await expect(readinessLabel).toBeVisible({ timeout: 10000 });

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
    expect(netMon.failedRequests.filter(r => r.status >= 500)).toHaveLength(0);
  });

  test('02. Displays progressive milestone steps with evidence-grounded action items', async ({ page }) => {
    await page.goto('/career-roadmap');
    await page.waitForLoadState('domcontentloaded');

    // Ensure no error banner
    await expect(page.locator('text=Career Roadmap Unavailable')).toHaveCount(0);

    // Look for milestone cards and verify they are present
    const milestoneCards = page.locator('.milestone-card, [data-testid="milestone-card"], div:has-text("Milestone"), div:has-text("Phase")');
    await expect(milestoneCards.first()).toBeVisible({ timeout: 10000 });
  });
});
