import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { 
  ShiftRow, 
  ShiftOvertime, 
  Employee, 
  Rules, 
  ShiftPriorities, 
  ShiftData, 
  SpecialRules,
  EmployeeList 
} from '../types/common';

// Clave para localStorage - usamos una clave diferente para no interferir con el almacenamiento existente
const STORE_KEY = 'employeeLists'; // ✅ UNIFICADA: Misma clave que EmployeeListsContext

interface StoreContextType {
  // Funciones para listas de empleados
  lists: EmployeeList[];
  currentListId: string | null;
  addList: (name: string) => void;
  removeList: (id: string) => void;
  updateList: (id: string, data: Partial<EmployeeList>) => void;
  setCurrentList: (id: string) => void;
  getCurrentList: () => EmployeeList | null;
  
  // Getters específicos para evitar dependencias circulares
  getShifts: () => ShiftRow[];
  getRules: () => Rules;
  getShiftPriorities: () => ShiftPriorities;
  getShiftData: () => ShiftData[];
  getEmployees: () => Employee[];
  getSpecialRules: () => SpecialRules | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Función auxiliar para generar IDs únicos
const generateId = () => Math.random().toString(36).substr(2, 9);

// Función para generar IDs de turnos con formato aleatorio
const generateShiftId = () => `uid_${Math.random().toString(36).substr(2, 15)}`;

// Función auxiliar para formatear fechas
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Turnos por defecto eliminados - el usuario debe crear sus propios turnos
const getDefaultShifts = (): ShiftRow[] => {
  return [];
};

const getDefaultRules = (): Rules => {
  const today = new Date();
  
  // Calcula el primer día del mes siguiente
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  nextMonth.setDate(1);
  
  return {
    startDate: formatDate(today),
    endDate: formatDate(nextMonth),
    maxConsecutiveShifts: '5',
    minDaysOffAfterMax: '2',
    minWeekendsOffPerMonth: '1',
    minRestHoursBetweenShifts: '12',
    writtenRule1: 'Employees should have at least 10 hours of break between shifts',
    writtenRule2: 'Avoid scheduling back-to-back night shifts when possible',
    minHoursPerWeek: '32',
    minHoursPerTwoWeeks: '64'
  };
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado para listas y lista actual
  const [lists, setLists] = useState<EmployeeList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);

  // Carga inicial desde localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORE_KEY);
    if (savedData) {
      try {
        const { lists, currentListId } = JSON.parse(savedData);
        if (Array.isArray(lists)) {
          setLists(lists);
          setCurrentListId(currentListId);
        }
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  // Persistencia en localStorage cuando cambian los datos
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ lists, currentListId }));
  }, [lists, currentListId]);

  // Función para agregar una nueva lista
  const addList = useCallback((name: string) => {
    const newId = generateId();
    const newList: EmployeeList = {
      id: newId,
      name,
      employees: [],
      shifts: [], // Sin turnos por defecto - el usuario debe crear los suyos
      rules: getDefaultRules(),
      priorities: {},
      shiftData: [],
      specialRules: { employeeSelections: {} }
    };
    
    setLists(prev => [...prev, newList]);
    if (!currentListId) {
      setCurrentListId(newId);
    }
  }, [currentListId]);

  // Función para eliminar una lista
  const removeList = useCallback((id: string) => {
    setLists(prev => prev.filter(list => list.id !== id));
    if (currentListId === id) {
      const remainingLists = lists.filter(list => list.id !== id);
      setCurrentListId(remainingLists.length > 0 ? remainingLists[0].id : null);
    }
  }, [currentListId, lists]);

  // Función para actualizar una lista
  const updateList = useCallback((id: string, data: Partial<EmployeeList>) => {
    setLists(prev => prev.map(list => 
      list.id === id 
        ? { ...list, ...data } 
        : list
    ));
  }, []);

  // Función para obtener la lista actual
  const getCurrentList = useCallback(() => {
    return lists.find(list => list.id === currentListId) || null;
  }, [lists, currentListId]);

  // Getters específicos para evitar dependencias circulares
  const getShifts = useCallback(() => {
    const current = getCurrentList();
    return current?.shifts || [];
  }, [getCurrentList]);

  const getRules = useCallback(() => {
    const current = getCurrentList();
    return current?.rules || getDefaultRules();
  }, [getCurrentList]);

  const getShiftPriorities = useCallback(() => {
    const current = getCurrentList();
    return current?.priorities || {};
  }, [getCurrentList]);

  const getShiftData = useCallback(() => {
    const current = getCurrentList();
    return current?.shiftData || [];
  }, [getCurrentList]);

  const getEmployees = useCallback(() => {
    const current = getCurrentList();
    return current?.employees || [];
  }, [getCurrentList]);

  const getSpecialRules = useCallback(() => {
    const current = getCurrentList();
    return current?.specialRules;
  }, [getCurrentList]);

  const contextValue = {
    lists,
    currentListId,
    addList,
    removeList,
    updateList,
    setCurrentList: setCurrentListId,
    getCurrentList,
    getShifts,
    getRules,
    getShiftPriorities,
    getShiftData,
    getEmployees,
    getSpecialRules
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};