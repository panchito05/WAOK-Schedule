import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Cross-Browser Testing Configuration for WAOK Schedule
 * Supports Chrome, Firefox, Safari, and Edge with BrowserStack/Sauce Labs integration
 */
export default defineConfig({
  // Test directory
  testDir: './client/src/tests/e2e',
  
  // Global test configuration
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5 * 1000 // 5 seconds for assertions
  },
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Global setup and teardown
  globalSetup: require.resolve('./cross-browser-setup.ts'),
  globalTeardown: require.resolve('./cross-browser-teardown.ts'),
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'cross-browser-reports/html',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'cross-browser-reports/results.json' 
    }],
    ['junit', { 
      outputFile: 'cross-browser-reports/junit.xml' 
    }],
    ['list'],
    // Custom reporter for cross-browser insights
    [path.resolve(__dirname, 'cross-browser-reporter.ts')]
  ],
  
  // Artifacts configuration
  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Tracing and debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser context settings
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Custom test metadata
    extraHTTPHeaders: {
      'X-Test-Source': 'Cross-Browser-Suite'
    }
  },
  
  // Output directory for test artifacts
  outputDir: 'cross-browser-reports/artifacts',
  
  // Browser projects configuration
  projects: [
    // Desktop Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      testDir: './client/src/tests/e2e',
      metadata: {
        browser: 'chrome',
        platform: 'desktop'
      }
    },
    
    // Desktop Firefox
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox']
      },
      testDir: './client/src/tests/e2e',
      metadata: {
        browser: 'firefox',
        platform: 'desktop'
      }
    },
    
    // Desktop Safari (WebKit)
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari']
      },
      testDir: './client/src/tests/e2e',
      metadata: {
        browser: 'safari',
        platform: 'desktop'
      }
    },
    
    // Desktop Edge
    {
      name: 'msedge',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'msedge'
      },
      testDir: './client/src/tests/e2e',
      metadata: {
        browser: 'edge',
        platform: 'desktop'
      }
    },
    
    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
      },
      testDir: './tests/cross-browser/mobile',
      metadata: {
        browser: 'chrome',
        platform: 'mobile'
      }
    },
    
    // Mobile Safari
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12']
      },
      testDir: './tests/cross-browser/mobile',
      metadata: {
        browser: 'safari',
        platform: 'mobile'
      }
    }
  ],
  
  // Development server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
  
  // BrowserStack configuration (when using cloud testing)
  ...(process.env.BROWSERSTACK_USERNAME && {
    use: {
      connectOptions: {
        wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
          'browserstack.username': process.env.BROWSERSTACK_USERNAME,
          'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          'project': 'WAOK Schedule Cross-Browser Tests',
          'build': `Build ${process.env.BUILD_NUMBER || Date.now()}`,
          'name': 'Cross-Browser Test Session'
        }))}`
      }
    }
  }),
  
  // Sauce Labs configuration (alternative cloud provider)
  ...(process.env.SAUCE_USERNAME && {
    use: {
      connectOptions: {
        wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com/playwright?caps=${encodeURIComponent(JSON.stringify({
          'sauce:options': {
            'username': process.env.SAUCE_USERNAME,
            'accessKey': process.env.SAUCE_ACCESS_KEY,
            'name': 'WAOK Schedule Cross-Browser Tests',
            'build': `Build ${process.env.BUILD_NUMBER || Date.now()}`
          }
        }))}`
      }
    }
  })
});