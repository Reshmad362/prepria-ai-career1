// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * PREPRIA Phase 21 — Playwright E2E Test Configuration
 * Configures local, isolated browser testing against real frontend (Vite) and backend (FastAPI).
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for */
  timeout: 45 * 1000,
  expect: {
    timeout: 7000
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on local to prevent race conditions on shared test databases */
  workers: 1,
  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }]
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Emulate standard desktop viewport */
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,

    /* Grant camera/microphone permissions for proctoring/speech tests */
    permissions: ['camera', 'microphone']
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--disable-web-security'
          ]
        }
      },
    }
  ],

  /* Output folder for test artifacts */
  outputDir: 'test-results/'
});
