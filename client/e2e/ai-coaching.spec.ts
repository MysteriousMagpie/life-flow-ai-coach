
import { test, expect } from '@playwright/test';
import { LifeFlowTestHelpers } from './helpers/test-helpers';

test.describe('AI Coaching Interactions', () => {
  let helpers: LifeFlowTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new LifeFlowTestHelpers(page);
    const user = helpers.generateTestUser();
    await helpers.signUp(user.email, user.password);
    await helpers.waitForLoadingToFinish();
  });

  test('should respond to meal planning request', async ({ page }) => {
    await helpers.sendChatMessage('Plan a healthy breakfast for tomorrow');
    await helpers.waitForChatResponse();
    
    // Verify AI response appears
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['breakfast', 'meal', 'nutrition', 'healthy']);
    
    // Check if meal was added to planner
    await helpers.verifyMealInPlanner();
  });

  test('should respond to workout planning request', async ({ page }) => {
    await helpers.sendChatMessage('Schedule a 30-minute cardio workout for today');
    await helpers.waitForChatResponse();
    
    // Verify AI response
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['workout', 'cardio', 'exercise']);
    
    // Check if workout appears in planner
    await helpers.verifyWorkoutInPlanner();
  });

  test('should handle task management requests', async ({ page }) => {
    await helpers.sendChatMessage('Remind me to call my doctor at 2 PM tomorrow');
    await helpers.waitForChatResponse();
    
    // Verify AI response
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['reminder', 'call', 'doctor']);
    
    // Check tasks tab
    await helpers.navigateToTab('Tasks');
    await expect(page.locator('text=call')).toBeVisible({ timeout: 10000 });
  });

  test('should use quick suggestions', async ({ page }) => {
    // Click on a suggestion instead of typing
    await helpers.clickSuggestion('Create a healthy breakfast for tomorrow');
    await helpers.waitForChatResponse();
    
    // Verify response
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(2); // User message + AI response
  });

  test('should handle complex planning requests', async ({ page }) => {
    await helpers.sendChatMessage('Plan my entire day: breakfast at 8am, gym at 10am, lunch meeting at 12pm, and dinner prep at 6pm');
    await helpers.waitForChatResponse();
    
    // Verify comprehensive response
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['schedule', 'plan']);
    
    // Check multiple planners for created items
    await helpers.navigateToTab('Schedule');
    await expect(page.locator('[data-testid="time-block"]')).toHaveCount.greaterThan(0);
  });

  test('should handle follow-up questions', async ({ page }) => {
    // Initial request
    await helpers.sendChatMessage('Plan a workout routine');
    await helpers.waitForChatResponse();
    
    // Follow-up question
    await helpers.sendChatMessage('Make it more intense');
    await helpers.waitForChatResponse();
    
    // Verify conversation context is maintained
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(4); // 2 user + 2 AI messages
  });

  test('should toggle auto-send suggestions', async ({ page }) => {
    // Find the auto-send toggle
    const autoSendToggle = page.locator('button[role="switch"]').first();
    
    // Toggle auto-send on
    await autoSendToggle.click();
    
    // Click a suggestion - should auto-send
    await helpers.clickSuggestion('Show me my pending tasks');
    await helpers.waitForChatResponse();
    
    // Verify message was sent automatically
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(2);
  });
});
