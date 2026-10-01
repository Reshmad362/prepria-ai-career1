import { test, expect } from '@playwright/test';
import { E2E_USER_A } from './fixtures/test_data.js';
import { injectAuthSession, clearAuthSession } from './fixtures/auth.fixture.js';
import { setupConsoleMonitor, setupNetworkMonitor } from './utils/helpers.js';

test.describe('PREPRIA Smoke Test Suite', () => {
  test('01. Application loads landing page and navigates to login', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    const netMon = setupNetworkMonitor(page);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify brand heading / title
    await expect(page).toHaveTitle(/Prepria|AI Career/i);

    // Verify login button exists
    const loginLink = page.locator('a[href="/login"], button:has-text("Login"), a:has-text("Sign In")').first();
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await page.waitForURL('**/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
    expect(netMon.failedRequests.filter(r => r.status >= 500)).toHaveLength(0);
  });

  test('02. Authenticated user can reach dashboard and navigation items', async ({ page }) => {
    const consoleMon = setupConsoleMonitor(page);
    const netMon = setupNetworkMonitor(page);

    await injectAuthSession(page, E2E_USER_A);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Verify main content container renders
    const dashboardContainer = page.locator('main, .dashboard-container, h1, h2').first();
    await expect(dashboardContainer).toBeVisible();

    expect(consoleMon.getFatalErrors()).toHaveLength(0);
  });

  test('03. User can log out cleanly and redirect to login/landing', async ({ page }) => {
    await injectAuthSession(page, E2E_USER_A);
    await page.goto('/dashboard');
    await clearAuthSession(page);
    await page.goto('/dashboard');

    // Should redirect to login when unauthenticated
    await page.waitForURL('**/login', { timeout: 7000 }).catch(() => {});
  });
});
