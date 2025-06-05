import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for Cross-Browser Testing
 * Initializes test environment and validates configurations
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Cross-Browser Testing Setup...');
  
  // Create reports directory
  const reportsDir = path.join(process.cwd(), 'cross-browser-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    console.log('📁 Created cross-browser-reports directory');
  }
  
  // Create subdirectories
  const subdirs = ['html', 'videos', 'screenshots', 'traces'];
  subdirs.forEach(dir => {
    const fullPath = path.join(reportsDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  // Validate environment variables
  const requiredEnvVars = {
    BrowserStack: ['BROWSERSTACK_USERNAME', 'BROWSERSTACK_ACCESS_KEY'],
    SauceLabs: ['SAUCE_USERNAME', 'SAUCE_ACCESS_KEY']
  };
  
  const platform = detectPlatform();
  console.log(`🔧 Detected platform: ${platform}`);
  
  if (requiredEnvVars[platform]) {
    const missing = requiredEnvVars[platform].filter(env => !process.env[env]);
    if (missing.length > 0) {
      console.warn(`⚠️  Missing ${platform} environment variables: ${missing.join(', ')}`);
      console.warn('📋 Please set these variables in your .env file or CI/CD configuration');
    } else {
      console.log(`✅ ${platform} credentials configured`);
    }
  }
  
  // Log test configuration
  console.log(`📊 Test configuration:`);
  console.log(`   - Projects: ${config.projects.length}`);
  console.log(`   - Workers: ${config.workers}`);
  console.log(`   - Retries: ${config.retries}`);
  console.log(`   - Base URL: ${config.use?.baseURL || 'Not set'}`);
  
  // Generate test session metadata
  const metadata = {
    sessionId: generateSessionId(),
    startTime: new Date().toISOString(),
    platform,
    projects: config.projects.map(p => p.name),
    baseUrl: config.use?.baseURL,
    environment: process.env.NODE_ENV || 'development'
  };
  
  fs.writeFileSync(
    path.join(reportsDir, 'session-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log(`🎯 Session ID: ${metadata.sessionId}`);
  console.log('✅ Cross-Browser Testing Setup Complete\n');
}

function detectPlatform(): string {
  if (process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY) {
    return 'BrowserStack';
  }
  if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    return 'SauceLabs';
  }
  return 'Local';
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default globalSetup;