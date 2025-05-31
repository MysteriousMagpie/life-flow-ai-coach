
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

interface ScreenshotInfo {
  filename: string;
  testName: string;
  browser: string;
  timestamp: Date;
  size: number;
  path: string;
}

export class ScreenshotOrganizer {
  private sourceDir: string;
  private targetDir: string;

  constructor(sourceDir: string = 'test-results', targetDir: string = 'test-results/screenshots') {
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
  }

  async organizeScreenshots(): Promise<ScreenshotInfo[]> {
    const screenshots = this.findAllScreenshots();
    
    if (screenshots.length === 0) {
      console.log('📸 No screenshots found to organize');
      return [];
    }

    console.log(`📸 Found ${screenshots.length} screenshots to organize`);

    // Create organized directory structure
    this.createDirectoryStructure();

    // Organize screenshots by test and browser
    const organizedScreenshots = this.organizeByTestAndBrowser(screenshots);

    // Generate screenshot index
    this.generateScreenshotIndex(organizedScreenshots);

    console.log(`✅ Screenshots organized in: ${this.targetDir}`);
    return organizedScreenshots;
  }

  private findAllScreenshots(): ScreenshotInfo[] {
    const screenshots: ScreenshotInfo[] = [];

    const searchDirectory = (dir: string) => {
      if (!existsSync(dir)) return;

      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          searchDirectory(fullPath);
        } else if (this.isScreenshot(item)) {
          const info = this.parseScreenshotInfo(fullPath);
          if (info) screenshots.push(info);
        }
      }
    };

    searchDirectory(this.sourceDir);
    return screenshots;
  }

  private isScreenshot(filename: string): boolean {
    const ext = extname(filename).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext) && 
           (filename.includes('screenshot') || filename.includes('failed'));
  }

  private parseScreenshotInfo(filepath: string): ScreenshotInfo | null {
    try {
      const filename = basename(filepath);
      const stat = statSync(filepath);
      
      // Parse test name and browser from filename
      // Expected format: testname-browser-timestamp.png
      const parts = filename.replace(/\.(png|jpg|jpeg)$/i, '').split('-');
      const browser = this.extractBrowser(parts);
      const testName = this.extractTestName(parts, browser);

      return {
        filename,
        testName: testName || 'unknown-test',
        browser: browser || 'unknown-browser',
        timestamp: stat.mtime,
        size: stat.size,
        path: filepath
      };
    } catch (error) {
      console.warn(`Failed to parse screenshot info for: ${filepath}`, error);
      return null;
    }
  }

  private extractBrowser(parts: string[]): string {
    const browsers = ['chromium', 'firefox', 'webkit', 'mobile-chrome', 'mobile-safari'];
    return parts.find(part => browsers.includes(part)) || 'unknown';
  }

  private extractTestName(parts: string[], browser: string): string {
    const filtered = parts.filter(part => 
      part !== browser && 
      !part.match(/^\d+$/) && // Remove timestamps
      part !== 'screenshot' &&
      part !== 'failed'
    );
    return filtered.join('-') || 'unknown-test';
  }

  private createDirectoryStructure() {
    if (!existsSync(this.targetDir)) {
      mkdirSync(this.targetDir, { recursive: true });
    }

    // Create subdirectories for each browser
    const browsers = ['chromium', 'firefox', 'webkit', 'mobile-chrome', 'mobile-safari'];
    browsers.forEach(browser => {
      const browserDir = join(this.targetDir, browser);
      if (!existsSync(browserDir)) {
        mkdirSync(browserDir, { recursive: true });
      }
    });
  }

  private organizeByTestAndBrowser(screenshots: ScreenshotInfo[]): ScreenshotInfo[] {
    const organized: ScreenshotInfo[] = [];

    for (const screenshot of screenshots) {
      const targetPath = join(
        this.targetDir,
        screenshot.browser,
        `${screenshot.testName}-${screenshot.timestamp.getTime()}.png`
      );

      try {
        copyFileSync(screenshot.path, targetPath);
        organized.push({
          ...screenshot,
          path: targetPath
        });
      } catch (error) {
        console.warn(`Failed to copy screenshot: ${screenshot.path}`, error);
      }
    }

    return organized;
  }

  private generateScreenshotIndex(screenshots: ScreenshotInfo[]) {
    const indexPath = join(this.targetDir, 'index.html');
    
    const groupedByBrowser = screenshots.reduce((acc, screenshot) => {
      if (!acc[screenshot.browser]) acc[screenshot.browser] = [];
      acc[screenshot.browser].push(screenshot);
      return acc;
    }, {} as Record<string, ScreenshotInfo[]>);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Screenshots Index</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .browser-section { margin-bottom: 30px; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-item { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .screenshot-item img { max-width: 100%; height: auto; }
        .screenshot-info { margin-top: 10px; font-size: 12px; color: #666; }
        h1 { color: #333; }
        h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 5px; }
    </style>
</head>
<body>
    <h1>📸 Test Screenshots Index</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    
    ${Object.entries(groupedByBrowser).map(([browser, browserScreenshots]) => `
        <div class="browser-section">
            <h2>🌐 ${browser.toUpperCase()} (${browserScreenshots.length} screenshots)</h2>
            <div class="screenshot-grid">
                ${browserScreenshots.map(screenshot => `
                    <div class="screenshot-item">
                        <img src="${screenshot.filename}" alt="${screenshot.testName}" loading="lazy">
                        <div class="screenshot-info">
                            <strong>Test:</strong> ${screenshot.testName}<br>
                            <strong>Time:</strong> ${screenshot.timestamp.toLocaleString()}<br>
                            <strong>Size:</strong> ${(screenshot.size / 1024).toFixed(1)} KB
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
</body>
</html>`;

    require('fs').writeFileSync(indexPath, html);
    console.log(`📋 Screenshot index generated: ${indexPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const organizer = new ScreenshotOrganizer();
  organizer.organizeScreenshots().catch(console.error);
}
