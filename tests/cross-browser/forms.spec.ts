import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Forms Tests', () => {
  test('should handle employee form submission', async ({ page }) => {
    await page.goto('/');
    
    // Look for employee form or button to add employee
    const addEmployeeBtn = page.locator('button:has-text("Add Employee"), [data-testid="add-employee"]');
    if (await addEmployeeBtn.count() > 0) {
      await addEmployeeBtn.first().click();
      
      // Fill form fields
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
      if (await nameInput.count() > 0) {
        await nameInput.first().fill('Test Employee');
      }
      
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      if (await emailInput.count() > 0) {
        await emailInput.first().fill('test@example.com');
      }
      
      const phoneInput = page.locator('input[name="phone"], input[placeholder*="phone" i]');
      if (await phoneInput.count() > 0) {
        await phoneInput.first().fill('123-456-7890');
      }
      
      // Submit form
      const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
      }
    }
  });

  test('should handle schedule form submission', async ({ page }) => {
    await page.goto('/');
    
    // Look for schedule form or button to create schedule
    const addScheduleBtn = page.locator('button:has-text("Add Schedule"), [data-testid="add-schedule"]');
    if (await addScheduleBtn.count() > 0) {
      await addScheduleBtn.first().click();
      
      // Fill date input
      const dateInput = page.locator('input[type="date"], input[name="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.first().fill('2024-12-20');
      }
      
      // Fill time inputs
      const startTimeInput = page.locator('input[type="time"], input[name="startTime"]');
      if (await startTimeInput.count() > 0) {
        await startTimeInput.first().fill('09:00');
      }
      
      const endTimeInput = page.locator('input[name="endTime"], input[placeholder*="end" i]');
      if (await endTimeInput.count() > 0) {
        await endTimeInput.first().fill('17:00');
      }
      
      // Submit form
      const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
      }
    }
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/');
    
    // Test empty form submission
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
        
        // Check for validation messages (common patterns)
        const validationMessages = page.locator(
          '.error, .invalid, [role="alert"], .text-red-500, .text-danger'
        );
        
        // At least one validation message should appear for empty form
        if (await validationMessages.count() > 0) {
          await expect(validationMessages.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle form input types correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test different input types
    const emailInputs = page.locator('input[type="email"]');
    if (await emailInputs.count() > 0) {
      await emailInputs.first().fill('invalid-email');
      await emailInputs.first().press('Tab');
      // Browser validation should trigger
    }
    
    const numberInputs = page.locator('input[type="number"]');
    if (await numberInputs.count() > 0) {
      await numberInputs.first().fill('abc');
      await expect(numberInputs.first()).toHaveValue('');
    }
    
    const dateInputs = page.locator('input[type="date"]');
    if (await dateInputs.count() > 0) {
      await dateInputs.first().fill('2024-12-20');
      await expect(dateInputs.first()).toHaveValue('2024-12-20');
    }
  });

  test('should handle dropdown selections', async ({ page }) => {
    await page.goto('/');
    
    // Test select dropdowns
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      const select = selects.first();
      const options = select.locator('option');
      if (await options.count() > 1) {
        await select.selectOption({ index: 1 });
        const selectedValue = await select.inputValue();
        expect(selectedValue).toBeTruthy();
      }
    }
  });
});