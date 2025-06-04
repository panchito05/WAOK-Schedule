// Definición de tipos compartidos en la aplicación

// Interfaz para representar datos de horas extra en turnos
export interface ShiftOvertime {
  date: string;
  quantity: number;
  isActive: boolean;
}

// Interfaz para representar un turno
export interface ShiftRow {
  id: string;
  startTime: string;
  endTime: string;
  duration: string;
  lunchBreakDeduction: number;
  isOvertimeActive: boolean;
  overtimeEntries: ShiftOvertime[];
  name?: string; // Nombre personalizado del turno (ej. "TURNO DE DIA")
  color?: string; // Color del turno en formato hex (ej. "#FF5733")
  // Campos adicionales para compatibilidad con componentes existentes
  start?: string;
  end?: string;
  lunchBreak?: number;
  nurseCounts?: { [role: string]: number };
  shiftComments?: string;
}

// Interfaz para un empleado
export interface Employee {
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
  // Campos opcionales que pueden no estar presentes en todos los empleados
  leave?: { 
    id: string; 
    startDate: string; 
    endDate: string; 
    leaveType: string; 
    hoursPerDay: number 
  }[];
  fixedShifts?: { [day: string]: string[] };
  manualShifts?: { [date: string]: string[] };
  autoDaysOff?: string[];
  maxConsecutiveShifts?: number;
  shiftComments?: { [key: string]: string };
  columnComments?: { [key: string]: string };
  selected?: boolean;
  uniqueId?: string;
  preferences?: number[];
  blockedShifts?: { 
    [shiftId: string]: {
      blockedDays: string[]; // ['monday', 'tuesday', etc.] o ['all'] o [] (sin bloqueos)
      isActive: boolean;
    }
  };
  unavailableShifts?: string[];
}

// Interfaz para reglas de programación
export interface Rules {
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

// Interfaz para prioridades de turnos
export interface ShiftPriorities {
  [day: string]: { [shiftId: string]: boolean };
}

// Interfaz para datos de personal por turno
export interface ShiftData {
  id: number;
  name: string;
  timeRange: string;
  counts: number[];
  idealNumber: number;
}

// Interfaz para reglas especiales
export interface SpecialRules {
  employeeSelections?: {
    [buttonId: string]: string[];
  }
}

// Interfaz para una lista de empleados
export interface EmployeeList {
  id: string;
  name: string;
  employees: Employee[];
  shifts: ShiftRow[];
  rules: Rules;
  priorities: ShiftPriorities;
  shiftData: ShiftData[];
  specialRules?: SpecialRules;
}