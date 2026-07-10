// Playwright config for the web-build E2E smoke.
// BASE_URL points at a running Expo web server (default the CI/local port).
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:19010',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 420, height: 900 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
