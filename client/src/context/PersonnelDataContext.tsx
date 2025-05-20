import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useEmployeeLists } from './EmployeeListsContext';

export interface ShiftData {
  id: number;
  name: string;
  timeRange: string;
  counts: number[];
  idealNumber: number;
}

interface PersonnelDataContextType {
  shiftData: ShiftData[];
  setShiftData: (shiftData: ShiftData[]) => void;
}

const PersonnelDataContext = createContext<PersonnelDataContextType | undefined>(undefined);

export const PersonnelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getCurrentList, updateList } = useEmployeeLists();
  
  // Uso de useMemo para evitar recálculos innecesarios del array shiftData
  const shiftData = useMemo(() => {
    const currentList = getCurrentList();
    return currentList?.shiftData || [];
  }, [getCurrentList]);

  // Uso de useCallback para evitar recreación de la función en cada render
  const setShiftData = useCallback((newShiftData: ShiftData[]) => {
    const currentList = getCurrentList();
    if (currentList) {
      updateList(currentList.id, { shiftData: newShiftData });
    }
  }, [getCurrentList, updateList]);

  // Memoizar el valor del contexto para prevenir renderizados innecesarios
  const contextValue = useMemo(() => ({
    shiftData,
    setShiftData
  }), [shiftData, setShiftData]);

  return (
    <PersonnelDataContext.Provider value={contextValue}>
      {children}
    </PersonnelDataContext.Provider>
  );
};

export const usePersonnelData = () => {
  const context = useContext(PersonnelDataContext);
  if (!context) {
    throw new Error('usePersonnelData must be used within a PersonnelDataProvider');
  }
  return context;
};