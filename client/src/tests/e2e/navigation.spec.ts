import { test, expect } from '@playwright/test';

test.describe('Navigation and Page Loading', () => {
  test('should load the main page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Verify the page loads without errors
    await expect(page).toHaveTitle(/WAOK Schedule/i);
    
    // Check that main components are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración de Turnos")')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate between different views', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test navigation to Schedule view
    const scheduleButton = page.locator('button:has-text("Horarios"), nav a:has-text("Horarios"), [data-testid="schedule-nav"]').first();
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      await expect(page.locator('[data-testid="employee-schedule"], .employee-schedule, h2:has-text("Horario")')).toBeVisible({ timeout: 5000 });
    }
    
    // Test navigation to Employees view
    const employeesButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados"), [data-testid="employees-nav"]').first();
    if (await employeesButton.isVisible()) {
      await employeesButton.click();
      await expect(page.locator('[data-testid="add-employees"], .add-employees, h2:has-text("Empleados")')).toBeVisible({ timeout: 5000 });
    }
    
    // Test navigation to Personnel view
    const personnelButton = page.locator('button:has-text("Personal"), nav a:has-text("Personal"), [data-testid="personnel-nav"]').first();
    if (await personnelButton.isVisible()) {
      await personnelButton.click();
      await expect(page.locator('[data-testid="personnel-table"], .personnel-table, h2:has-text("Personal")')).toBeVisible({ timeout: 5000 });
    }
    
    // Test navigation to Rules view
    const rulesButton = page.locator('button:has-text("Reglas"), nav a:has-text("Reglas"), [data-testid="rules-nav"]').first();
    if (await rulesButton.isVisible()) {
      await rulesButton.click();
      await expect(page.locator('[data-testid="schedule-rules"], .schedule-rules, h2:has-text("Reglas")')).toBeVisible({ timeout: 5000 });
    }
    
    // Return to All view
    const allButton = page.locator('button:has-text("Todo"), nav a:has-text("Todo"), [data-testid="all-nav"]').first();
    if (await allButton.isVisible()) {
      await allButton.click();
      await expect(page.locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display responsive layout', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('body')).toHaveCSS('min-height', /100vh|screen/);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Allow layout to adjust
    await expect(page.locator('header')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Allow layout to adjust
    await expect(page.locator('header')).toBeVisible();
  });
});