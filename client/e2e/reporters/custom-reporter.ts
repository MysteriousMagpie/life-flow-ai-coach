
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface PerformanceMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  averageTestDuration: number;
  slowestTests: Array<{ name: string; duration: number; file: string }>;
  fastestTests: Array<{ name: string; duration: number; file: string }>;
}

interface TestSummary {
  timestamp: string;
  performance: PerformanceMetrics;
  errorSummary: Array<{ test: string; error: string; screenshot?: string }>;
  coverageData?: any;
}

class CustomTestReporter implements Reporter {
  private startTime: number = 0;
  private testResults: TestResult[] = [];
  private failedTests: Array<{ test: TestCase; result: TestResult }> = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log(`\n🧪 Starting test run with ${this.countTests(suite)} tests`);
    console.log(`📁 Output directory: ${config.outputDir}`);
    console.log(`🌐 Running on browsers: ${config.projects.map(p => p.name).join(', ')}\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.testResults.push(result);
    
    if (result.status === 'failed') {
      this.failedTests.push({ test, result });
    }

    // Log test completion with performance info
    const duration = result.duration;
    const status = this.getStatusEmoji(result.status);
    console.log(`${status} ${test.title} (${duration}ms)`);
  }

  async onEnd(result: FullResult) {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    // Generate performance metrics
    const performance = this.generatePerformanceMetrics(totalDuration);
    
    // Generate error summary
    const errorSummary = this.generateErrorSummary();

    // Create comprehensive test summary
    const testSummary: TestSummary = {
      timestamp: new Date().toISOString(),
      performance,
      errorSummary
    };

    // Ensure output directory exists
    const outputDir = 'test-results/reports';
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write detailed JSON report
    writeFileSync(
      join(outputDir, 'test-summary.json'),
      JSON.stringify(testSummary, null, 2)
    );

    // Write markdown report for GitHub
    this.generateMarkdownReport(testSummary, outputDir);

    // Print final summary
    this.printFinalSummary(performance, totalDuration);
  }

  private countTests(suite: Suite): number {
    let count = suite.tests.length;
    for (const child of suite.suites) {
      count += this.countTests(child);
    }
    return count;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      case 'timedOut': return '⏰';
      default: return '❓';
    }
  }

  private generatePerformanceMetrics(totalDuration: number): PerformanceMetrics {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'passed').length;
    const failedTests = this.testResults.filter(r => r.status === 'failed').length;
    const skippedTests = this.testResults.filter(r => r.status === 'skipped').length;

    const durations = this.testResults.map(r => r.duration);
    const averageTestDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    // Sort tests by duration for fastest/slowest analysis
    const testsWithDuration = this.testResults.map((result, index) => ({
      name: `Test ${index + 1}`,
      duration: result.duration,
      file: 'unknown' // We'd need test case info for this
    }));

    const sortedByDuration = testsWithDuration.sort((a, b) => b.duration - a.duration);

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration,
      averageTestDuration: Math.round(averageTestDuration),
      slowestTests: sortedByDuration.slice(0, 5),
      fastestTests: sortedByDuration.slice(-5).reverse()
    };
  }

  private generateErrorSummary(): Array<{ test: string; error: string; screenshot?: string }> {
    return this.failedTests.map(({ test, result }) => ({
      test: test.title,
      error: result.error?.message || 'Unknown error',
      screenshot: result.attachments.find(a => a.name === 'screenshot')?.path
    }));
  }

  private generateMarkdownReport(summary: TestSummary, outputDir: string) {
    const { performance, errorSummary } = summary;
    
    const markdown = `# Test Results Report

## 📊 Performance Metrics

- **Total Tests**: ${performance.totalTests}
- **Passed**: ${performance.passedTests} ✅
- **Failed**: ${performance.failedTests} ❌
- **Skipped**: ${performance.skippedTests} ⏭️
- **Success Rate**: ${((performance.passedTests / performance.totalTests) * 100).toFixed(1)}%
- **Total Duration**: ${(performance.totalDuration / 1000).toFixed(2)}s
- **Average Test Duration**: ${performance.averageTestDuration}ms

## 🐌 Slowest Tests
${performance.slowestTests.map(test => 
  `- ${test.name}: ${test.duration}ms`
).join('\n')}

## ⚡ Fastest Tests
${performance.fastestTests.map(test => 
  `- ${test.name}: ${test.duration}ms`
).join('\n')}

${errorSummary.length > 0 ? `## ❌ Failed Tests

${errorSummary.map(error => `
### ${error.test}
\`\`\`
${error.error}
\`\`\`
${error.screenshot ? `📸 Screenshot: ${error.screenshot}` : ''}
`).join('\n')}` : '## 🎉 All Tests Passed!'}

---
*Generated on ${new Date(summary.timestamp).toLocaleString()}*
`;

    writeFileSync(join(outputDir, 'test-report.md'), markdown);
  }

  private printFinalSummary(performance: PerformanceMetrics, totalDuration: number) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${performance.passedTests}`);
    console.log(`❌ Failed: ${performance.failedTests}`);
    console.log(`⏭️  Skipped: ${performance.skippedTests}`);
    console.log(`📈 Success Rate: ${((performance.passedTests / performance.totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️  Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`📊 Average Test Time: ${performance.averageTestDuration}ms`);
    console.log('='.repeat(60));
  }
}

export default CustomTestReporter;
