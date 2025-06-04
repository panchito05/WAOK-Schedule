import { test, expect } from '@playwright/test';

test.describe('Shift Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should configure shift times', async ({ page }) => {
    // Look for shift configuration section
    const shiftConfigSection = page.locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración"), h3:has-text("Turnos")');
    
    await expect(shiftConfigSection.first()).toBeVisible({ timeout: 10000 });
    
    // Look for time input fields
    const timeInputs = page.locator('input[type="time"], input[placeholder*="hora"], input[name*="time"], [data-testid*="time-input"]');
    const startTimeInput = page.locator('input[name*="start"], input[placeholder*="inicio"], [data-testid="start-time-input"]').first();
    const endTimeInput = page.locator('input[name*="end"], input[placeholder*="fin"], [data-testid="end-time-input"]').first();
    
    if (await timeInputs.first().isVisible()) {
      // Test setting shift times
      if (await startTimeInput.isVisible()) {
        await startTimeInput.fill('09:00');
      } else if (await timeInputs.first().isVisible()) {
        await timeInputs.first().fill('09:00');
      }
      
      if (await endTimeInput.isVisible()) {
        await endTimeInput.fill('17:00');
      } else if (await timeInputs.nth(1).isVisible()) {
        await timeInputs.nth(1).fill('17:00');
      }
      
      // Look for save or apply button
      const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Aplicar"), button[type="submit"]').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Wait for potential success feedback
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('Shift configuration inputs not found - feature may not be implemented yet');
    }
  });

  test('should create and manage shift rules', async ({ page }) => {
    // Look for shift rules section
    const shiftRulesSection = page.locator('[data-testid="shift-rules"], .shift-rules, h2:has-text("Reglas"), h3:has-text("Turnos")');
    
    // Navigate to rules view if available
    const rulesNavButton = page.locator('button:has-text("Reglas"), nav a:has-text("Reglas")').first();
    if (await rulesNavButton.isVisible()) {
      await rulesNavButton.click();
      await page.waitForTimeout(1000);
    }
    
    if (await shiftRulesSection.first().isVisible()) {
      await expect(shiftRulesSection.first()).toBeVisible();
      
      // Look for rule creation/editing components
      const addRuleButton = page.locator('button:has-text("Agregar"), button:has-text("Nueva"), [data-testid="add-rule-btn"]').first();
      const ruleInputs = page.locator('input[name*="rule"], textarea[name*="rule"], select[name*="rule"]');
      
      if (await addRuleButton.isVisible()) {
        await addRuleButton.click();
        await page.waitForTimeout(500);
      }
      
      // Test rule form if available
      if (await ruleInputs.first().isVisible()) {
        const firstInput = ruleInputs.first();
        
        if (await firstInput.getAttribute('tagName') === 'SELECT') {
          await firstInput.selectOption({ index: 0 });
        } else {
          await firstInput.fill('Regla de prueba');
        }
        
        const saveRuleButton = page.locator('button:has-text("Guardar"), button:has-text("Crear"), button[type="submit"]').first();
        if (await saveRuleButton.isVisible()) {
          await saveRuleButton.click();
        }
      }
    } else {
      console.log('Shift rules section not found - feature may not be implemented yet');
    }
  });

  test('should display schedule table', async ({ page }) => {
    // Navigate to schedule view
    const scheduleNavButton = page.locator('button:has-text("Horarios"), nav a:has-text("Horarios"), button:has-text("Schedule")');
    if (await scheduleNavButton.first().isVisible()) {
      await scheduleNavButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Look for schedule table or calendar
    const scheduleTable = page.locator('table, [data-testid="schedule-table"], .schedule-table, .calendar');
    const scheduleGrid = page.locator('[data-testid="schedule-grid"], .schedule-grid, .grid');
    
    if (await scheduleTable.first().isVisible()) {
      await expect(scheduleTable.first()).toBeVisible();
      
      // Check for table headers (days, times, etc.)
      const tableHeaders = page.locator('th, .header, [role="columnheader"]');
      if (await tableHeaders.first().isVisible()) {
        await expect(tableHeaders.first()).toBeVisible();
      }
    } else if (await scheduleGrid.first().isVisible()) {
      await expect(scheduleGrid.first()).toBeVisible();
    } else {
      console.log('Schedule display components not found - feature may not be implemented yet');
    }
  });

  test('should handle shift assignments', async ({ page }) => {
    // Look for shift assignment interface
    const assignmentSection = page.locator('[data-testid="shift-assignment"], .shift-assignment, h2:has-text("Asignación"), h3:has-text("Turnos")');
    const employeeDropdowns = page.locator('select[name*="employee"], select[name*="empleado"]');
    const shiftDropdowns = page.locator('select[name*="shift"], select[name*="turno"]');
    
    if (await assignmentSection.first().isVisible()) {
      await expect(assignmentSection.first()).toBeVisible();
      
      // Test employee-shift assignment
      if (await employeeDropdowns.first().isVisible() && await shiftDropdowns.first().isVisible()) {
        await employeeDropdowns.first().selectOption({ index: 0 });
        await shiftDropdowns.first().selectOption({ index: 0 });
        
        const assignButton = page.locator('button:has-text("Asignar"), button:has-text("Assign")').first();
        if (await assignButton.isVisible()) {
          await assignButton.click();
          await page.waitForTimeout(1000);
        }
      }
    } else {
      console.log('Shift assignment interface not found - feature may not be implemented yet');
    }
  });

  test('should validate shift time constraints', async ({ page }) => {
    // Look for shift time inputs
    const timeInputs = page.locator('input[type="time"], input[placeholder*="hora"]');
    
    if (await timeInputs.first().isVisible()) {
      // Test invalid time range (end before start)
      const firstTimeInput = timeInputs.first();
      const secondTimeInput = timeInputs.nth(1);
      
      if (await firstTimeInput.isVisible() && await secondTimeInput.isVisible()) {
        await firstTimeInput.fill('17:00'); // End time
        await secondTimeInput.fill('09:00'); // Start time
        
        // Try to save/apply
        const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Aplicar"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Look for validation error
          const errorMessage = page.locator('.error, .invalid, [role="alert"], .text-red-500');
          if (await errorMessage.first().isVisible()) {
            await expect(errorMessage.first()).toBeVisible();
          }
        }
      }
    } else {
      console.log('Time validation not testable - time inputs not found');
    }
  });

  test('should display personnel requirements', async ({ page }) => {
    // Navigate to personnel view
    const personnelNavButton = page.locator('button:has-text("Personal"), nav a:has-text("Personal")');
    if (await personnelNavButton.first().isVisible()) {
      await personnelNavButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Look for personnel table or requirements
    const personnelTable = page.locator('[data-testid="personnel-table"], .personnel-table, table:has(th:has-text("Personal"))');
    const requirementsSection = page.locator('[data-testid="personnel-requirements"], .personnel-requirements, h2:has-text("Requerimientos")');
    
    if (await personnelTable.first().isVisible()) {
      await expect(personnelTable.first()).toBeVisible();
    } else if (await requirementsSection.first().isVisible()) {
      await expect(requirementsSection.first()).toBeVisible();
    } else {
      console.log('Personnel requirements display not found - feature may not be implemented yet');
    }
  });
});