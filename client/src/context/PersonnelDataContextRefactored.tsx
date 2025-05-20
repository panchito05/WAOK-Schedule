import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useStore } from './StoreContext';
import { ShiftData } from '../types/common';

interface PersonnelDataContextType {
  shiftData: ShiftData[];
  setShiftData: (shiftData: ShiftData[]) => void;
}

const PersonnelDataContext = createContext<PersonnelDataContextType | undefined>(undefined);

export const PersonnelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getCurrentList, updateList, getShiftData } = useStore();
  
  // Obtener los datos de personal del almacén central
  const shiftData = useMemo(() => {
    return getShiftData();
  }, [getShiftData]);
  
  // Función para actualizar los datos de personal
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