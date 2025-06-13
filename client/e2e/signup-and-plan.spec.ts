
import { test, expect } from '@playwright/test';

test.describe('User Authentication and AI Meal Planning', () => {
  test('should sign up, chat with AI to plan dinner, and see meal in planner', async ({ page }) => {
    // Generate a unique email for this test run
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testPassword = 'testpassword123';

    // Visit the homepage
    await page.goto('/');

    // Should redirect to auth page if not logged in
    await expect(page).toHaveURL('/auth');

    // Fill in sign up form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Switch to sign up mode if not already
    const signUpButton = page.locator('text=Sign up here');
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
    }

    // Submit the sign up form
    await page.click('button[type="submit"]');

    // Wait for successful signup and redirect to main app
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Verify we're on the main page with the AI interface
    await expect(page.locator('h1:has-text("Life Flow AI Coach")')).toBeVisible();

    // Find and interact with the chat input
    const chatInput = page.locator('input[placeholder*="Tell me what you\'d like to plan"]');
    await expect(chatInput).toBeVisible();

    // Type the meal planning request
    await chatInput.fill('Plan my dinner');
    await page.click('button:has-text("Send")');

    // Wait for the AI response to start streaming
    await expect(page.locator('[data-testid="chat-message"]').last()).toBeVisible({ timeout: 15000 });

    // Wait for the streaming to complete (look for a complete response)
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('[data-testid="chat-message"]');
      const lastMessage = messages[messages.length - 1];
      return lastMessage && lastMessage.textContent && lastMessage.textContent.length > 20;
    }, { timeout: 30000 });

    // Navigate to the Meals tab
    await page.click('button:has-text("Meals")');

    // Wait for the meal planner to load
    await expect(page.locator('text=Weekly Meal Planner')).toBeVisible();

    // Check if any meals appear in the planner
    // The AI should have created at least one meal entry
    const mealEntries = page.locator('[data-testid="meal-entry"]');
    await expect(mealEntries.first()).toBeVisible({ timeout: 10000 });

    // Verify that there's at least one meal planned
    const mealCount = await mealEntries.count();
    expect(mealCount).toBeGreaterThan(0);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('/auth');

    // Try to sign in with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show an error message
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 5000 });
  });

  test('should show login prompt when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should redirect to auth page
    await expect(page).toHaveURL('/auth');
    await expect(page.locator('text=LifePlan AI')).toBeVisible();
  });
});
