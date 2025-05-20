import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useEmployeeLists } from './EmployeeListsContext';

export interface ShiftPriorities {
  [day: string]: { [shiftId: string]: boolean };
}

interface ShiftPrioritiesContextType {
  priorities: ShiftPriorities;
  setPriorities: (priorities: ShiftPriorities) => void;
  getFormattedPriorities: (day: string) => string;
}

const ShiftPrioritiesContext = createContext<ShiftPrioritiesContextType | undefined>(undefined);

export const ShiftPrioritiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usar try-catch para manejar el posible error de contexto no disponible
  let employeeListsContext;
  try {
    employeeListsContext = useEmployeeLists();
  } catch (error) {
    console.warn("EmployeeListsContext not available yet, using default values");
    employeeListsContext = {
      getCurrentList: () => null,
      updateList: () => console.warn("updateList not available")
    };
  }
  
  const { getCurrentList, updateList } = employeeListsContext;
  
  // Usar el operador opcional para evitar errores si getCurrentList es undefined
  const currentList = getCurrentList?.();
  const priorities = currentList?.priorities || {};

  const setPriorities = (newPriorities: ShiftPriorities) => {
    if (currentList) {
      updateList(currentList.id, { priorities: newPriorities });
    }
  };

  const getFormattedPriorities = (day: string): string => {
    if (!priorities[day]) return '';

    const activePriorities = Object.entries(priorities[day])
      .filter(([_, isActive]) => isActive)
      .map(([shiftTime]) => shiftTime)
      .join(', ');

    return activePriorities || 'None';
  };

  return (
    <ShiftPrioritiesContext.Provider value={{ priorities, setPriorities, getFormattedPriorities }}>
      {children}
    </ShiftPrioritiesContext.Provider>
  );
};

export const useShiftPriorities = () => {
  const context = useContext(ShiftPrioritiesContext);
  if (!context) {
    throw new Error('useShiftPriorities must be used within a ShiftPrioritiesProvider');
  }
  return context;
};