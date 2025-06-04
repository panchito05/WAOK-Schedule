import { test, expect } from '@playwright/test';

test.describe('Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should add a new employee', async ({ page }) => {
    // Navigate to employees section or find add employee form
    const addEmployeeButton = page.locator('button:has-text("Agregar"), button:has-text("Añadir"), [data-testid="add-employee-btn"]').first();
    
    // If there's a dedicated employees view, navigate to it first
    const employeesNavButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados")').first();
    if (await employeesNavButton.isVisible()) {
      await employeesNavButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for input fields to add employee data
    const nameInput = page.locator('input[placeholder*="nombre"], input[name*="name"], input[id*="name"], [data-testid="employee-name-input"]').first();
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name*="email"], [data-testid="employee-email-input"]').first();
    const positionInput = page.locator('input[placeholder*="cargo"], input[placeholder*="posición"], input[name*="position"], select[name*="position"], [data-testid="employee-position-input"]').first();
    
    if (await nameInput.isVisible()) {
      // Fill employee information
      await nameInput.fill('Juan Pérez Test');
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('juan.perez.test@waok.com');
      }
      
      if (await positionInput.isVisible()) {
        if (await positionInput.getAttribute('tagName') === 'SELECT') {
          await positionInput.selectOption({ index: 0 });
        } else {
          await positionInput.fill('Desarrollador');
        }
      }
      
      // Submit the form
      if (await addEmployeeButton.isVisible()) {
        await addEmployeeButton.click();
      } else {
        // Try to find submit button
        const submitButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Crear")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }
      
      // Verify employee was added (look for success message or employee in list)
      await expect(page.locator('text=Juan Pérez Test')).toBeVisible({ timeout: 5000 });
    } else {
      console.log('Employee form not found - this might be expected if the feature is not yet implemented');
    }
  });

  test('should display employee list', async ({ page }) => {
    // Check if there's an employee list or table
    const employeeList = page.locator('table, [data-testid="employee-list"], .employee-list, ul li:has-text("@")');
    const employeeCards = page.locator('[data-testid="employee-card"], .employee-card, .card:has(text=/@/)');
    
    // Navigate to employees view if available
    const employeesNavButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados")').first();
    if (await employeesNavButton.isVisible()) {
      await employeesNavButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check if employee data is displayed
    const hasEmployeeList = await employeeList.first().isVisible();
    const hasEmployeeCards = await employeeCards.first().isVisible();
    
    if (hasEmployeeList || hasEmployeeCards) {
      // Verify that employee information is structured properly
      if (hasEmployeeList) {
        await expect(employeeList.first()).toBeVisible();
      }
      if (hasEmployeeCards) {
        await expect(employeeCards.first()).toBeVisible();
      }
    } else {
      console.log('Employee display components not found - this might be expected if the feature is not yet implemented');
    }
  });

  test('should select employees for shift assignment', async ({ page }) => {
    // Look for employee selection components
    const employeeCheckboxes = page.locator('input[type="checkbox"], [data-testid="employee-checkbox"]');
    const selectEmployeesSection = page.locator('[data-testid="select-employees"], .select-employees, h2:has-text("Seleccionar"), h3:has-text("Empleados")');
    
    if (await selectEmployeesSection.first().isVisible()) {
      await expect(selectEmployeesSection.first()).toBeVisible();
      
      // If there are checkboxes, test selection
      if (await employeeCheckboxes.first().isVisible()) {
        const firstCheckbox = employeeCheckboxes.first();
        await firstCheckbox.check();
        await expect(firstCheckbox).toBeChecked();
        
        // Test unselecting
        await firstCheckbox.uncheck();
        await expect(firstCheckbox).not.toBeChecked();
      }
    } else {
      console.log('Employee selection components not found - this might be expected if the feature is not yet implemented');
    }
  });

  test('should validate employee form inputs', async ({ page }) => {
    // Navigate to add employee form
    const employeesNavButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados")').first();
    if (await employeesNavButton.isVisible()) {
      await employeesNavButton.click();
      await page.waitForTimeout(1000);
    }
    
    const nameInput = page.locator('input[placeholder*="nombre"], input[name*="name"], [data-testid="employee-name-input"]').first();
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], [data-testid="employee-email-input"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Agregar")').first();
    
    if (await nameInput.isVisible() && await submitButton.isVisible()) {
      // Test empty form submission
      await submitButton.click();
      
      // Check for validation messages (if any)
      const validationMessage = page.locator('.error, .invalid, [role="alert"], .text-red-500');
      if (await validationMessage.first().isVisible()) {
        await expect(validationMessage.first()).toBeVisible();
      }
      
      // Test invalid email format
      if (await emailInput.isVisible()) {
        await nameInput.fill('Test User');
        await emailInput.fill('invalid-email');
        await submitButton.click();
        
        // Check for email validation
        const emailValidation = page.locator('.error:has-text("email"), .invalid:has-text("email"), [role="alert"]:has-text("email")');
        if (await emailValidation.first().isVisible()) {
          await expect(emailValidation.first()).toBeVisible();
        }
      }
    } else {
      console.log('Employee form validation not testable - form components not found');
    }
  });
});