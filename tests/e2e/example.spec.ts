import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

  const expectedTitle = process.env.PAGE_TITLE || 'life-flow-ai-coach';
await expect(page).toHaveTitle(expectedTitle);
});
