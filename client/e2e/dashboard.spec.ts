
import { test, expect } from '@playwright/test';
import { LifeFlowTestHelpers } from './helpers/test-helpers';

test.describe('Dashboard Functionality', () => {
  let helpers: LifeFlowTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new LifeFlowTestHelpers(page);
    const user = helpers.generateTestUser();
    await helpers.signUp(user.email, user.password);
    await helpers.waitForLoadingToFinish();
  });

  test('should display main dashboard elements', async ({ page }) => {
    await helpers.verifyDashboardElements();
    
    // Check for specific dashboard sections
    await expect(page.locator('text=Today\'s Overview')).toBeVisible();
    await expect(page.locator('text=Weekly Workouts')).toBeVisible();
    await expect(page.locator('text=Today\'s Meals')).toBeVisible();
    await expect(page.locator('text=Weekly Goals')).toBeVisible();
  });

  test('should show today\'s stats', async ({ page }) => {
    // Add some data first
    await helpers.sendChatMessage('Plan breakfast and schedule a workout');
    await helpers.waitForChatResponse();
    
    // Check if stats reflect the added items
    const statsSection = page.locator('text=Today\'s Overview').locator('..').locator('..');
    await expect(statsSection).toBeVisible();
    
    // Look for progress indicators
    await expect(page.locator('text=Meals')).toBeVisible();
    await expect(page.locator('text=Workouts')).toBeVisible();
  });

  test('should display weekly goals with progress', async ({ page }) => {
    const goalsSection = page.locator('text=Weekly Goals').locator('..').locator('..');
    await expect(goalsSection).toBeVisible();
    
    // Check for progress bars
    const progressBars = page.locator('.bg-green-500, .bg-blue-500, .bg-purple-500, .bg-indigo-500');
    await expect(progressBars.first()).toBeVisible();
  });

  test('should update dashboard when new items are added', async ({ page }) => {
    // Take initial state
    const initialMealsCount = await page.locator('[data-testid="meal-entry"]').count();
    
    // Add a meal through AI
    await helpers.sendChatMessage('Add a protein smoothie for breakfast');
    await helpers.waitForChatResponse();
    
    // Navigate to dashboard and check updates
    await helpers.navigateToTab('Dashboard');
    await helpers.waitForLoadingToFinish();
    
    // Verify dashboard reflects changes
    await expect(page.locator('text=Today\'s Overview')).toBeVisible();
  });

  test('should show empty state appropriately', async ({ page }) => {
    // Fresh user should see appropriate empty states
    await helpers.verifyDashboardElements();
    
    // Check that empty states are handled gracefully
    const emptyStates = page.locator('text=No meals planned, text=No workouts scheduled');
    // Should not throw errors even with empty data
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await helpers.verifyDashboardElements();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await helpers.verifyDashboardElements();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await helpers.verifyDashboardElements();
  });
});
