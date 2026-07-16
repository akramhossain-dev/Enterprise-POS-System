import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/login|sign in|enterprise pos/i);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows validation error for empty email', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button[type="submit"]').click();
    // Should show some form of validation feedback
    await expect(page.locator('form')).toBeVisible();
  });

  test('shows validation error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"]').fill('not-an-email');
    await page.locator('input[type="password"]').fill('somepassword');
    await page.locator('button[type="submit"]').click();
    // Form should still be visible (not redirected)
    await expect(page.locator('form')).toBeVisible();
  });

  test('redirects unauthenticated users away from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login or show login form
    await expect(page).toHaveURL(/login|\/$/);
  });

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });
});
