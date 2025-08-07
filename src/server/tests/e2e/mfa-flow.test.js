const { test, expect } = require('@playwright/test');

test.describe('MFA Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
  });

  test('should complete TOTP MFA setup flow', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to MFA setup
    await page.waitForURL('**/mfa-setup');

    // Select TOTP method
    await page.click('text=Authenticator App');
    await page.click('button:has-text("Continue with Authenticator App")');

    // Should show TOTP setup
    await expect(
      page.locator('text=Enter authenticator app code:')
    ).toBeVisible();
  });

  test('should complete TOTP MFA verification flow', async ({ page }) => {
    // Login with existing MFA user
    await page.fill('input[type="email"]', 'local1@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to MFA verification
    await page.waitForURL('**/mfa');

    // Should show TOTP verification
    await expect(
      page.locator('text=Enter authenticator app code:')
    ).toBeVisible();

    // Enter TOTP code (this would be mocked in real tests)
    await page.fill('input[placeholder*="authenticator"]', '123456');
    await page.click('button:has-text("Verify")');

    // Should redirect to tenant selection or dashboard
    await page.waitForURL('**/tenant-selection');
  });

  test('should handle organization MFA configuration', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3001/organization-mfa');

    // Should show organization MFA settings
    await expect(page.locator('text=Organization MFA Settings')).toBeVisible();

    // Toggle MFA on
    await page.click('input[id="mfaEnabled"]');

    // Should show configuration options
    await expect(page.locator('text=MFA Configuration')).toBeVisible();
  });
});
