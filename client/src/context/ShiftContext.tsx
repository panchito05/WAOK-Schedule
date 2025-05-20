import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useEmployeeLists } from './EmployeeListsContext';

export interface ShiftRow {
  id?: string;
  startTime: string;
  endTime: string;
  duration: string;
  lunchBreakDeduction: number;
  isOvertimeActive?: boolean;
  overtimeEntries?: {
    date: string;
    quantity: number;
    isActive: boolean;
  }[];
}

interface ShiftContextType {
  shifts: ShiftRow[];
  isGlobalOvertimeActive: boolean;
  addShift: (shift: ShiftRow) => void;
  updateShift: (index: number, shift: ShiftRow) => void;
  deleteShift: (index: number) => void;
  toggleGlobalOvertime: (active: boolean) => void;
  toggleShiftOvertime: (index: number, active: boolean) => void;
  setShiftOvertimeForDate: (shiftIndex: number, date: string, quantity: number, isActive: boolean) => void;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getCurrentList, updateList } = useEmployeeLists();
  const currentList = getCurrentList();
  const shifts = currentList?.shifts || [];
  const isGlobalOvertimeActive = shifts.every(shift => shift.isOvertimeActive);

  const addShift = (shift: ShiftRow) => {
    if (currentList) {
      // Ensure the shift has an ID
      const newShift = {
        ...shift,
        id: `shift_${shifts.length + 1}`
      };
      updateList(currentList.id, { shifts: [...shifts, newShift] });
    }
  };

  const updateShift = (index: number, shift: ShiftRow) => {
    if (currentList) {
      const newShifts = [...shifts];
      // Preserve the existing ID when updating
      newShifts[index] = {
        ...shift,
        id: newShifts[index].id || `shift_${index + 1}`
      };
      updateList(currentList.id, { shifts: newShifts });
    }
  };

  const deleteShift = (index: number) => {
    if (currentList) {
      updateList(currentList.id, { shifts: shifts.filter((_, i) => i !== index) });
    }
  };

  const toggleGlobalOvertime = (active: boolean) => {
    if (currentList) {
      const newShifts = shifts.map(shift => ({
        ...shift,
        isOvertimeActive: !isGlobalOvertimeActive
      }));
      updateList(currentList.id, { shifts: newShifts });
    }
  };

  const toggleShiftOvertime = (index: number, active: boolean) => {
    if (currentList) {
      const newShifts = [...shifts];
      newShifts[index] = {
        ...newShifts[index],
        isOvertimeActive: active
      };
      updateList(currentList.id, { shifts: newShifts });
    }
  };

  const setShiftOvertimeForDate = (shiftIndex: number, date: string, quantity: number, isActive: boolean) => {
    if (currentList) {
      const newShifts = [...shifts];
      const shift = newShifts[shiftIndex];

      if (!shift.overtimeEntries) {
        shift.overtimeEntries = [];
      }

      const existingEntryIndex = shift.overtimeEntries.findIndex(entry => entry.date === date);

      if (existingEntryIndex >= 0) {
        shift.overtimeEntries[existingEntryIndex] = { date, quantity, isActive };
      } else {
        shift.overtimeEntries.push({ date, quantity, isActive });
      }

      updateList(currentList.id, { shifts: newShifts });
    }
  };
  return (
    <ShiftContext.Provider value={{ 
      shifts, 
      isGlobalOvertimeActive,
      addShift, 
      updateShift, 
      deleteShift,
      toggleGlobalOvertime,
      toggleShiftOvertime,
      setShiftOvertimeForDate
    }}>
      {children}
    </ShiftContext.Provider>
  );
};

export const useShiftContext = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShiftContext must be used within a ShiftProvider');
  }
  return context;
};