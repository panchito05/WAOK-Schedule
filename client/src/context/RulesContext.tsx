import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useEmployeeLists } from './EmployeeListsContext';

export interface RulesState {
  startDate: string;
  endDate: string;
  maxConsecutiveShifts: string;
  minDaysOffAfterMax: string;
  minWeekendsOffPerMonth: string;
  minRestHoursBetweenShifts: string;
  writtenRule1: string;
  writtenRule2: string;
  minHoursPerWeek: string;
  minHoursPerTwoWeeks: string;
}

interface RulesContextType {
  rules: RulesState;
  updateRules: (rules: Partial<RulesState>) => void;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

// Get current date and one month from now for default dates
const today = new Date();
const nextMonth = new Date(today);
nextMonth.setMonth(today.getMonth() + 1);

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Definir reglas predeterminadas fuera del componente para evitar recreaciones
const defaultRules: RulesState = {
  startDate: formatDate(today),
  endDate: formatDate(nextMonth),
  maxConsecutiveShifts: '5',
  minDaysOffAfterMax: '2',
  minWeekendsOffPerMonth: '2',
  minRestHoursBetweenShifts: '12',
  writtenRule1: '',
  writtenRule2: '',
  minHoursPerWeek: '40',
  minHoursPerTwoWeeks: '80'
};

export const RulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getCurrentList, updateList } = useEmployeeLists();
  
  // Uso de useMemo para evitar recálculos innecesarios del objeto rules
  const rules = useMemo(() => {
    const currentList = getCurrentList();
    return currentList?.rules || defaultRules;
  }, [getCurrentList]);

  // Uso de useCallback para evitar recreación de la función en cada render
  const updateRules = useCallback((newRules: Partial<RulesState>) => {
    const currentList = getCurrentList();
    if (currentList) {
      updateList(currentList.id, { 
        rules: { ...rules, ...newRules } 
      });
    }
  }, [getCurrentList, updateList, rules]);

  // Memoizar el valor del contexto para prevenir renderizados innecesarios
  const contextValue = useMemo(() => ({
    rules,
    updateRules
  }), [rules, updateRules]);

  return (
    <RulesContext.Provider value={contextValue}>
      {children}
    </RulesContext.Provider>
  );
};

export const useRules = () => {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
};