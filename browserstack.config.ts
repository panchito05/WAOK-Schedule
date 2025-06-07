import { defineConfig, devices } from '@playwright/test';

/**
 * BrowserStack Cross-Browser Testing Configuration
 * @see https://www.browserstack.com/docs/automate/playwright
 */
export default defineConfig({
  testDir: './client/src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: [
    ['html', { outputFolder: 'cross-browser-reports/html' }],
    ['json', { outputFile: 'cross-browser-reports/test-results.json' }],
    ['junit', { outputFile: 'cross-browser-reports/junit.xml' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // BrowserStack specific settings
    connectOptions: {
      wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
        'browserstack.username': process.env.BROWSERSTACK_USERNAME,
        'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
        'project': 'WAOK-Schedule Cross-Browser Testing',
        'build': `Build-${new Date().toISOString().split('T')[0]}`,
        'name': 'Cross-Browser Compatibility Tests'
      }))}`
    }
  },

  projects: [
    // Chrome - Latest
    {
      name: 'Chrome Latest',
      use: {
        ...devices['Desktop Chrome'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
            'browser': 'chrome',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'project': 'WAOK-Schedule',
            'build': `Chrome-Latest-${Date.now()}`,
            'name': 'Chrome Latest Windows 11'
          }))}`
        }
      }
    },
    
    // Firefox - Latest
    {
      name: 'Firefox Latest',
      use: {
        ...devices['Desktop Firefox'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
            'browser': 'firefox',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'project': 'WAOK-Schedule',
            'build': `Firefox-Latest-${Date.now()}`,
            'name': 'Firefox Latest Windows 11'
          }))}`
        }
      }
    },
    
    // Safari - Latest (macOS)
    {
      name: 'Safari Latest',
      use: {
        ...devices['Desktop Safari'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
            'browser': 'safari',
            'browser_version': 'latest',
            'os': 'OS X',
            'os_version': 'Sonoma',
            'project': 'WAOK-Schedule',
            'build': `Safari-Latest-${Date.now()}`,
            'name': 'Safari Latest macOS Sonoma'
          }))}`
        }
      }
    },
    
    // Edge - Latest
    {
      name: 'Edge Latest',
      use: {
        ...devices['Desktop Edge'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
            'browser': 'edge',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'project': 'WAOK-Schedule',
            'build': `Edge-Latest-${Date.now()}`,
            'name': 'Edge Latest Windows 11'
          }))}`
        }
      }
    },
    
    // Additional browser versions for comprehensive testing
    {
      name: 'Chrome Previous',
      use: {
        ...devices['Desktop Chrome'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
            'browser': 'chrome',
            'browser_version': 'latest-1',
            'os': 'Windows',
            'os_version': '10',
            'project': 'WAOK-Schedule',
            'build': `Chrome-Previous-${Date.now()}`,
            'name': 'Chrome Previous Windows 10'
          }))}`
        }
      }
    },
    
    {
      name: 'Firefox Previous',
      use: {
        ...devices['Desktop Firefox'],
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
            'browser': 'firefox',
            'browser_version': 'latest-1',
            'os': 'Windows',
            'os_version': '10',
            'project': 'WAOK-Schedule',
            'build': `Firefox-Previous-${Date.now()}`,
            'name': 'Firefox Previous Windows 10'
          }))}`
        }
      }
    }
  ],

  // Global test timeout
  timeout: 60000,
  expect: {
    timeout: 15000
  },

  // BrowserStack specific configurations
  globalSetup: './cross-browser-setup.ts',
  globalTeardown: './cross-browser-teardown.ts'
});