
import { test, expect } from '@playwright/test';
import { LifeFlowTestHelpers } from './helpers/test-helpers';

test.describe('Authentication Flows', () => {
  let helpers: LifeFlowTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new LifeFlowTestHelpers(page);
  });

  test('should redirect unauthenticated users to auth page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth');
    await expect(page.locator('text=LifePlan AI')).toBeVisible();
  });

  test('should sign up new user successfully', async ({ page }) => {
    const user = helpers.generateTestUser();
    
    await helpers.signUp(user.email, user.password);
    
    // Verify successful signup and redirect
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1:has-text("Life Flow AI Coach")')).toBeVisible();
  });

  test('should sign in existing user successfully', async ({ page }) => {
    const user = helpers.generateTestUser();
    
    // First sign up
    await helpers.signUp(user.email, user.password);
    
    // Then sign out and sign in again
    await helpers.signOut();
    await helpers.signIn(user.email, user.password);
    
    // Verify successful login
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1:has-text("Life Flow AI Coach")')).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 5000 });
  });

  test('should toggle between login and signup modes', async ({ page }) => {
    await page.goto('/auth');
    
    // Should start in login mode
    await expect(page.locator('text=Welcome back!')).toBeVisible();
    
    // Switch to signup
    await page.click('text=Sign up here');
    await expect(page.locator('text=Create your account')).toBeVisible();
    
    // Switch back to login
    await page.click('text=Sign in here');
    await expect(page.locator('text=Welcome back!')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    
    // Browser validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });
});
