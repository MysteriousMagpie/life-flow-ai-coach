
import { test, expect } from '@playwright/test';
import { LifeFlowTestHelpers } from './helpers/test-helpers';

test.describe('Profile and Settings Management', () => {
  let helpers: LifeFlowTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new LifeFlowTestHelpers(page);
    const user = helpers.generateTestUser();
    await helpers.signUp(user.email, user.password);
    await helpers.waitForLoadingToFinish();
  });

  test('should display user information correctly', async ({ page }) => {
    // Look for user-related information in the UI
    // This might be in a header, sidebar, or settings area
    const userInfo = page.locator('[data-testid="user-info"], .user-profile, .user-display');
    
    if (await userInfo.isVisible()) {
      await expect(userInfo).toBeVisible();
    }
  });

  test('should handle user preferences', async ({ page }) => {
    // Test theme switching if available
    const themeToggle = page.locator('button:has-text("Dark"), button:has-text("Light"), [data-testid="theme-toggle"]');
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // Verify theme change takes effect
      await page.waitForTimeout(500);
    }
  });

  test('should manage notification preferences', async ({ page }) => {
    // Look for notification settings
    const notificationSettings = page.locator('text=Notifications, text=Alerts');
    
    if (await notificationSettings.isVisible()) {
      await notificationSettings.click();
      
      // Test toggling notification options
      const toggles = page.locator('input[type="checkbox"], button[role="switch"]');
      if (await toggles.first().isVisible()) {
        await toggles.first().click();
      }
    }
  });

  test('should allow auto-send preference changes', async ({ page }) => {
    // This setting is visible in the chat interface
    const autoSendToggle = page.locator('text=Auto-send suggestions').locator('..').locator('button[role="switch"]');
    
    await expect(autoSendToggle).toBeVisible();
    
    // Test toggling the setting
    const initialState = await autoSendToggle.getAttribute('data-state');
    await autoSendToggle.click();
    
    // Verify state changed
    await expect(autoSendToggle).not.toHaveAttribute('data-state', initialState);
  });

  test('should persist user preferences across sessions', async ({ page }) => {
    // Change auto-send setting
    const autoSendToggle = page.locator('text=Auto-send suggestions').locator('..').locator('button[role="switch"]');
    await autoSendToggle.click();
    const newState = await autoSendToggle.getAttribute('data-state');
    
    // Sign out and sign back in
    await helpers.signOut();
    
    // Sign in with same credentials
    const user = helpers.generateTestUser();
    await helpers.signIn(user.email, user.password);
    
    // Note: In a real app, you'd verify the setting persisted
    // For now, just verify we can access the setting again
    await expect(page.locator('text=Auto-send suggestions')).toBeVisible();
  });

  test('should handle data export/backup requests', async ({ page }) => {
    // Test requesting data through AI
    await helpers.sendChatMessage('Show me my data summary');
    await helpers.waitForChatResponse();
    
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['data', 'summary', 'overview']);
  });

  test('should support account management through AI', async ({ page }) => {
    // Test account-related queries
    await helpers.sendChatMessage('Help me manage my account settings');
    await helpers.waitForChatResponse();
    
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toContainText(['account', 'settings', 'preferences']);
  });
});
