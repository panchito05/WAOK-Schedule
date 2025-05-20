// src/context/EmployeeListsContext.tsx - CODIGO CON LA SOLUCION aplicando la lógica de persistencia detallada
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  fixedShifts: { [day: string]: string[] };
  maxConsecutiveShifts: number;
  shiftPreferences: (number | null)[];
  leave: { id: string; startDate: string; endDate: string; leaveType: string; hoursPerDay: number }[];
  blockedShifts: { [shiftId: string]: string[] };
  notes: {
    confidential: string;
    aiRules: string;
  };
}

interface ShiftRow {
  id?: string; // Added optional ID for stability
  startTime: string;
  endTime: string;
  duration: string;
  lunchBreakDeduction: number;
}

interface Rules {
  startDate: string;
  endDate: string;
  maxConsecutiveShifts: string;
  minDaysOffAfterMax: string;
  minWeekendsOffPerMonth: string;
  minRestHoursBetweenShifts: string;
  writtenRule1: string;
  writtenRule2: string;
  minHoursPerWeek: string;
  minHoursPerTwoWeeks: string;
}

interface ShiftPriorities {
  [day: string]: { [shiftId: string]: boolean };
}

interface ShiftData {
  id: number;
  name: string;
  timeRange: string;
  counts: number[];
  idealNumber: number;
}

interface EmployeeList {
  id: string;
  name: string;
  employees: Employee[];
  shifts: ShiftRow[];
  rules: Rules;
  priorities: ShiftPriorities;
  shiftData: ShiftData[];
}

interface EmployeeListsContextType {
  lists: EmployeeList[];
  currentListId: string | null;
  addList: (name: string) => void;
  removeList: (id: string) => void;
  updateList: (id: string, data: Partial<EmployeeList>) => void;
  setCurrentList: (id: string) => void;
  getCurrentList: () => EmployeeList | null;
}

const EmployeeListsContext = createContext<EmployeeListsContextType | undefined>(undefined);

const STORAGE_KEY = 'employeeLists';

const today = new Date();
const nextMonth = new Date(today);
nextMonth.setMonth(today.getMonth() + 1);

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper to provide default employee props for loading/migration
const defaultEmployeeProps = (rules: Rules, shiftsCount: number) => ({
  fixedShifts: {},
  maxConsecutiveShifts: parseInt(rules.maxConsecutiveShifts) || 5,
  shiftPreferences: Array(shiftsCount).fill(null),
  leave: [],
  blockedShifts: {},
  notes: {
    confidential: '',
    aiRules: ''
  }
});


export const EmployeeListsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<EmployeeList[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Logic to ensure parsed data has correct structure and defaults
        if (parsed.lists) {
          return parsed.lists.map((list: EmployeeList) => ({
            ...list,
            // Ensure shifts have IDs if not present in saved data for compatibility
            shifts: list.shifts.map((shift: ShiftRow, index) => ({
                 id: shift.id || `shift_${index + 1}`, // Add default ID if missing
                ...shift
            })),
            employees: list.employees.map((emp: any) => {
              // Ensure nested objects/arrays exist and have defaults if missing
              const employeeNotes = emp.notes || { confidential: '', aiRules: '' };
              const employeeFixedShifts = emp.fixedShifts || {};
              const employeeLeave = emp.leave || [];
              const employeeBlockedShifts = emp.blockedShifts || {};
              const employeeShiftPreferences = Array.isArray(emp.shiftPreferences) && emp.shiftPreferences.length === list.shifts.length
                                               ? emp.shiftPreferences
                                               : Array(list.shifts.length).fill(null);
              const employeeMaxConsecutiveShifts = typeof emp.maxConsecutiveShifts === 'number'
                                                   ? emp.maxConsecutiveShifts
                                                   : (parseInt(list.rules.maxConsecutiveShifts) || 5);

              return {
                // Apply defaults *first*, then spread saved data to overwrite
                ...defaultEmployeeProps(list.rules, list.shifts.length),
                ...emp, // Saved data might overwrite defaults
                // Explicitly set nested objects/arrays ensuring they are not null/undefined after spreading saved data
                notes: employeeNotes,
                fixedShifts: employeeFixedShifts,
                leave: employeeLeave,
                blockedShifts: employeeBlockedShifts,
                shiftPreferences: employeeShiftPreferences,
                maxConsecutiveShifts: employeeMaxConsecutiveShifts,
              };
            }),
          }));
        }
      } catch (error) {
        console.error("Failed to parse employee lists from localStorage", error);
        // Fallback to default list if parsing fails
      }
    }
    // Create default list if none exists or parsing failed
    const defaultShifts: ShiftRow[] = [
      { id: 'shift_1', startTime: "07:00 AM", endTime: "03:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { id: 'shift_2', startTime: "03:00 PM", endTime: "11:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { id: 'shift_3', startTime: "11:00 PM", endTime: "07:00 AM", duration: "8h 0m", lunchBreakDeduction: 0 }
    ];
    const defaultRules: Rules = {
      startDate: formatDate(today),
      endDate: formatDate(nextMonth),
      maxConsecutiveShifts: '5',
      minDaysOffAfterMax: '1',
      minWeekendsOffPerMonth: '1',
      minRestHoursBetweenShifts: '16',
      writtenRule1: '',
      writtenRule2: '',
      minHoursPerWeek: '40',
      minHoursPerTwoWeeks: '80'
    };

    return [{
      id: 'default',
      name: 'Default List',
      employees: [], // Start with empty employees, they will be added with defaults
      shifts: defaultShifts,
      rules: defaultRules,
      priorities: {},
      shiftData: []
    }];
  });

  const [currentListId, setCurrentListId] = useState<string | null>(() => { // Allow null
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
         // Check if the stored current list ID is valid
        const storedListId = parsed.currentListId;
        const foundList = parsed.lists?.find((list: { id: string; }) => list.id === storedListId);
        // Use the found list ID, or the first list ID, or null if no lists
        return foundList ? storedListId : (parsed.lists?.[0]?.id || null);
      } catch (error) {
        console.error("Failed to parse currentListId from localStorage", error);
        // Fallback to default or null
      }
    }
    // Fallback if nothing in storage or parsing failed
    // Check if the initial `lists` state contains a 'default' list
    const defaultList = lists.find(list => list.id === 'default');
    return defaultList ? 'default' : (lists.length > 0 ? lists[0].id : null);
  });

  // SOLUCIÓN AQUÍ: Modificar el useEffect para guardar de forma más explícita
  // Esto asegura que, al serializar, todas las propiedades esperadas estén presentes.
  useEffect(() => {
    // Crear una copia serializable asegurando la estructura
    const serializableLists = lists.map(list => ({
      id: list.id,
      name: list.name,
      // Asegurar que employees array and objects are structured correctly
      employees: list.employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email || '', // Ensure empty string instead of null/undefined
        phone: emp.phone || '', // Ensure empty string instead of null/undefined
        hireDate: emp.hireDate,
        // Ensure nested objects/arrays are not null/undefined
        fixedShifts: emp.fixedShifts || {},
        maxConsecutiveShifts: emp.maxConsecutiveShifts || parseInt(list.rules.maxConsecutiveShifts) || 5,
        shiftPreferences: emp.shiftPreferences || Array(list.shifts.length).fill(null),
        leave: emp.leave || [],
        blockedShifts: emp.blockedShifts || {},
        notes: {
          confidential: emp.notes?.confidential || '', // Handle potential undefined/null notes object
          aiRules: emp.notes?.aiRules || '' // Handle potential undefined/null notes object
        }
      })),
      // Ensure other list properties are included
      shifts: list.shifts.map(shift => ({ // Ensure shift IDs are saved
          id: shift.id, // Assuming shifts now consistently have IDs
          startTime: shift.startTime,
          endTime: shift.endTime,
          duration: shift.duration,
          lunchBreakDeduction: shift.lunchBreakDeduction
      })),
      rules: list.rules,
      priorities: list.priorities,
      shiftData: list.shiftData
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      lists: serializableLists,
      currentListId 
    }));
  }, [lists, currentListId]); // Dependencias correctas

  // Keep the original updateList function as it handles immutability correctly at the list and data level
  // The deep copy for employees is handled in the component before calling this.
  const updateList = (id: string, data: Partial<EmployeeList>) => {
    setLists(prev => prev.map(list =>
      list.id === id
        ? { ...list, ...data } // This creates a new list object reference and includes new data (like the new employees array reference)
        : list // Other lists remain with their original references
    ));
     // The useEffect above will handle saving the updated state to localStorage
  };

  // Keep other functions as they were...
   const addList = (name: string) => {
    const defaultShifts: ShiftRow[] = [ // Ensure default shifts have IDs
      { id: 'shift_1', startTime: "07:00 AM", endTime: "03:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { id: 'shift_2', startTime: "03:00 PM", endTime: "11:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { id: 'shift_3', startTime: "11:00 PM", endTime: "07:00 AM", duration: "8h 0m", lunchBreakDeduction: 0 }
    ];
    const defaultRules: Rules = {
      startDate: formatDate(today),
      endDate: formatDate(nextMonth),
      maxConsecutiveShifts: '5',
      minDaysOffAfterMax: '1',
      minWeekendsOffPerMonth: '1',
      minRestHoursBetweenShifts: '16',
      writtenRule1: '',
      writtenRule2: '',
      minHoursPerWeek: '40',
      minHoursPerTwoWeeks: '80'
    };

    const newList: EmployeeList = {
      id: crypto.randomUUID(),
      name,
      employees: [],
      shifts: defaultShifts,
      rules: defaultRules,
      priorities: {},
      shiftData: []
    };
    setLists(prev => [...prev, newList]);
    setCurrentListId(newList.id);
  };

  const removeList = (id: string) => {
    setLists(prev => {
      const newLists = prev.filter(list => list.id !== id);
      if (currentListId === id) {
         // Set current list to the first available or null if none remain
        setCurrentListId(newLists[0]?.id || null);
      }
      return newLists;
    });
  };


  const getCurrentList = () => {
    return lists.find(list => list.id === currentListId) || null;
  };


  return (
    <EmployeeListsContext.Provider value={{
      lists,
      currentListId,
      addList,
      removeList,
      updateList,
      setCurrentList: setCurrentListId,
      getCurrentList
    }}>
      {children}
    </EmployeeListsContext.Provider>
  );
};

export const useEmployeeLists = () => {
  const context = useContext(EmployeeListsContext);
  if (!context) {
    throw new Error('useEmployeeLists must be used within an EmployeeListsProvider');
  }
  return context;
};