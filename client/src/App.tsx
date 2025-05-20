import React, { useState } from 'react';
import Header from './components/Header';
import { EmployeeListsProvider } from './context/EmployeeListsContext';
import { RulesProvider } from './context/RulesContext';
import { ShiftProvider } from './context/ShiftContext';
import { PersonnelDataProvider } from './context/PersonnelDataContext';
import { ShiftPrioritiesProvider } from './context/ShiftPrioritiesContext';
import { SelectedEmployeesProvider } from './context/SelectedEmployeesContext';
import EmployeeScheduleTable from './components/EmployeeScheduleProvisional';
import ShiftConfiguration from './components/ShiftConfiguration';
import ShiftRules from './components/ShiftRulesForAllEmployees';
import SelectEmployeesForThisCombinationWorkingHours from './components/SelectEmployeesForThisCombinationWorkingHours';
import AddEmployees from './components/AddEmployees';
import PersonnelTable from './components/IdealNumberOfPersonnelPerShiftAndDay';
import ScheduleRulesTable from './components/ScheduleRulesTable';

export type ActiveView = 'all' | 'schedule' | 'employees' | 'personnel' | 'rules';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('all');

  return (
    <EmployeeListsProvider>
      <RulesProvider>
        <ShiftProvider>
          <PersonnelDataProvider>
            <ShiftPrioritiesProvider>
              <SelectedEmployeesProvider>
                <div className="min-h-screen bg-gray-100">
                  <Header onViewChange={setActiveView} />
                  <div className="px-8">
                    {activeView === 'all' && (
                      <>
                        <div className="flex justify-between">
                          <ShiftConfiguration />
                          <ShiftRules />
                        </div>
                        <SelectEmployeesForThisCombinationWorkingHours />
                        <AddEmployees />
                        <PersonnelTable />
                        <ScheduleRulesTable />
                        <EmployeeScheduleTable />
                      </>
                    )}
                    {activeView === 'schedule' && <EmployeeScheduleTable />}
                    {activeView === 'employees' && <AddEmployees />}
                    {activeView === 'personnel' && <PersonnelTable />}
                    {activeView === 'rules' && <ScheduleRulesTable />}
                  </div>
                </div>
              </SelectedEmployeesProvider>
            </ShiftPrioritiesProvider>
          </PersonnelDataProvider>
        </ShiftProvider>
      </RulesProvider>
    </EmployeeListsProvider>
  );
}

export default App;