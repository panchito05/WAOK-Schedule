import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
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
  
  // Estado local para forzar re-renderización cuando cambie la lista
  const [, forceUpdate] = useState({});
  
  // Usar el operador opcional para evitar errores si getCurrentList es undefined
  const currentList = getCurrentList?.();
  const shiftData = currentList?.shiftData || [];
  
  // useEffect para detectar cambios en la lista actual y forzar actualización
  useEffect(() => {
    forceUpdate({});
  }, [currentList?.id]);

  const setShiftData = (newShiftData: ShiftData[]) => {
    if (currentList) {
      updateList(currentList.id, { shiftData: newShiftData });
    }
  };

  return (
    <PersonnelDataContext.Provider value={{ shiftData, setShiftData }}>
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