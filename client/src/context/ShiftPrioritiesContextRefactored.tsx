import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useStore } from './StoreContext';
import { ShiftPriorities } from '../types/common';

interface ShiftPrioritiesContextType {
  priorities: ShiftPriorities;
  setPriorities: (priorities: ShiftPriorities) => void;
  getFormattedPriorities: (day: string) => string;
}

const ShiftPrioritiesContext = createContext<ShiftPrioritiesContextType | undefined>(undefined);

export const ShiftPrioritiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getCurrentList, updateList, getShiftPriorities, getShifts } = useStore();
  
  // Obtener las prioridades del almacén central
  const priorities = useMemo(() => {
    return getShiftPriorities();
  }, [getShiftPriorities]);
  
  // Función para establecer las prioridades
  const setPriorities = useCallback((newPriorities: ShiftPriorities) => {
    const currentList = getCurrentList();
    if (currentList) {
      updateList(currentList.id, { priorities: newPriorities });
    }
  }, [getCurrentList, updateList]);
  
  // Función para formatear las prioridades para un día específico
  const getFormattedPriorities = useCallback((day: string): string => {
    if (!priorities[day] || Object.keys(priorities[day]).length === 0) {
      return 'No priorities set for this day';
    }
    
    const shifts = getShifts();
    const highPriorityShifts = Object.keys(priorities[day] || {})
      .filter(shiftId => priorities[day]?.[shiftId])
      .map(shiftId => {
        const shift = shifts.find(s => s.id === shiftId);
        return shift ? `${shift.startTime} - ${shift.endTime}` : null;
      })
      .filter(Boolean);
    
    if (highPriorityShifts.length === 0) {
      return 'No priorities set for this day';
    }
    
    return `Priority shifts: ${highPriorityShifts.join(', ')}`;
  }, [priorities, getShifts]);
  
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