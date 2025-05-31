
import { test, expect } from '@playwright/test';
import { LifeFlowTestHelpers } from './helpers/test-helpers';

test.describe('Integration Workflows', () => {
  let helpers: LifeFlowTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new LifeFlowTestHelpers(page);
    const user = helpers.generateTestUser();
    await helpers.signUp(user.email, user.password);
    await helpers.waitForLoadingToFinish();
  });

  test('complete daily planning workflow', async ({ page }) => {
    // Plan a full day through AI
    await helpers.sendChatMessage('Plan my entire day: healthy breakfast at 8am, workout at 10am, work block from 2-5pm, and dinner at 7pm');
    await helpers.waitForChatResponse();
    
    // Verify items appear in respective planners
    await helpers.verifyMealInPlanner();
    await helpers.verifyWorkoutInPlanner();
    await helpers.verifyTimeBlockInSchedule();
    
    // Check dashboard reflects the planning
    await helpers.navigateToTab('Dashboard');
    await helpers.verifyDashboardElements();
  });

  test('meal planning to shopping list workflow', async ({ page }) => {
    // Plan several meals
    await helpers.sendChatMessage('Plan healthy meals for the week: breakfast, lunch, and dinner for Monday through Friday');
    await helpers.waitForChatResponse();
    
    // Check meals in planner
    await helpers.verifyMealInPlanner();
    
    // Request shopping list
    await helpers.sendChatMessage('Generate a shopping list for my planned meals');
    await helpers.waitForChatResponse();
    
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['shopping', 'list', 'ingredients']);
  });

  test('workout planning and progress tracking', async ({ page }) => {
    // Plan workout routine
    await helpers.sendChatMessage('Create a weekly workout routine with cardio and strength training');
    await helpers.waitForChatResponse();
    
    // Check workouts appear
    await helpers.verifyWorkoutInPlanner();
    
    // Mark workout as completed (simulate)
    await helpers.sendChatMessage('I completed today\'s workout');
    await helpers.waitForChatResponse();
    
    // Check progress on dashboard
    await helpers.navigateToTab('Dashboard');
    await expect(page.locator('text=Weekly Goals')).toBeVisible();
  });

  test('schedule optimization workflow', async ({ page }) => {
    // Create some scheduling conflicts
    await helpers.sendChatMessage('Schedule a meeting at 2pm and a workout at 2:30pm today');
    await helpers.waitForChatResponse();
    
    // Request schedule optimization
    await helpers.sendChatMessage('Optimize my schedule to avoid conflicts');
    await helpers.waitForChatResponse();
    
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['schedule', 'optimize', 'conflict']);
  });

  test('health and wellness tracking integration', async ({ page }) => {
    // Plan wellness activities
    await helpers.sendChatMessage('Plan a wellness day: morning meditation, healthy meals, workout, and evening journaling');
    await helpers.waitForChatResponse();
    
    // Verify items are distributed across planners
    await helpers.verifyMealInPlanner();
    await helpers.verifyWorkoutInPlanner();
    await helpers.verifyTimeBlockInSchedule();
    
    // Check dashboard for wellness tracking
    await helpers.navigateToTab('Dashboard');
    await expect(page.locator('text=Weekly Goals')).toBeVisible();
  });

  test('data persistence across sessions', async ({ page }) => {
    const user = helpers.generateTestUser();
    
    // Create some data
    await helpers.sendChatMessage('Plan breakfast and a workout for tomorrow');
    await helpers.waitForChatResponse();
    
    // Verify data exists
    await helpers.verifyMealInPlanner();
    
    // Sign out and back in
    await helpers.signOut();
    await helpers.signIn(user.email, user.password);
    
    // Verify data persists
    await helpers.verifyMealInPlanner();
  });

  test('error handling and recovery', async ({ page }) => {
    // Test with invalid requests
    await helpers.sendChatMessage('asdfghjkl random nonsense');
    await helpers.waitForChatResponse();
    
    // AI should handle gracefully
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toBeVisible();
    
    // Follow up with valid request
    await helpers.sendChatMessage('Plan a healthy lunch');
    await helpers.waitForChatResponse();
    
    // Should work normally
    await helpers.verifyMealInPlanner();
  });
});
