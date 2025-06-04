# Test info

- Name: Employee Management >> should display employee list
- Location: C:\Users\wilbe\OneDrive\Desktop\Apps Moviles\WAOK\WAOK-Shedule\Version de Control de Replit\WAOK-Schedule-11\WAOK-Schedule-11\client\src\tests\e2e\employee-management.spec.ts:59:3

# Error details

```
Error: locator.isVisible: Unexpected token "=" while parsing css selector "[data-testid="employee-card"], .employee-card, .card:has(text=/@/)". Did you mean to CSS.escape it?
Call log:
    - checking visibility of [data-testid="employee-card"], .employee-card, .card:has(text=/@/) >> nth=0

    at C:\Users\wilbe\OneDrive\Desktop\Apps Moviles\WAOK\WAOK-Shedule\Version de Control de Replit\WAOK-Schedule-11\WAOK-Schedule-11\client\src\tests\e2e\employee-management.spec.ts:73:58
```

# Page snapshot

```yaml
- banner:
  - text: WAOK
  - button "All Schedule Software":
    - img
    - text: All Schedule Software
  - button "Add Employees":
    - img
    - text: Add Employees
  - button "Personnel per Shift":
    - img
    - text: Personnel per Shift
  - button "Schedule Rules":
    - img
    - text: Schedule Rules
  - button "Employee Schedule":
    - img
    - text: Employee Schedule
  - button "Export Data":
    - img
    - text: Export Data
  - button "Import Data":
    - img
    - text: Import Data
  - button "Add New List":
    - img
    - text: Add New List
  - button "Default List":
    - text: Default List
    - img
  - button "Edit List":
    - img
    - text: Edit List
  - button "Supervisory Panel":
    - img
    - text: Supervisory Panel
- heading "Shift Configuration" [level=2]
- button "Create Shift"
- button "Set Shift Priorities"
- table:
  - rowgroup:
    - row "Start Time End Time Duration Lunch Break Actions":
      - cell "Start Time"
      - cell "End Time"
      - cell "Duration"
      - cell "Lunch Break"
      - cell "Actions"
  - rowgroup
- heading "Shift Rules For All Employees" [level=2]
- text: "Start Date:"
- textbox: 2025-06-03
- img
- text: "End Date:"
- textbox: 2025-07-03
- img
- text: "Maximum consecutive shifts (For All Employees):"
- spinbutton: "5"
- text: "Minimum days off after max consecutive shifts:"
- spinbutton: "1"
- text: "Minimum weekends off per month:"
- spinbutton: "1"
- text: "Minimum rest hours between shifts:"
- spinbutton: "16"
- text: "Written Rule 1:"
- textbox "Enter rule 1"
- text: "Written Rule 2:"
- textbox "Enter rule 2"
- text: "Minimum hours per week:"
- spinbutton: "40"
- text: "Minimum hours per two weeks:"
- spinbutton: "80"
- heading "Select Employees For This Combination Working Hours" [level=2]
- combobox:
  - option "Select Shift" [selected]
- spinbutton: "0"
- combobox:
  - option "Select Shift" [selected]
- spinbutton: "0"
- button "Select Employees0.0h"
- combobox:
  - option "Select Shift" [selected]
- spinbutton: "0"
- combobox:
  - option "Select Shift" [selected]
- spinbutton: "0"
- button "Select Employees0.0h"
- combobox:
  - option "Select Shift" [selected]
- spinbutton: "0"
- combobox:
  - option "Select Shift" [selected]
- spinbutton: "0"
- button "Select Employees0.0h"
- heading "Add Employees" [level=2]
- button "Hide Employees Table"
- text: Employee ID *
- textbox "Enter employee ID"
- text: Employee Name *
- textbox "Enter employee name"
- text: Hire Date *
- textbox "mm/dd/yyyy"
- button:
  - img
- text: Email (Optional)
- textbox "Enter email address"
- text: Phone (Optional)
- textbox "Enter phone number"
- button "Add Employee"
- table:
  - rowgroup:
    - row "NAME & USER ID SHIFT PREFERENCES BLOCKED SHIFT NOTES ACTIONS":
      - cell:
        - checkbox
      - cell "NAME & USER ID"
      - cell "SHIFT PREFERENCES"
      - cell "BLOCKED SHIFT"
      - cell "NOTES"
      - cell "ACTIONS"
  - rowgroup:
    - row "No employees added yet. Fill the form above to add your first employee.":
      - cell "No employees added yet. Fill the form above to add your first employee."
- heading "Ideal Number of Personnel per Shift and Day" [level=2]
- text: "Total Number of Employees Needed to Meet Staffing Requirements Across All Shifts: 0.00!"
- heading "Schedule Rules Table" [level=2]
- button "Hide Schedule Rules Table"
- table:
  - rowgroup:
    - row "Category Details":
      - cell "Category"
      - cell "Details"
  - rowgroup:
    - row "Start Date 2025-06-03":
      - cell "Start Date"
      - cell "2025-06-03"
    - row "End Date 2025-07-03":
      - cell "End Date"
      - cell "2025-07-03"
    - 'row "Maximum consecutive shifts (For All Employees): 5"':
      - cell "Maximum consecutive shifts (For All Employees):"
      - cell "5"
    - 'row "Minimum days off after max consecutive shifts: 1"':
      - cell "Minimum days off after max consecutive shifts:"
      - cell "1"
    - 'row "Minimum weekends off per month: 1"':
      - cell "Minimum weekends off per month:"
      - cell "1"
    - 'row "Minimum rest hours between shifts: 16"':
      - cell "Minimum rest hours between shifts:"
      - cell "16"
    - 'row "Written Rule 1: None"':
      - cell "Written Rule 1:"
      - cell "None"
    - 'row "Written Rule 2: None"':
      - cell "Written Rule 2:"
      - cell "None"
    - 'row "Minimum hours per week: 40"':
      - cell "Minimum hours per week:"
      - cell "40"
    - 'row "Minimum hours per two weeks: 80"':
      - cell "Minimum hours per two weeks:"
      - cell "80"
- table:
  - rowgroup:
    - row "Shift Sunday Monday Tuesday Wednesday Thursday Friday Saturday":
      - cell "Shift"
      - cell "Sunday"
      - cell "Monday"
      - cell "Tuesday"
      - cell "Wednesday"
      - cell "Thursday"
      - cell "Friday"
      - cell "Saturday"
  - rowgroup
- table:
  - rowgroup:
    - row "Day Shift Priorities":
      - cell "Day"
      - cell "Shift Priorities"
  - rowgroup
- table:
  - rowgroup:
    - row "# Employee ID Hire Date AI Rules Max Consecutive Shifts Shift Preferences Blocked Shift Fixed/Permanent Shifts Leaves":
      - cell "#"
      - cell "Employee"
      - cell "ID"
      - cell "Hire Date"
      - cell "AI Rules"
      - cell "Max Consecutive Shifts"
      - cell "Shift Preferences"
      - cell "Blocked Shift"
      - cell "Fixed/Permanent Shifts"
      - cell "Leaves"
  - rowgroup
- heading "Employee Schedule Provisional" [level=2]
- button "Hide Employee Schedule Table"
- button "Create Schedule with AI"
- button "Print Schedule"
- table:
  - rowgroup:
    - row:
      - cell "Employees"
      - 'cell "Shift: Preferences or Blocked"'
      - cell "Total Shifts / Hours"
      - cell "3 / June / 2025 Tuesday View Today's Employees":
        - text: 3 / June / 2025 Tuesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "4 / June / 2025 Wednesday View Today's Employees":
        - text: 4 / June / 2025 Wednesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "5 / June / 2025 Thursday View Today's Employees":
        - text: 5 / June / 2025 Thursday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "6 / June / 2025 Friday View Today's Employees":
        - text: 6 / June / 2025 Friday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "7 / June / 2025 Saturday View Today's Employees":
        - text: 7 / June / 2025 Saturday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "8 / June / 2025 Sunday View Today's Employees":
        - text: 8 / June / 2025 Sunday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "9 / June / 2025 Monday View Today's Employees":
        - text: 9 / June / 2025 Monday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "10 / June / 2025 Tuesday View Today's Employees":
        - text: 10 / June / 2025 Tuesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "11 / June / 2025 Wednesday View Today's Employees":
        - text: 11 / June / 2025 Wednesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "12 / June / 2025 Thursday View Today's Employees":
        - text: 12 / June / 2025 Thursday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "13 / June / 2025 Friday View Today's Employees":
        - text: 13 / June / 2025 Friday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "14 / June / 2025 Saturday View Today's Employees":
        - text: 14 / June / 2025 Saturday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "15 / June / 2025 Sunday View Today's Employees":
        - text: 15 / June / 2025 Sunday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "16 / June / 2025 Monday View Today's Employees":
        - text: 16 / June / 2025 Monday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "17 / June / 2025 Tuesday View Today's Employees":
        - text: 17 / June / 2025 Tuesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "18 / June / 2025 Wednesday View Today's Employees":
        - text: 18 / June / 2025 Wednesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "19 / June / 2025 Thursday View Today's Employees":
        - text: 19 / June / 2025 Thursday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "20 / June / 2025 Friday View Today's Employees":
        - text: 20 / June / 2025 Friday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "21 / June / 2025 Saturday View Today's Employees":
        - text: 21 / June / 2025 Saturday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "22 / June / 2025 Sunday View Today's Employees":
        - text: 22 / June / 2025 Sunday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "23 / June / 2025 Monday View Today's Employees":
        - text: 23 / June / 2025 Monday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "24 / June / 2025 Tuesday View Today's Employees":
        - text: 24 / June / 2025 Tuesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "25 / June / 2025 Wednesday View Today's Employees":
        - text: 25 / June / 2025 Wednesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "26 / June / 2025 Thursday View Today's Employees":
        - text: 26 / June / 2025 Thursday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "27 / June / 2025 Friday View Today's Employees":
        - text: 27 / June / 2025 Friday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "28 / June / 2025 Saturday View Today's Employees":
        - text: 28 / June / 2025 Saturday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "29 / June / 2025 Sunday View Today's Employees":
        - text: 29 / June / 2025 Sunday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "30 / June / 2025 Monday View Today's Employees":
        - text: 30 / June / 2025 Monday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "1 / July / 2025 Tuesday View Today's Employees":
        - text: 1 / July / 2025 Tuesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "2 / July / 2025 Wednesday View Today's Employees":
        - text: 2 / July / 2025 Wednesday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "3 / July / 2025 Thursday View Today's Employees":
        - text: 3 / July / 2025 Thursday
        - button "View Today's Employees":
          - img
          - text: View Today's Employees
      - cell "Summary and/or Considerations for this Schedule"
  - rowgroup:
    - row "Total Employees by Shifts":
      - cell "Total Employees by Shifts"
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
      - cell
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Employee Management', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/');
   6 |     await page.waitForLoadState('networkidle');
   7 |   });
   8 |
   9 |   test('should add a new employee', async ({ page }) => {
   10 |     // Navigate to employees section or find add employee form
   11 |     const addEmployeeButton = page.locator('button:has-text("Agregar"), button:has-text("Añadir"), [data-testid="add-employee-btn"]').first();
   12 |     
   13 |     // If there's a dedicated employees view, navigate to it first
   14 |     const employeesNavButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados")').first();
   15 |     if (await employeesNavButton.isVisible()) {
   16 |       await employeesNavButton.click();
   17 |       await page.waitForTimeout(1000);
   18 |     }
   19 |     
   20 |     // Look for input fields to add employee data
   21 |     const nameInput = page.locator('input[placeholder*="nombre"], input[name*="name"], input[id*="name"], [data-testid="employee-name-input"]').first();
   22 |     const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name*="email"], [data-testid="employee-email-input"]').first();
   23 |     const positionInput = page.locator('input[placeholder*="cargo"], input[placeholder*="posición"], input[name*="position"], select[name*="position"], [data-testid="employee-position-input"]').first();
   24 |     
   25 |     if (await nameInput.isVisible()) {
   26 |       // Fill employee information
   27 |       await nameInput.fill('Juan Pérez Test');
   28 |       
   29 |       if (await emailInput.isVisible()) {
   30 |         await emailInput.fill('juan.perez.test@waok.com');
   31 |       }
   32 |       
   33 |       if (await positionInput.isVisible()) {
   34 |         if (await positionInput.getAttribute('tagName') === 'SELECT') {
   35 |           await positionInput.selectOption({ index: 0 });
   36 |         } else {
   37 |           await positionInput.fill('Desarrollador');
   38 |         }
   39 |       }
   40 |       
   41 |       // Submit the form
   42 |       if (await addEmployeeButton.isVisible()) {
   43 |         await addEmployeeButton.click();
   44 |       } else {
   45 |         // Try to find submit button
   46 |         const submitButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Crear")').first();
   47 |         if (await submitButton.isVisible()) {
   48 |           await submitButton.click();
   49 |         }
   50 |       }
   51 |       
   52 |       // Verify employee was added (look for success message or employee in list)
   53 |       await expect(page.locator('text=Juan Pérez Test')).toBeVisible({ timeout: 5000 });
   54 |     } else {
   55 |       console.log('Employee form not found - this might be expected if the feature is not yet implemented');
   56 |     }
   57 |   });
   58 |
   59 |   test('should display employee list', async ({ page }) => {
   60 |     // Check if there's an employee list or table
   61 |     const employeeList = page.locator('table, [data-testid="employee-list"], .employee-list, ul li:has-text("@")');
   62 |     const employeeCards = page.locator('[data-testid="employee-card"], .employee-card, .card:has(text=/@/)');
   63 |     
   64 |     // Navigate to employees view if available
   65 |     const employeesNavButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados")').first();
   66 |     if (await employeesNavButton.isVisible()) {
   67 |       await employeesNavButton.click();
   68 |       await page.waitForTimeout(1000);
   69 |     }
   70 |     
   71 |     // Check if employee data is displayed
   72 |     const hasEmployeeList = await employeeList.first().isVisible();
>  73 |     const hasEmployeeCards = await employeeCards.first().isVisible();
      |                                                          ^ Error: locator.isVisible: Unexpected token "=" while parsing css selector "[data-testid="employee-card"], .employee-card, .card:has(text=/@/)". Did you mean to CSS.escape it?
   74 |     
   75 |     if (hasEmployeeList || hasEmployeeCards) {
   76 |       // Verify that employee information is structured properly
   77 |       if (hasEmployeeList) {
   78 |         await expect(employeeList.first()).toBeVisible();
   79 |       }
   80 |       if (hasEmployeeCards) {
   81 |         await expect(employeeCards.first()).toBeVisible();
   82 |       }
   83 |     } else {
   84 |       console.log('Employee display components not found - this might be expected if the feature is not yet implemented');
   85 |     }
   86 |   });
   87 |
   88 |   test('should select employees for shift assignment', async ({ page }) => {
   89 |     // Look for employee selection components
   90 |     const employeeCheckboxes = page.locator('input[type="checkbox"], [data-testid="employee-checkbox"]');
   91 |     const selectEmployeesSection = page.locator('[data-testid="select-employees"], .select-employees, h2:has-text("Seleccionar"), h3:has-text("Empleados")');
   92 |     
   93 |     if (await selectEmployeesSection.first().isVisible()) {
   94 |       await expect(selectEmployeesSection.first()).toBeVisible();
   95 |       
   96 |       // If there are checkboxes, test selection
   97 |       if (await employeeCheckboxes.first().isVisible()) {
   98 |         const firstCheckbox = employeeCheckboxes.first();
   99 |         await firstCheckbox.check();
  100 |         await expect(firstCheckbox).toBeChecked();
  101 |         
  102 |         // Test unselecting
  103 |         await firstCheckbox.uncheck();
  104 |         await expect(firstCheckbox).not.toBeChecked();
  105 |       }
  106 |     } else {
  107 |       console.log('Employee selection components not found - this might be expected if the feature is not yet implemented');
  108 |     }
  109 |   });
  110 |
  111 |   test('should validate employee form inputs', async ({ page }) => {
  112 |     // Navigate to add employee form
  113 |     const employeesNavButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados")').first();
  114 |     if (await employeesNavButton.isVisible()) {
  115 |       await employeesNavButton.click();
  116 |       await page.waitForTimeout(1000);
  117 |     }
  118 |     
  119 |     const nameInput = page.locator('input[placeholder*="nombre"], input[name*="name"], [data-testid="employee-name-input"]').first();
  120 |     const emailInput = page.locator('input[type="email"], input[placeholder*="email"], [data-testid="employee-email-input"]').first();
  121 |     const submitButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Agregar")').first();
  122 |     
  123 |     if (await nameInput.isVisible() && await submitButton.isVisible()) {
  124 |       // Test empty form submission
  125 |       await submitButton.click();
  126 |       
  127 |       // Check for validation messages (if any)
  128 |       const validationMessage = page.locator('.error, .invalid, [role="alert"], .text-red-500');
  129 |       if (await validationMessage.first().isVisible()) {
  130 |         await expect(validationMessage.first()).toBeVisible();
  131 |       }
  132 |       
  133 |       // Test invalid email format
  134 |       if (await emailInput.isVisible()) {
  135 |         await nameInput.fill('Test User');
  136 |         await emailInput.fill('invalid-email');
  137 |         await submitButton.click();
  138 |         
  139 |         // Check for email validation
  140 |         const emailValidation = page.locator('.error:has-text("email"), .invalid:has-text("email"), [role="alert"]:has-text("email")');
  141 |         if (await emailValidation.first().isVisible()) {
  142 |           await expect(emailValidation.first()).toBeVisible();
  143 |         }
  144 |       }
  145 |     } else {
  146 |       console.log('Employee form validation not testable - form components not found');
  147 |     }
  148 |   });
  149 | });
```