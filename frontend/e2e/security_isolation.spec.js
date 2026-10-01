import { test, expect } from '@playwright/test';
import { E2E_USER_A, E2E_USER_B } from './fixtures/test_data.js';
import { injectAuthSession, clearAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor } from './utils/helpers.js';

test.describe('Phase 21 — Cross-Tenant Browser Security & Isolation Suite', () => {
  test('01. Candidate A session does not leak or display Candidate B private data', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);

    // Authenticate Candidate A
    await injectAuthSession(page, E2E_USER_A);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Ensure Candidate B name/email does not appear in candidate A's page
    await expect(page.locator(`text=${E2E_USER_B.email}`)).toHaveCount(0);

    // Switch to Candidate B
    await clearAuthSession(page);
    await injectAuthSession(page, E2E_USER_B);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Ensure Candidate A name/email does not appear in candidate B's page
    await expect(page.locator(`text=${E2E_USER_A.email}`)).toHaveCount(0);

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });
});
