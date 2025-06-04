# Test info

- Name: Shift Management >> should configure shift times
- Location: C:\Users\wilbe\OneDrive\Desktop\Apps Moviles\WAOK\WAOK-Shedule\Version de Control de Replit\WAOK-Schedule-11\WAOK-Schedule-11\client\src\tests\e2e\shift-management.spec.ts:9:3

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración"), h3:has-text("Turnos")').first()
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración"), h3:has-text("Turnos")').first()

    at C:\Users\wilbe\OneDrive\Desktop\Apps Moviles\WAOK\WAOK-Shedule\Version de Control de Replit\WAOK-Schedule-11\WAOK-Schedule-11\client\src\tests\e2e\shift-management.spec.ts:13:46
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
   3 | test.describe('Shift Management', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/');
   6 |     await page.waitForLoadState('networkidle');
   7 |   });
   8 |
   9 |   test('should configure shift times', async ({ page }) => {
   10 |     // Look for shift configuration section
   11 |     const shiftConfigSection = page.locator('[data-testid="shift-configuration"], .shift-configuration, h2:has-text("Configuración"), h3:has-text("Turnos")');
   12 |     
>  13 |     await expect(shiftConfigSection.first()).toBeVisible({ timeout: 10000 });
      |                                              ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
   14 |     
   15 |     // Look for time input fields
   16 |     const timeInputs = page.locator('input[type="time"], input[placeholder*="hora"], input[name*="time"], [data-testid*="time-input"]');
   17 |     const startTimeInput = page.locator('input[name*="start"], input[placeholder*="inicio"], [data-testid="start-time-input"]').first();
   18 |     const endTimeInput = page.locator('input[name*="end"], input[placeholder*="fin"], [data-testid="end-time-input"]').first();
   19 |     
   20 |     if (await timeInputs.first().isVisible()) {
   21 |       // Test setting shift times
   22 |       if (await startTimeInput.isVisible()) {
   23 |         await startTimeInput.fill('09:00');
   24 |       } else if (await timeInputs.first().isVisible()) {
   25 |         await timeInputs.first().fill('09:00');
   26 |       }
   27 |       
   28 |       if (await endTimeInput.isVisible()) {
   29 |         await endTimeInput.fill('17:00');
   30 |       } else if (await timeInputs.nth(1).isVisible()) {
   31 |         await timeInputs.nth(1).fill('17:00');
   32 |       }
   33 |       
   34 |       // Look for save or apply button
   35 |       const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Aplicar"), button[type="submit"]').first();
   36 |       if (await saveButton.isVisible()) {
   37 |         await saveButton.click();
   38 |         
   39 |         // Wait for potential success feedback
   40 |         await page.waitForTimeout(1000);
   41 |       }
   42 |     } else {
   43 |       console.log('Shift configuration inputs not found - feature may not be implemented yet');
   44 |     }
   45 |   });
   46 |
   47 |   test('should create and manage shift rules', async ({ page }) => {
   48 |     // Look for shift rules section
   49 |     const shiftRulesSection = page.locator('[data-testid="shift-rules"], .shift-rules, h2:has-text("Reglas"), h3:has-text("Turnos")');
   50 |     
   51 |     // Navigate to rules view if available
   52 |     const rulesNavButton = page.locator('button:has-text("Reglas"), nav a:has-text("Reglas")').first();
   53 |     if (await rulesNavButton.isVisible()) {
   54 |       await rulesNavButton.click();
   55 |       await page.waitForTimeout(1000);
   56 |     }
   57 |     
   58 |     if (await shiftRulesSection.first().isVisible()) {
   59 |       await expect(shiftRulesSection.first()).toBeVisible();
   60 |       
   61 |       // Look for rule creation/editing components
   62 |       const addRuleButton = page.locator('button:has-text("Agregar"), button:has-text("Nueva"), [data-testid="add-rule-btn"]').first();
   63 |       const ruleInputs = page.locator('input[name*="rule"], textarea[name*="rule"], select[name*="rule"]');
   64 |       
   65 |       if (await addRuleButton.isVisible()) {
   66 |         await addRuleButton.click();
   67 |         await page.waitForTimeout(500);
   68 |       }
   69 |       
   70 |       // Test rule form if available
   71 |       if (await ruleInputs.first().isVisible()) {
   72 |         const firstInput = ruleInputs.first();
   73 |         
   74 |         if (await firstInput.getAttribute('tagName') === 'SELECT') {
   75 |           await firstInput.selectOption({ index: 0 });
   76 |         } else {
   77 |           await firstInput.fill('Regla de prueba');
   78 |         }
   79 |         
   80 |         const saveRuleButton = page.locator('button:has-text("Guardar"), button:has-text("Crear"), button[type="submit"]').first();
   81 |         if (await saveRuleButton.isVisible()) {
   82 |           await saveRuleButton.click();
   83 |         }
   84 |       }
   85 |     } else {
   86 |       console.log('Shift rules section not found - feature may not be implemented yet');
   87 |     }
   88 |   });
   89 |
   90 |   test('should display schedule table', async ({ page }) => {
   91 |     // Navigate to schedule view
   92 |     const scheduleNavButton = page.locator('button:has-text("Horarios"), nav a:has-text("Horarios"), button:has-text("Schedule")');
   93 |     if (await scheduleNavButton.first().isVisible()) {
   94 |       await scheduleNavButton.first().click();
   95 |       await page.waitForTimeout(1000);
   96 |     }
   97 |     
   98 |     // Look for schedule table or calendar
   99 |     const scheduleTable = page.locator('table, [data-testid="schedule-table"], .schedule-table, .calendar');
  100 |     const scheduleGrid = page.locator('[data-testid="schedule-grid"], .schedule-grid, .grid');
  101 |     
  102 |     if (await scheduleTable.first().isVisible()) {
  103 |       await expect(scheduleTable.first()).toBeVisible();
  104 |       
  105 |       // Check for table headers (days, times, etc.)
  106 |       const tableHeaders = page.locator('th, .header, [role="columnheader"]');
  107 |       if (await tableHeaders.first().isVisible()) {
  108 |         await expect(tableHeaders.first()).toBeVisible();
  109 |       }
  110 |     } else if (await scheduleGrid.first().isVisible()) {
  111 |       await expect(scheduleGrid.first()).toBeVisible();
  112 |     } else {
  113 |       console.log('Schedule display components not found - feature may not be implemented yet');
```