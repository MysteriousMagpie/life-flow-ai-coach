
import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

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
    await expect(this.page).toHaveURL('/', { timeout: 10000 });
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

    await expect(this.page).toHaveURL('/', { timeout: 10000 });
  }

  async sendChatMessage(message: string) {
    const chatInput = this.page.locator('input[placeholder*="Tell me what you\'d like to plan"]');
    await expect(chatInput).toBeVisible();
    
    await chatInput.fill(message);
    await this.page.click('button:has-text("Send")');

    // Wait for response to start
    await expect(this.page.locator('[data-testid="chat-message"]').last()).toBeVisible({ timeout: 15000 });
  }

  async waitForChatResponse() {
    // Wait for streaming to complete
    await this.page.waitForFunction(() => {
      const messages = document.querySelectorAll('[data-testid="chat-message"]');
      const lastMessage = messages[messages.length - 1];
      return lastMessage && lastMessage.textContent && lastMessage.textContent.length > 20;
    }, { timeout: 30000 });
  }

  async navigateToTab(tabName: string) {
    await this.page.click(`button:has-text("${tabName}")`);
  }

  generateTestEmail(): string {
    const timestamp = Date.now();
    return `test${timestamp}@example.com`;
  }
}
