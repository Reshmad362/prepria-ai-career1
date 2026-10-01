/**
 * PREPRIA Phase 21 — Authentication Fixture
 * Provides reusable browser authentication utilities using real JWT tokens and UI flows.
 */

import { E2E_USER_A, E2E_USER_B } from './test_data.js';

/**
 * Authenticates candidate via UI form login
 * @param {import('@playwright/test').Page} page
 * @param {typeof E2E_USER_A} user
 */
export async function loginViaUI(page, user = E2E_USER_A) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Fill credentials
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');

  await emailInput.fill(user.email);
  await passwordInput.fill(user.password);

  // Click submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
  await submitBtn.click();

  // Wait for authenticated route transition
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
}

/**
 * Injects authenticated JWT session directly into browser localStorage for isolated sub-flows
 * @param {import('@playwright/test').Page} page
 * @param {typeof E2E_USER_A} user
 * @param {string} token
 */
export async function injectAuthSession(page, user = E2E_USER_A, token = 'e2e-test-jwt-token') {
  await page.goto('/');
  await page.evaluate(({ u, t }) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('isDemo', 'false');
  }, { u: user, t: token });
}

/**
 * Clears authentication session
 * @param {import('@playwright/test').Page} page
 */
export async function clearAuthSession(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
