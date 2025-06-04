import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useEmployeeLists } from './EmployeeListsContext';
import { ShiftRow, ShiftOvertime } from '../types/common';

// Re-exportamos los tipos para mantener compatibilidad
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
  
  // Uso de useMemo para evitar recálculos innecesarios del array shifts y la propiedad isGlobalOvertimeActive
  const { shifts, isGlobalOvertimeActive } = useMemo(() => {
    const currentList = getCurrentList?.() || null;
    const shiftsArray = currentList?.shifts || [];
    // Aseguramos que cada shift tiene su propiedad isOvertimeActive correctamente definida
    const safeShiftsArray = shiftsArray.map(shift => ({
      ...shift,
      id: shift.id || `uid_${Math.random().toString(36).substr(2, 15)}`,
      isOvertimeActive: shift.isOvertimeActive || false,
      overtimeEntries: shift.overtimeEntries || []
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
        id: shift.id || `uid_${Math.random().toString(36).substr(2, 15)}`,
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
      // Aseguramos que mantenemos todas las propiedades requeridas
      newShifts[index] = {
        ...shift,
        id: shift.id || newShifts[index].id || `uid_${Math.random().toString(36).substr(2, 15)}`,
        isOvertimeActive: shift.isOvertimeActive || newShifts[index].isOvertimeActive || false,
        overtimeEntries: shift.overtimeEntries || newShifts[index].overtimeEntries || []
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
        id: shift.id || `uid_${Math.random().toString(36).substr(2, 15)}`,
        isOvertimeActive: !isGlobalOvertimeActive,
        overtimeEntries: shift.overtimeEntries || []
      }));
      updateList(currentList.id, { shifts: newShifts });
    }
  }, [getCurrentList, updateList, isGlobalOvertimeActive]);

  const toggleShiftOvertime = useCallback((index: number, active: boolean) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = [...currentList.shifts];
      // Aseguramos que todas las propiedades requeridas estén presentes
      newShifts[index] = {
        ...newShifts[index],
        id: newShifts[index].id || `uid_${Math.random().toString(36).substr(2, 15)}`,
        isOvertimeActive: active,
        overtimeEntries: newShifts[index].overtimeEntries || []
      };
      updateList(currentList.id, { shifts: newShifts });
    }
  }, [getCurrentList, updateList]);

  const setShiftOvertimeForDate = useCallback((shiftIndex: number, date: string, quantity: number, isActive: boolean) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = [...currentList.shifts];
      const shift = newShifts[shiftIndex];
      
      // Crear una copia del shift para no modificar el original directamente
      const updatedShift: ShiftRow = {
        ...shift,
        id: shift.id || `uid_${Math.random().toString(36).substr(2, 15)}`,
        isOvertimeActive: shift.isOvertimeActive || false,
        overtimeEntries: shift.overtimeEntries ? [...shift.overtimeEntries] : []
      };

      const existingEntryIndex = updatedShift.overtimeEntries.findIndex(entry => entry.date === date);

      if (existingEntryIndex >= 0) {
        // Creamos un nuevo array para mantener la inmutabilidad
        updatedShift.overtimeEntries = [
          ...updatedShift.overtimeEntries.slice(0, existingEntryIndex),
          { date, quantity, isActive },
          ...updatedShift.overtimeEntries.slice(existingEntryIndex + 1)
        ];
      } else {
        updatedShift.overtimeEntries = [...updatedShift.overtimeEntries, { date, quantity, isActive }];
      }

      // Actualizar el shift en el array
      newShifts[shiftIndex] = updatedShift;
      
      // Actualizar la lista
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