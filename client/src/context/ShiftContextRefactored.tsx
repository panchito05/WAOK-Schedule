import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useStore } from './StoreContext';
import { ShiftRow, ShiftOvertime } from '../types/common';

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
  const { getCurrentList, updateList, getShifts } = useStore();
  
  // Usar getShifts para obtener los turnos del contexto central
  const { shifts, isGlobalOvertimeActive } = useMemo(() => {
    const shiftsArray = getShifts();
    // Aseguramos que cada shift tiene su propiedad isOvertimeActive correctamente definida
    const safeShiftsArray = shiftsArray.map(shift => ({
      ...shift,
      isOvertimeActive: shift.isOvertimeActive || false,
      overtimeEntries: shift.overtimeEntries || []
    }));
    const globalOvertimeStatus = safeShiftsArray.length > 0 && safeShiftsArray.every(shift => shift.isOvertimeActive);
    return { 
      shifts: safeShiftsArray, 
      isGlobalOvertimeActive: globalOvertimeStatus 
    };
  }, [getShifts]);

  // Función para agregar un turno
  const addShift = useCallback((shift: ShiftRow) => {
    const currentList = getCurrentList();
    if (currentList) {
      // Asegurarnos que todos los campos obligatorios estén presentes
      const newShift: ShiftRow = {
        ...shift,
        id: shift.id || `uid_${Math.random().toString(36).substr(2, 15)}`,
        isOvertimeActive: shift.isOvertimeActive || false,
        overtimeEntries: shift.overtimeEntries || []
      };
      updateList(currentList.id, { shifts: [...currentList.shifts, newShift] });
    }
  }, [getCurrentList, updateList]);

  // Función para actualizar un turno
  const updateShift = useCallback((index: number, shift: ShiftRow) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = [...currentList.shifts];
      // Asegurarnos que mantenemos todas las propiedades requeridas
      newShifts[index] = {
        ...shift,
        id: shift.id || newShifts[index].id || `uid_${Math.random().toString(36).substr(2, 15)}`,
        isOvertimeActive: shift.isOvertimeActive || newShifts[index].isOvertimeActive || false,
        overtimeEntries: shift.overtimeEntries || newShifts[index].overtimeEntries || []
      };
      updateList(currentList.id, { shifts: newShifts });
    }
  }, [getCurrentList, updateList]);

  // Función para eliminar un turno
  const deleteShift = useCallback((index: number) => {
    const currentList = getCurrentList();
    if (currentList) {
      updateList(currentList.id, { 
        shifts: currentList.shifts.filter((_, i) => i !== index) 
      });
    }
  }, [getCurrentList, updateList]);

  // Función para activar/desactivar horas extra en todos los turnos
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

  // Función para activar/desactivar horas extra en un turno específico
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

  // Función para establecer horas extra para una fecha específica
  const setShiftOvertimeForDate = useCallback((shiftIndex: number, date: string, quantity: number, isActive: boolean) => {
    const currentList = getCurrentList();
    if (currentList) {
      const newShifts = [...currentList.shifts];
      const shift = newShifts[shiftIndex];
      
      // Crear una copia del turno para no modificar el original directamente
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

      // Actualizar el turno en el array
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