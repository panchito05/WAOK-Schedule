import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Navigation Tests', () => {
  test('should load the main page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/WAOK.*Schedule/i);
    await expect(page.locator('h1, [data-testid="app-title"]')).toBeVisible();
  });

  test('should display responsive layout', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('nav, [data-testid="navigation"]')).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Schedule section
    const scheduleLink = page.locator('a[href*="schedule"], button:has-text("Schedule")');
    if (await scheduleLink.count() > 0) {
      await scheduleLink.first().click();
      await page.waitForURL(/.*schedule.*/);
    }
    
    // Navigate to Employees section
    const employeesLink = page.locator('a[href*="employee"], button:has-text("Employee")');
    if (await employeesLink.count() > 0) {
      await employeesLink.first().click();
      await page.waitForURL(/.*employee.*/);
    }
  });

  test('should handle page refresh correctly', async ({ page }) => {
    await page.goto('/');
    await page.reload();
    await expect(page).toHaveTitle(/WAOK.*Schedule/i);
  });

  test('should load resources without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('response', (response) => {
      if (response.status() >= 400) {
        errors.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });
});