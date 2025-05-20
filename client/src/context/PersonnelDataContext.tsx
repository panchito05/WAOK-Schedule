import React, { createContext, useState, useContext, ReactNode } from 'react';
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
  const currentList = getCurrentList();
  const shiftData = currentList?.shiftData || [];

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