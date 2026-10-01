/**
 * PREPRIA Phase 21 — E2E Helper Utilities
 * Monitors console errors, captures network failures, and verifies system health.
 */

/**
 * Attaches console error and unhandled rejection listeners to a Playwright page.
 * @param {import('@playwright/test').Page} page
 * @returns {{ errors: string[], clear: () => void, getFatalErrors: () => string[] }}
 */
export function setupConsoleMonitor(page) {
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known benign vendor / media stream warnings
      if (
        !text.includes('favicon.ico') &&
        !text.includes('Download the React DevTools') &&
        !text.includes('speechSynthesis') &&
        !text.includes('MediaDevices')
      ) {
        errors.push(text);
      }
    }
  });

  page.on('pageerror', (exception) => {
    errors.push(`Unhandled Exception: ${exception.message}`);
  });

  return {
    errors,
    clear: () => { errors.length = 0; },
    getFatalErrors: () => errors.filter(e => !e.includes('Warning:'))
  };
}

/**
 * Attaches network monitoring to track unexpected HTTP 5xx or failed API calls.
 * @param {import('@playwright/test').Page} page
 * @returns {{ failedRequests: Array<{ url: string, status: number, method: string }> }}
 */
export function setupNetworkMonitor(page) {
  const failedRequests = [];

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 500) {
      failedRequests.push({
        url,
        status,
        method: response.request().method()
      });
    }
  });

  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      status: 0,
      method: request.method(),
      failure: request.failure()?.errorText || 'Unknown Network Error'
    });
  });

  return { failedRequests };
}
