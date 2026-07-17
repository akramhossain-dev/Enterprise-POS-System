import { test, expect } from '@playwright/test';

test.describe('Enterprise POS Smoke Test', () => {
  test('should login, view dashboard, and visit POS', async ({ page }) => {
    // 1. Visit Login
    await page.goto('/login');
    await expect(page).toHaveTitle(/login|sign in|enterprise pos/i);

    // 2. Submit credentials
    await page.locator('input[type="email"], input[name="email"]').fill('admin@enterprise-pos.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();

    // 3. Verify dashboard redirect
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15_000 });
    await expect(page.locator('text=Overview|Dashboard|Analytics').first()).toBeVisible();

    // 4. Visit POS Terminal Page
    await page.goto('/pos');
    await expect(page.locator('text=POS|Terminal|Cart').first()).toBeVisible({ timeout: 15_000 });
  });
});
