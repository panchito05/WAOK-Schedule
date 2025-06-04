import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  shiftPreferences: (number | null)[];
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

interface SpecialRules {
  employeeSelections?: {
    [buttonId: string]: string[];
  }
}

interface EmployeeList {
  id: string;
  name: string;
  employees: Employee[];
  shifts: ShiftRow[];
  rules: Rules;
  priorities: ShiftPriorities;
  shiftData: ShiftData[];
  specialRules?: SpecialRules;
}

interface EmployeeListsContextType {
  lists: EmployeeList[];
  currentListId: string | null;
  refreshTrigger: number;
  addList: (name: string) => void;
  removeList: (id: string) => void;
  updateList: (id: string, data: Partial<EmployeeList>) => void;
  setCurrentList: (id: string) => void;
  getCurrentList: () => EmployeeList | null;
}

const EmployeeListsContext = createContext<EmployeeListsContextType | undefined>(undefined);

const STORAGE_KEY = 'employeeLists';

// Turnos por defecto eliminados - el usuario debe crear sus propios turnos

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
    const defaultShifts: ShiftRow[] = []; // Sin turnos por defecto

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

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Save to localStorage whenever lists or currentListId changes
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists, currentListId }));
  }, [lists, currentListId]);

  const addList = (name: string) => {
    // Generación automática de los 3 turnos con IDs únicos y horarios fijos
    const defaultShifts: ShiftRow[] = [
      {
        id: crypto.randomUUID(),
        startTime: '7:00 AM',
        endTime: '3:00 PM',
        duration: '8:00',
        lunchBreakDeduction: 0,
        isOvertimeActive: false,
        overtimeEntries: [],
        start: '7:00 AM',
        end: '3:00 PM',
        lunchBreak: 0,
        nurseCounts: {},
        shiftComments: 'Turno matutino 7 AM - 3 PM',
        name: 'TURNO DE DÍA',
        color: ''
      },
      {
        id: crypto.randomUUID(),
        startTime: '3:00 PM',
        endTime: '11:00 PM',
        duration: '8:00',
        lunchBreakDeduction: 0,
        isOvertimeActive: false,
        overtimeEntries: [],
        start: '3:00 PM',
        end: '11:00 PM',
        lunchBreak: 0,
        nurseCounts: {},
        shiftComments: 'Turno vespertino 3 PM - 11 PM',
        name: 'TURNO DE TARDE',
        color: ''
      },
      {
        id: crypto.randomUUID(),
        startTime: '11:00 PM',
        endTime: '7:00 AM',
        duration: '8:00',
        lunchBreakDeduction: 0,
        isOvertimeActive: false,
        overtimeEntries: [],
        start: '11:00 PM',
        end: '7:00 AM',
        lunchBreak: 0,
        nurseCounts: {},
        shiftComments: 'Turno nocturno 11 PM - 7 AM',
        name: 'TURNO DE NOCHE',
        color: ''
      }
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
    // Incrementar el refreshTrigger para notificar cambios a los componentes
    setRefreshTrigger(prev => prev + 1);
  };

  const getCurrentList = () => {
    return lists.find(list => list.id === currentListId) || null;
  };

  return (
    <EmployeeListsContext.Provider value={{
      lists,
      currentListId,
      refreshTrigger,
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