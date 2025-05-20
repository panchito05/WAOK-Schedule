import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { EmployeeListsProvider } from './context/EmployeeListsContext';
import { ShiftProvider } from './context/ShiftContext';
import { RulesProvider } from './context/RulesContext';
import { PersonnelDataProvider } from './context/PersonnelDataContext';
import { ShiftPrioritiesProvider } from './context/ShiftPrioritiesContext';
import { SelectedEmployeesProvider } from './context/SelectedEmployeesContext';

// Usamos la estructura original de contextos para mantener la aplicación funcionando
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmployeeListsProvider>
      <ShiftProvider>
        <RulesProvider>
          <PersonnelDataProvider>
            <ShiftPrioritiesProvider>
              <SelectedEmployeesProvider>
                <App />
              </SelectedEmployeesProvider>
            </ShiftPrioritiesProvider>
          </PersonnelDataProvider>
        </RulesProvider>
      </ShiftProvider>
    </EmployeeListsProvider>
  </StrictMode>
);
