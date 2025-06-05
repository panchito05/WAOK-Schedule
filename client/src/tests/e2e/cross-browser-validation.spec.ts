import { test, expect } from '@playwright/test';

// Cross-browser validation tests
test.describe('Cross-Browser Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the main page across all browsers', async ({ page, browserName }) => {
    console.log(`Running test on: ${browserName}`);
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is present
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    console.log(`Page title on ${browserName}: ${title}`);
  });

  test('should handle basic navigation across browsers', async ({ page, browserName }) => {
    console.log(`Testing navigation on: ${browserName}`);
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if basic elements are present
    const bodyElement = await page.locator('body');
    await expect(bodyElement).toBeVisible();
    
    console.log(`Navigation test completed on ${browserName}`);
  });

  test('should support JavaScript execution across browsers', async ({ page, browserName }) => {
    console.log(`Testing JavaScript execution on: ${browserName}`);
    
    // Execute basic JavaScript
    const result = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        cookieEnabled: navigator.cookieEnabled
      };
    });
    
    expect(result.userAgent).toBeTruthy();
    expect(result.viewportWidth).toBeGreaterThan(0);
    expect(result.viewportHeight).toBeGreaterThan(0);
    expect(typeof result.cookieEnabled).toBe('boolean');
    
    console.log(`Browser capabilities on ${browserName}:`, {
      userAgent: result.userAgent.substring(0, 50) + '...',
      viewport: `${result.viewportWidth}x${result.viewportHeight}`,
      cookies: result.cookieEnabled
    });
  });

  test('should handle CSS rendering across browsers', async ({ page, browserName }) => {
    console.log(`Testing CSS rendering on: ${browserName}`);
    
    await page.waitForLoadState('networkidle');
    
    // Check if CSS is being applied by testing computed styles
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        display: styles.display,
        margin: styles.margin,
        fontFamily: styles.fontFamily
      };
    });
    
    expect(bodyStyles.display).toBeTruthy();
    console.log(`CSS rendering verified on ${browserName}`);
  });

  test('should maintain responsive design across browsers', async ({ page, browserName }) => {
    console.log(`Testing responsive design on: ${browserName}`);
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow layout to settle
      
      const dimensions = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight
      }));
      
      expect(dimensions.width).toBe(viewport.width);
      expect(dimensions.height).toBe(viewport.height);
      
      console.log(`${viewport.name} viewport (${viewport.width}x${viewport.height}) verified on ${browserName}`);
    }
  });
});

// Browser-specific capability tests
test.describe('Browser-Specific Features', () => {
  test('should detect browser capabilities', async ({ page, browserName }) => {
    const capabilities = await page.evaluate(() => {
      return {
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
        webGL: !!window.WebGLRenderingContext,
        touchEvents: 'ontouchstart' in window,
        geolocation: 'geolocation' in navigator,
        websockets: typeof WebSocket !== 'undefined'
      };
    });
    
    // Log capabilities for each browser
    console.log(`${browserName} capabilities:`, capabilities);
    
    // Basic capabilities should be available in all modern browsers
    expect(capabilities.localStorage).toBe(true);
    expect(capabilities.sessionStorage).toBe(true);
    expect(capabilities.websockets).toBe(true);
  });
});