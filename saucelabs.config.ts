import { defineConfig, devices } from '@playwright/test';

/**
 * Sauce Labs Cross-Browser Testing Configuration
 * @see https://docs.saucelabs.com/web-apps/automated-testing/playwright/
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
    video: 'retain-on-failure'
  },

  projects: [
    // Chrome - Latest
    {
      name: 'Chrome Latest',
      use: {
        ...devices['Desktop Chrome'],
        connectOptions: {
          wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com:443/wd/hub/playwright`,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}`).toString('base64')}`
          }
        },
        // Sauce Labs capabilities
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-sandbox'
          ]
        },
        contextOptions: {
          // Sauce Labs specific context options
          recordVideo: {
            dir: 'cross-browser-reports/videos/'
          }
        }
      },
      metadata: {
        platform: 'Windows 11',
        browserName: 'chrome',
        browserVersion: 'latest',
        'sauce:options': {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          build: `WAOK-Schedule-Chrome-${Date.now()}`,
          name: 'Chrome Latest Cross-Browser Test',
          tags: ['cross-browser', 'chrome', 'latest'],
          recordVideo: true,
          recordScreenshots: true,
          maxDuration: 3600,
          idleTimeout: 1000
        }
      }
    },
    
    // Firefox - Latest
    {
      name: 'Firefox Latest',
      use: {
        ...devices['Desktop Firefox'],
        connectOptions: {
          wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com:443/wd/hub/playwright`,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}`).toString('base64')}`
          }
        }
      },
      metadata: {
        platform: 'Windows 11',
        browserName: 'firefox',
        browserVersion: 'latest',
        'sauce:options': {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          build: `WAOK-Schedule-Firefox-${Date.now()}`,
          name: 'Firefox Latest Cross-Browser Test',
          tags: ['cross-browser', 'firefox', 'latest'],
          recordVideo: true,
          recordScreenshots: true,
          maxDuration: 3600,
          idleTimeout: 1000
        }
      }
    },
    
    // Safari - Latest (macOS)
    {
      name: 'Safari Latest',
      use: {
        ...devices['Desktop Safari'],
        connectOptions: {
          wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com:443/wd/hub/playwright`,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}`).toString('base64')}`
          }
        }
      },
      metadata: {
        platform: 'macOS 13',
        browserName: 'safari',
        browserVersion: 'latest',
        'sauce:options': {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          build: `WAOK-Schedule-Safari-${Date.now()}`,
          name: 'Safari Latest Cross-Browser Test',
          tags: ['cross-browser', 'safari', 'latest'],
          recordVideo: true,
          recordScreenshots: true,
          maxDuration: 3600,
          idleTimeout: 1000
        }
      }
    },
    
    // Edge - Latest
    {
      name: 'Edge Latest',
      use: {
        ...devices['Desktop Edge'],
        connectOptions: {
          wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com:443/wd/hub/playwright`,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}`).toString('base64')}`
          }
        }
      },
      metadata: {
        platform: 'Windows 11',
        browserName: 'MicrosoftEdge',
        browserVersion: 'latest',
        'sauce:options': {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          build: `WAOK-Schedule-Edge-${Date.now()}`,
          name: 'Edge Latest Cross-Browser Test',
          tags: ['cross-browser', 'edge', 'latest'],
          recordVideo: true,
          recordScreenshots: true,
          maxDuration: 3600,
          idleTimeout: 1000
        }
      }
    },
    
    // Additional browser versions
    {
      name: 'Chrome Previous',
      use: {
        ...devices['Desktop Chrome'],
        connectOptions: {
          wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com:443/wd/hub/playwright`,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}`).toString('base64')}`
          }
        }
      },
      metadata: {
        platform: 'Windows 10',
        browserName: 'chrome',
        browserVersion: 'latest-1',
        'sauce:options': {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          build: `WAOK-Schedule-Chrome-Previous-${Date.now()}`,
          name: 'Chrome Previous Cross-Browser Test',
          tags: ['cross-browser', 'chrome', 'previous'],
          recordVideo: true,
          recordScreenshots: true,
          maxDuration: 3600,
          idleTimeout: 1000
        }
      }
    },
    
    {
      name: 'Firefox Previous',
      use: {
        ...devices['Desktop Firefox'],
        connectOptions: {
          wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com:443/wd/hub/playwright`,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}`).toString('base64')}`
          }
        }
      },
      metadata: {
        platform: 'Windows 10',
        browserName: 'firefox',
        browserVersion: 'latest-1',
        'sauce:options': {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          build: `WAOK-Schedule-Firefox-Previous-${Date.now()}`,
          name: 'Firefox Previous Cross-Browser Test',
          tags: ['cross-browser', 'firefox', 'previous'],
          recordVideo: true,
          recordScreenshots: true,
          maxDuration: 3600,
          idleTimeout: 1000
        }
      }
    }
  ],

  timeout: 60000,
  expect: {
    timeout: 15000
  }
});