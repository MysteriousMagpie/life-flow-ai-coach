
import { FullConfig } from '@playwright/test';
import { ScreenshotOrganizer } from './utils/screenshot-organizer';
import { GitHubSummaryGenerator } from './reporters/github-summary';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');
  
  try {
    // Organize screenshots
    const organizer = new ScreenshotOrganizer();
    await organizer.organizeScreenshots();

    // Generate GitHub Actions summary if in CI
    if (process.env.CI) {
      const githubSummary = new GitHubSummaryGenerator({
        testResultsPath: 'test-results/reports'
      });
      await githubSummary.generateSummary();
    }

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
  }
}

export default globalTeardown;
