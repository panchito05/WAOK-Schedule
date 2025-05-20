import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

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
  id?: string;
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

// Get current date and one month from now for default dates
const today = new Date();
const nextMonth = new Date(today);
nextMonth.setMonth(today.getMonth() + 1);

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper para propiedades por defecto de empleados
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
      employees: [],
      shifts: defaultShifts,
      rules: defaultRules,
      priorities: {},
      shiftData: []
    }];
  });

  const [currentListId, setCurrentListId] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const storedListId = parsed.currentListId;
        const foundList = parsed.lists?.find((list: { id: string; }) => list.id === storedListId);
        return foundList ? storedListId : (parsed.lists?.[0]?.id || null);
      } catch (error) {
        console.error("Failed to parse currentListId from localStorage", error);
      }
    }
    return lists[0]?.id || null;
  });

  // Save to localStorage whenever lists or currentListId changes
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists, currentListId }));
  }, [lists, currentListId]);

  // Uso de useCallback para memoizar la función getCurrentList
  const getCurrentList = useCallback(() => {
    return lists.find(list => list.id === currentListId) || null;
  }, [lists, currentListId]);

  // Uso de useCallback para memoizar la función addList
  const addList = useCallback((name: string) => {
    const defaultShifts = [
      { id: `shift_${Date.now()}_1`, startTime: "07:00 AM", endTime: "03:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { id: `shift_${Date.now()}_2`, startTime: "03:00 PM", endTime: "11:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { id: `shift_${Date.now()}_3`, startTime: "11:00 PM", endTime: "07:00 AM", duration: "8h 0m", lunchBreakDeduction: 0 }
    ];

    const newList: EmployeeList = {
      id: crypto.randomUUID(),
      name,
      employees: [],
      shifts: defaultShifts,
      rules: {
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
      },
      priorities: {},
      shiftData: []
    };
    setLists(prev => [...prev, newList]);
    setCurrentListId(newList.id); // Automatically select the new list
  }, []);

  // Uso de useCallback para memoizar la función removeList
  const removeList = useCallback((id: string) => {
    setLists(prev => {
      const filteredLists = prev.filter(list => list.id !== id);
      if (currentListId === id && filteredLists.length > 0) {
        setCurrentListId(filteredLists[0].id);
      } else if (filteredLists.length === 0) {
        setCurrentListId(null);
      }
      return filteredLists;
    });
  }, [currentListId]);

  // Uso de useCallback para memoizar la función updateList
  const updateList = useCallback((id: string, data: Partial<EmployeeList>) => {
    setLists(prev => prev.map(list => 
      list.id === id 
        ? { ...list, ...data }
        : list
    ));
  }, []);

  // Uso de useMemo para memoizar el valor del contexto
  const contextValue = useMemo(() => ({
    lists,
    currentListId,
    addList,
    removeList,
    updateList,
    setCurrentList: setCurrentListId,
    getCurrentList
  }), [lists, currentListId, addList, removeList, updateList, setCurrentListId, getCurrentList]);

  return (
    <EmployeeListsContext.Provider value={contextValue}>
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