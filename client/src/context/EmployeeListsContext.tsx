import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  shiftPreferences: (number | null)[];
  blockedShifts: { [shiftId: string]: string[] };
  notes: {
    confidential: string;
    aiRules: string;
  };
}

interface ShiftRow {
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

export const EmployeeListsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<EmployeeList[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.lists;
    }
    // Create default list if none exists
    const defaultShifts = [
      { startTime: "07:00 AM", endTime: "03:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { startTime: "03:00 PM", endTime: "11:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { startTime: "11:00 PM", endTime: "07:00 AM", duration: "8h 0m", lunchBreakDeduction: 0 }
    ];

    return [{
      id: 'default',
      name: 'Default List',
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
    }];
  });

  const [currentListId, setCurrentListId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.currentListId || 'default';
    }
    return 'default';
  });

  // Save to localStorage whenever lists or currentListId changes
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists, currentListId }));
  }, [lists, currentListId]);

  const addList = (name: string) => {
    const defaultShifts = [
      { startTime: "07:00 AM", endTime: "03:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { startTime: "03:00 PM", endTime: "11:00 PM", duration: "8h 0m", lunchBreakDeduction: 0 },
      { startTime: "11:00 PM", endTime: "07:00 AM", duration: "8h 0m", lunchBreakDeduction: 0 }
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
  };

  const removeList = (id: string) => {
    setLists(prev => prev.filter(list => list.id !== id));
    if (currentListId === id) {
      const remainingLists = lists.filter(list => list.id !== id);
      setCurrentListId(remainingLists[0]?.id || 'default');
    }
  };

  const updateList = (id: string, data: Partial<EmployeeList>) => {
    setLists(prev => prev.map(list => 
      list.id === id 
        ? { ...list, ...data }
        : list
    ));
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