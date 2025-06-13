
import { Page, expect, Locator } from '@playwright/test';

export class LifeFlowTestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async signUp(email: string, password: string) {
    await this.page.goto('/auth');
    
    // Switch to sign up mode if needed
    const signUpButton = this.page.locator('text=Sign up here');
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
    }

    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');

    // Wait for redirect to main app
    await expect(this.page).toHaveURL('/', { timeout: 15000 });
  }

  async signIn(email: string, password: string) {
    await this.page.goto('/auth');
    
    // Make sure we're in sign in mode
    const signInButton = this.page.locator('text=Sign in here');
    if (await signInButton.isVisible()) {
      await signInButton.click();
    }

    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');

    await expect(this.page).toHaveURL('/', { timeout: 15000 });
  }

  async signOut() {
    // Look for sign out button in the UI
    const signOutButton = this.page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    }
    await expect(this.page).toHaveURL('/auth', { timeout: 10000 });
  }

  // AI Chat helpers
  async sendChatMessage(message: string) {
    const chatInput = this.page.locator('input[placeholder*="Tell me what you\'d like to plan"]');
    await expect(chatInput).toBeVisible();
    
    await chatInput.fill(message);
    await this.page.click('button:has-text("Send")');

    // Wait for response to start
    await expect(this.page.locator('[data-testid="chat-message"]').last()).toBeVisible({ timeout: 20000 });
  }

  async waitForChatResponse(timeout = 30000) {
    // Wait for streaming to complete
    await this.page.waitForFunction(() => {
      const messages = document.querySelectorAll('[data-testid="chat-message"]');
      const lastMessage = messages[messages.length - 1];
      return lastMessage && lastMessage.textContent && lastMessage.textContent.length > 20;
    }, { timeout });
  }

  async clickSuggestion(suggestionText: string) {
    const suggestion = this.page.locator(`button:has-text("${suggestionText}")`);
    await expect(suggestion).toBeVisible();
    await suggestion.click();
  }

  // Navigation helpers
  async navigateToTab(tabName: string) {
    await this.page.click(`button:has-text("${tabName}")`);
    await this.page.waitForTimeout(1000); // Wait for tab content to load
  }

  async waitForLoadingToFinish() {
    // Wait for any loading spinners to disappear
    await this.page.waitForFunction(() => {
      const spinners = document.querySelectorAll('.animate-spin');
      return spinners.length === 0;
    }, { timeout: 15000 });
  }

  // Dashboard helpers
  async verifyDashboardElements() {
    await expect(this.page.locator('h1:has-text("Life Flow AI Coach")')).toBeVisible();
    await expect(this.page.locator('text=Today\'s Overview')).toBeVisible();
    await expect(this.page.locator('text=Weekly Goals')).toBeVisible();
  }

  // Meal planner helpers
  async verifyMealInPlanner(mealName?: string) {
    await this.navigateToTab('Meals');
    await expect(this.page.locator('text=Weekly Meal Planner')).toBeVisible();
    
    const mealEntries = this.page.locator('[data-testid="meal-entry"]');
    await expect(mealEntries.first()).toBeVisible({ timeout: 10000 });
    
    if (mealName) {
      await expect(this.page.locator(`text=${mealName}`)).toBeVisible();
    }
  }

  // Workout helpers
  async verifyWorkoutInPlanner(workoutName?: string) {
    await this.navigateToTab('Workouts');
    await expect(this.page.locator('text=Workout Planner')).toBeVisible();
    
    if (workoutName) {
      await expect(this.page.locator(`text=${workoutName}`)).toBeVisible();
    }
  }

  // Schedule helpers
  async verifyTimeBlockInSchedule(blockTitle?: string) {
    await this.navigateToTab('Schedule');
    await expect(this.page.locator('text=Time Block Scheduler')).toBeVisible();
    
    if (blockTitle) {
      await expect(this.page.locator(`text=${blockTitle}`)).toBeVisible();
    }
  }

  // Utility helpers
  generateTestEmail(): string {
    const timestamp = Date.now();
    return `test${timestamp}@lifeflow.test`;
  }

  generateTestUser() {
    const timestamp = Date.now();
    return {
      email: `test${timestamp}@lifeflow.test`,
      password: 'TestPassword123!',
      name: `Test User ${timestamp}`
    };
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
