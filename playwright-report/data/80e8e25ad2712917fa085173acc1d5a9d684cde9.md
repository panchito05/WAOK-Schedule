# Test info

- Name: Navigation and Page Loading >> should load the main page successfully
- Location: C:\Users\wilbe\OneDrive\Desktop\Apps Moviles\WAOK\WAOK-Shedule\Version de Control de Replit\WAOK-Schedule-11\WAOK-Schedule-11\client\src\tests\e2e\navigation.spec.ts:4:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

Locator: locator(':root')
Expected pattern: /WAOK Schedule/i
Received string:  "Employee Scheduling System Header"
Call log:
  - expect.toHaveTitle with timeout 5000ms
  - waiting for locator(':root')
    8 × locator resolved to <html lang="en">…</html>
      - unexpected value "Employee Scheduling System Header"

    at C:\Users\wilbe\OneDrive\Desktop\Apps Moviles\WAOK\WAOK-Shedule\Version de Control de Replit\WAOK-Schedule-11\WAOK-Schedule-11\client\src\tests\e2e\navigation.spec.ts:8:24
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
   3 | test.describe('Navigation and Page Loading', () => {
   4 |   test('should load the main page successfully', async ({ page }) => {
   5 |     await page.goto('/');
   6 |     
   7 |     // Verify the page loads without errors
>  8 |     await expect(page).toHaveTitle(/WAOK Schedule/i);
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)
   9 |     
  10 |     // Check that main components are visible
  11 |     await expect(page.locator('header')).toBeVisible();
  12 |     await expect(page.locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración de Turnos")')).toBeVisible({ timeout: 10000 });
  13 |   });
  14 |
  15 |   test('should navigate between different views', async ({ page }) => {
  16 |     await page.goto('/');
  17 |     
  18 |     // Wait for page to load
  19 |     await page.waitForLoadState('networkidle');
  20 |     
  21 |     // Test navigation to Schedule view
  22 |     const scheduleButton = page.locator('button:has-text("Horarios"), nav a:has-text("Horarios"), [data-testid="schedule-nav"]').first();
  23 |     if (await scheduleButton.isVisible()) {
  24 |       await scheduleButton.click();
  25 |       await expect(page.locator('[data-testid="employee-schedule"], .employee-schedule, h2:has-text("Horario")')).toBeVisible({ timeout: 5000 });
  26 |     }
  27 |     
  28 |     // Test navigation to Employees view
  29 |     const employeesButton = page.locator('button:has-text("Empleados"), nav a:has-text("Empleados"), [data-testid="employees-nav"]').first();
  30 |     if (await employeesButton.isVisible()) {
  31 |       await employeesButton.click();
  32 |       await expect(page.locator('[data-testid="add-employees"], .add-employees, h2:has-text("Empleados")')).toBeVisible({ timeout: 5000 });
  33 |     }
  34 |     
  35 |     // Test navigation to Personnel view
  36 |     const personnelButton = page.locator('button:has-text("Personal"), nav a:has-text("Personal"), [data-testid="personnel-nav"]').first();
  37 |     if (await personnelButton.isVisible()) {
  38 |       await personnelButton.click();
  39 |       await expect(page.locator('[data-testid="personnel-table"], .personnel-table, h2:has-text("Personal")')).toBeVisible({ timeout: 5000 });
  40 |     }
  41 |     
  42 |     // Test navigation to Rules view
  43 |     const rulesButton = page.locator('button:has-text("Reglas"), nav a:has-text("Reglas"), [data-testid="rules-nav"]').first();
  44 |     if (await rulesButton.isVisible()) {
  45 |       await rulesButton.click();
  46 |       await expect(page.locator('[data-testid="schedule-rules"], .schedule-rules, h2:has-text("Reglas")')).toBeVisible({ timeout: 5000 });
  47 |     }
  48 |     
  49 |     // Return to All view
  50 |     const allButton = page.locator('button:has-text("Todo"), nav a:has-text("Todo"), [data-testid="all-nav"]').first();
  51 |     if (await allButton.isVisible()) {
  52 |       await allButton.click();
  53 |       await expect(page.locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración")')).toBeVisible({ timeout: 5000 });
  54 |     }
  55 |   });
  56 |
  57 |   test('should display responsive layout', async ({ page }) => {
  58 |     await page.goto('/');
  59 |     
  60 |     // Test desktop view
  61 |     await page.setViewportSize({ width: 1280, height: 720 });
  62 |     await expect(page.locator('body')).toHaveCSS('min-height', /100vh|screen/);
  63 |     
  64 |     // Test tablet view
  65 |     await page.setViewportSize({ width: 768, height: 1024 });
  66 |     await page.waitForTimeout(500); // Allow layout to adjust
  67 |     await expect(page.locator('header')).toBeVisible();
  68 |     
  69 |     // Test mobile view
  70 |     await page.setViewportSize({ width: 375, height: 667 });
  71 |     await page.waitForTimeout(500); // Allow layout to adjust
  72 |     await expect(page.locator('header')).toBeVisible();
  73 |   });
  74 | });
```