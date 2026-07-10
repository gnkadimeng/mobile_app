// End-to-end smoke: drives the running web build against a live backend.
// Verifies: app renders -> login screen -> submit -> backend round-trips ->
// authenticated portal selection appears. No console errors on the happy path.
const { test, expect } = require('@playwright/test');

const EMAIL = process.env.E2E_EMAIL || 'test@chieta.test';
const PW = process.env.E2E_PW || 'Test1234!';

test('home renders and reaches the login form', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));

  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByText(/CHIETA/i).first()).toBeVisible({ timeout: 15000 });

  // bottom-nav "Login"
  const nav = page.getByText('Login', { exact: true });
  await nav.nth((await nav.count()) - 1).click();

  const email = page.getByPlaceholder(/email/i).first();
  await expect(email).toBeVisible({ timeout: 15000 });
  expect(consoleErrors, `console errors: ${consoleErrors.join(' | ')}`).toHaveLength(0);
});

test('login succeeds and lands on portal selection', async ({ page }) => {
  const apiStatuses = [];
  page.on('response', (r) => {
    if (r.url().includes('/login')) apiStatuses.push(r.status());
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  const nav = page.getByText('Login', { exact: true });
  await nav.nth((await nav.count()) - 1).click();

  await page.getByPlaceholder(/email/i).first().fill(EMAIL);
  await page.getByPlaceholder(/password/i).first().fill(PW);
  await page.getByText(/^(Login|Sign in)$/i).first().click();

  // backend must have answered the login call with 200
  await expect
    .poll(() => apiStatuses.filter((s) => s === 200).length, { timeout: 20000 })
    .toBeGreaterThan(0);

  // authenticated UI: the portal picker
  await expect(page.getByText(/Select Your Portal|IMS Portal|GMS Portal/i).first())
    .toBeVisible({ timeout: 20000 });
});
