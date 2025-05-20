import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
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
  const { getCurrentList, updateList } = useEmployeeLists();
  
  // Uso de useMemo para evitar recálculos innecesarios del objeto priorities
  const priorities = useMemo(() => {
    const currentList = getCurrentList();
    return currentList?.priorities || {};
  }, [getCurrentList]);

  // Uso de useCallback para evitar recreación de la función en cada render
  const setPriorities = useCallback((newPriorities: ShiftPriorities) => {
    const currentList = getCurrentList();
    if (currentList) {
      updateList(currentList.id, { priorities: newPriorities });
    }
  }, [getCurrentList, updateList]);

  // Uso de useCallback para memoizar esta función
  const getFormattedPriorities = useCallback((day: string): string => {
    if (!priorities[day]) return '';

    const activePriorities = Object.entries(priorities[day])
      .filter(([_, isActive]) => isActive)
      .map(([shiftTime]) => shiftTime)
      .join(', ');

    return activePriorities || 'None';
  }, [priorities]);

  // Memoizar el valor del contexto para prevenir renderizados innecesarios
  const contextValue = useMemo(() => ({
    priorities,
    setPriorities,
    getFormattedPriorities
  }), [priorities, setPriorities, getFormattedPriorities]);

  return (
    <ShiftPrioritiesContext.Provider value={contextValue}>
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