
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface GitHubSummaryOptions {
  testResultsPath: string;
  screenshotsPath?: string;
  outputPath?: string;
}

export class GitHubSummaryGenerator {
  private options: GitHubSummaryOptions;

  constructor(options: GitHubSummaryOptions) {
    this.options = {
      outputPath: process.env.GITHUB_STEP_SUMMARY || 'github-summary.md',
      ...options
    };
  }

  async generateSummary(): Promise<void> {
    try {
      const testSummary = this.loadTestSummary();
      const markdown = this.buildMarkdownSummary(testSummary);
      
      writeFileSync(this.options.outputPath!, markdown);
      console.log(`📋 GitHub summary written to: ${this.options.outputPath}`);
    } catch (error) {
      console.error('Failed to generate GitHub summary:', error);
    }
  }

  private loadTestSummary(): any {
    const summaryPath = join(this.options.testResultsPath, 'test-summary.json');
    
    if (!existsSync(summaryPath)) {
      throw new Error(`Test summary not found at: ${summaryPath}`);
    }

    return JSON.parse(readFileSync(summaryPath, 'utf8'));
  }

  private buildMarkdownSummary(summary: any): string {
    const { performance, errorSummary } = summary;
    const successRate = ((performance.passedTests / performance.totalTests) * 100).toFixed(1);
    const isSuccess = performance.failedTests === 0;

    return `# ${isSuccess ? '🎉' : '⚠️'} E2E Test Results

## Overview
| Metric | Value |
|--------|-------|
| **Total Tests** | ${performance.totalTests} |
| **Passed** | ${performance.passedTests} ✅ |
| **Failed** | ${performance.failedTests} ${performance.failedTests > 0 ? '❌' : ''} |
| **Skipped** | ${performance.skippedTests} ⏭️ |
| **Success Rate** | ${successRate}% |
| **Duration** | ${(performance.totalDuration / 1000).toFixed(2)}s |

## Performance Analysis

### ⚡ Test Speed Metrics
- **Average Test Duration**: ${performance.averageTestDuration}ms
- **Slowest Test**: ${performance.slowestTests[0]?.duration || 0}ms
- **Fastest Test**: ${performance.fastestTests[0]?.duration || 0}ms

${performance.slowestTests.length > 0 ? `
### 🐌 Slowest Tests (Top 3)
${performance.slowestTests.slice(0, 3).map((test: any, index: number) => 
  `${index + 1}. **${test.name}** - ${test.duration}ms`
).join('\n')}
` : ''}

${errorSummary.length > 0 ? `
## ❌ Failed Tests

<details>
<summary>Click to view ${errorSummary.length} failed test(s)</summary>

${errorSummary.map((error: any) => `
### 🔴 ${error.test}

\`\`\`
${error.error}
\`\`\`

${error.screenshot ? `📸 **Screenshot Available**: [View Screenshot](${error.screenshot})` : ''}

---
`).join('\n')}

</details>
` : `
## 🎉 All Tests Passed!

Great job! All end-to-end tests are passing successfully.
`}

## 📊 Test Coverage Summary

${this.generateCoverageBadge(successRate)}

---
<sub>Generated on ${new Date(summary.timestamp).toLocaleString()} | Powered by Playwright</sub>
`;
  }

  private generateCoverageBadge(successRate: string): string {
    const rate = parseFloat(successRate);
    const color = rate >= 90 ? 'brightgreen' : rate >= 75 ? 'yellow' : 'red';
    
    return `![Test Coverage](https://img.shields.io/badge/Test%20Success%20Rate-${successRate}%25-${color})`;
  }
}

// CLI usage for GitHub Actions
if (require.main === module) {
  const generator = new GitHubSummaryGenerator({
    testResultsPath: process.argv[2] || 'test-results/reports'
  });
  
  generator.generateSummary().catch(console.error);
}
