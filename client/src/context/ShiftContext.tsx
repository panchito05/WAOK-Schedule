import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useEmployeeLists } from './EmployeeListsContext';
import { ShiftRow, ShiftOvertime } from '../types/common';

// Exportamos la interfaz para que pueda ser utilizada en otras partes
export type { ShiftRow, ShiftOvertime };

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
  
  // Uso de useMemo para evitar recálculos innecesarios del array shifts y la propiedad isGlobalOvertimeActive
  const { shifts, isGlobalOvertimeActive } = useMemo(() => {
    const currentList = getCurrentList();
    const shiftsArray = currentList?.shifts || [];
    // Aseguramos que cada shift tiene su propiedad isOvertimeActive correctamente definida
    const safeShiftsArray = shiftsArray.map(shift => ({
      ...shift,
      isOvertimeActive: shift.isOvertimeActive || false
    }));
    const globalOvertimeStatus = safeShiftsArray.length > 0 && safeShiftsArray.every(shift => shift.isOvertimeActive);
    return { 
      shifts: safeShiftsArray, 
      isGlobalOvertimeActive: globalOvertimeStatus 
    };
  }, [getCurrentList]);

  // Uso de useCallback para todas las funciones que modifican el estado
  const addShift = useCallback((shift: ShiftRow) => {
    const currentList = getCurrentList();
    if (currentList) {
      // Aseguramos que todos los campos obligatorios estén presentes
      const newShift: ShiftRow = {
        ...shift,
        id: shift.id || `shift_${currentList.shifts.length + 1}`,
        isOvertimeActive: shift.isOvertimeActive || false,
        overtimeEntries: shift.overtimeEntries || []
      };
      updateList(currentList.id, { shifts: [...currentList.shifts, newShift] });
    }
  }, [getCurrentList, updateList]);

  const updateShift = useCallback((index: number, shift: ShiftRow) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = [...currentList.shifts];
      // Preserve the existing ID when updating
      newShifts[index] = {
        ...shift,
        id: newShifts[index].id || `shift_${index + 1}`
      };
      updateList(currentList.id, { shifts: newShifts });
    }
  }, [getCurrentList, updateList]);

  const deleteShift = useCallback((index: number) => {
    const currentList = getCurrentList();
    if (currentList) {
      updateList(currentList.id, { 
        shifts: currentList.shifts.filter((_, i) => i !== index) 
      });
    }
  }, [getCurrentList, updateList]);

  const toggleGlobalOvertime = useCallback((active: boolean) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = currentList.shifts.map(shift => ({
        ...shift,
        isOvertimeActive: !isGlobalOvertimeActive
      }));
      updateList(currentList.id, { shifts: newShifts });
    }
  }, [getCurrentList, updateList, isGlobalOvertimeActive]);

  const toggleShiftOvertime = useCallback((index: number, active: boolean) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = [...currentList.shifts];
      newShifts[index] = {
        ...newShifts[index],
        isOvertimeActive: active
      };
      updateList(currentList.id, { shifts: newShifts });
    }
  }, [getCurrentList, updateList]);

  const setShiftOvertimeForDate = useCallback((shiftIndex: number, date: string, quantity: number, isActive: boolean) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = [...currentList.shifts];
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
  }, [getCurrentList, updateList]);
  
  // Memoizar el valor del contexto para prevenir renderizados innecesarios
  const contextValue = useMemo(() => ({ 
    shifts, 
    isGlobalOvertimeActive,
    addShift, 
    updateShift, 
    deleteShift,
    toggleGlobalOvertime,
    toggleShiftOvertime,
    setShiftOvertimeForDate
  }), [
    shifts, 
    isGlobalOvertimeActive,
    addShift, 
    updateShift, 
    deleteShift,
    toggleGlobalOvertime,
    toggleShiftOvertime,
    setShiftOvertimeForDate
  ]);

  return (
    <ShiftContext.Provider value={contextValue}>
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