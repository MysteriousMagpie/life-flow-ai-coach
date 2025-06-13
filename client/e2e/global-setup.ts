
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Set up any global test data or configuration
  console.log('Setting up global test environment...');
  
  // Clean up any existing test data if needed
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to app to ensure it's running
    await page.goto('http://localhost:5173', { timeout: 30000 });
    console.log('✅ Application is running and accessible');
  } catch (error) {
    console.error('❌ Failed to access application:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
