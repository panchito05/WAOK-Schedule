import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StoreProvider } from './context/StoreContext';
import { ShiftProvider } from './context/ShiftContextRefactored';
import { RulesProvider } from './context/RulesContextRefactored';
import { PersonnelDataProvider } from './context/PersonnelDataContextRefactored';
import { ShiftPrioritiesProvider } from './context/ShiftPrioritiesContextRefactored';
import { SelectedEmployeesProvider } from './context/SelectedEmployeesContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
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
    </StoreProvider>
  </StrictMode>
);
