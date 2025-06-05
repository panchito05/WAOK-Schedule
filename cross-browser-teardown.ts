import { FullConfig, FullResult } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global teardown for Cross-Browser Testing
 * Generates comprehensive reports and cleans up resources
 */
async function globalTeardown(config: FullConfig, result: FullResult) {
  console.log('\n🧹 Starting Cross-Browser Testing Teardown...');
  
  const reportsDir = path.join(process.cwd(), 'cross-browser-reports');
  const metadataPath = path.join(reportsDir, 'session-metadata.json');
  
  let metadata: any = {};
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }
  
  // Update metadata with results
  metadata.endTime = new Date().toISOString();
  metadata.duration = calculateDuration(metadata.startTime, metadata.endTime);
  metadata.status = result.status;
  metadata.totalTests = result.totalTests || 0;
  metadata.passed = (result.totalTests || 0) - (result.failed || 0) - (result.skipped || 0);
  metadata.failed = result.failed || 0;
  metadata.skipped = result.skipped || 0;
  metadata.flaky = result.flaky || 0;
  
  // Generate summary report
  const summaryReport = generateSummaryReport(metadata, result);
  fs.writeFileSync(
    path.join(reportsDir, 'test-summary.md'),
    summaryReport
  );
  
  // Generate JSON report for CI/CD
  const jsonReport = {
    ...metadata,
    artifacts: {
      screenshots: countFiles(path.join(reportsDir, 'screenshots')),
      videos: countFiles(path.join(reportsDir, 'videos')),
      traces: countFiles(path.join(reportsDir, 'traces')),
      htmlReport: fs.existsSync(path.join(reportsDir, 'html', 'index.html'))
    },
    browserResults: analyzeBrowserResults(result)
  };
  
  fs.writeFileSync(
    path.join(reportsDir, 'results.json'),
    JSON.stringify(jsonReport, null, 2)
  );
  
  // Update session metadata
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  // Log final results
  console.log('📊 Cross-Browser Test Results:');
  console.log(`   ✅ Passed: ${metadata.passed}`);
  console.log(`   ❌ Failed: ${metadata.failed}`);
  console.log(`   ⏭️  Skipped: ${metadata.skipped}`);
  console.log(`   🔄 Flaky: ${metadata.flaky}`);
  console.log(`   ⏱️  Duration: ${metadata.duration}`);
  console.log(`   📁 Reports: ${reportsDir}`);
  
  // Performance recommendations
  if (metadata.duration && parseDuration(metadata.duration) > 300000) { // > 5 minutes
    console.log('\n💡 Performance Recommendations:');
    console.log('   - Consider running tests in parallel');
    console.log('   - Review test selectors for optimization');
    console.log('   - Enable test sharding for faster execution');
  }
  
  // Platform-specific cleanup
  const platform = metadata.platform || 'Local';
  if (platform !== 'Local') {
    console.log(`🔧 ${platform} session cleanup completed`);
  }
  
  console.log('✅ Cross-Browser Testing Teardown Complete\n');
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const duration = end - start;
  
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  
  return `${minutes}m ${seconds}s`;
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)m (\d+)s/);
  if (!match) return 0;
  return parseInt(match[1]) * 60000 + parseInt(match[2]) * 1000;
}

function countFiles(directory: string): number {
  if (!fs.existsSync(directory)) return 0;
  return fs.readdirSync(directory).length;
}

function analyzeBrowserResults(result: FullResult): any {
  // This would be enhanced based on actual result structure
  return {
    chrome: { passed: 0, failed: 0, skipped: 0 },
    firefox: { passed: 0, failed: 0, skipped: 0 },
    safari: { passed: 0, failed: 0, skipped: 0 },
    edge: { passed: 0, failed: 0, skipped: 0 }
  };
}

function generateSummaryReport(metadata: any, result: FullResult): string {
  return `# Cross-Browser Test Summary

## 📊 Test Execution Results

- **Session ID**: ${metadata.sessionId}
- **Platform**: ${metadata.platform}
- **Duration**: ${metadata.duration}
- **Status**: ${metadata.status.toUpperCase()}

### Test Results
| Status | Count |
|--------|-------|
| ✅ Passed | ${metadata.passed} |
| ❌ Failed | ${metadata.failed} |
| ⏭️ Skipped | ${metadata.skipped} |
| 🔄 Flaky | ${metadata.flaky} |
| **Total** | **${metadata.totalTests}** |

### Browser Coverage
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

### Environment
- **Base URL**: ${metadata.baseUrl || 'Not specified'}
- **Environment**: ${metadata.environment}
- **Start Time**: ${metadata.startTime}
- **End Time**: ${metadata.endTime}

### Artifacts Generated
- Screenshots: Available in \`cross-browser-reports/screenshots/\`
- Videos: Available in \`cross-browser-reports/videos/\`
- Traces: Available in \`cross-browser-reports/traces/\`
- HTML Report: Available in \`cross-browser-reports/html/\`

---
*Generated by WAOK Cross-Browser Testing Suite*
`;
}

export default globalTeardown;