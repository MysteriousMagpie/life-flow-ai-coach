import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Life Flow AI Coach/);
});

test('can log in with test credentials', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-test-id="email"]', 'test@example.com');
  await page.fill('[data-test-id="password"]', 'testpassword');
  await page.click('[data-test-id="login-button"]');
  await expect(page).toHaveURL('/dashboard');
});