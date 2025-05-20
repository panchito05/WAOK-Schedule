/**
 * Definiciones de tipos compartidos para toda la aplicación
 * Centraliza las interfaces para evitar duplicación y mantener consistencia
 */

// Interfaces para turnos
export interface Shift {
  id: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  duration: string;
  lunchBreak: number;
  lunchBreakDeduction: number;
  isOvertimeActive?: boolean;
  overtimeEntries?: ShiftOvertime[];
  nurseCounts: {
    [day: string]: number;
  };
  index?: number; // Para casos donde se necesita pasar el índice del turno
}

export interface ShiftOvertime {
  date: string;
  quantity: number;
  isActive: boolean;
}

// Interfaces para empleados
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  uniqueId?: string;
  selected?: boolean;
  preferences?: (number | null)[];
  unavailableShifts?: { [shiftIndex: number]: number[] } | number[];
  fixedShifts?: { [day: string]: string[] };
  maxConsecutiveShifts?: number;
  leave?: {
    id: string;
    startDate: string;
    endDate: string;
    leaveType: string;
    hoursPerDay: number;
  }[];
  blockedShifts?: { [shiftId: string]: string[] };
  lockedShifts?: { [key: string]: boolean };
  manualShifts?: { [key: string]: string };
  shiftComments?: { [key: string]: string };
  columnComments?: { [key: string]: string };
  autoDaysOff?: string[];
  notes?: {
    confidential: string;
    aiRules: string;
  };
  commentOrRules?: string;
  note?: string;
}

// Interfaces para reglas
export interface RulesState {
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
  // Alias para compatibilidad
  minBiweeklyHours?: string;
  weekendsOffPerMonth?: string;
}

// Interfaces para datos de turno
export interface ShiftData {
  id: number;
  name: string;
  timeRange: string;
  counts: number[];
  idealNumber: number;
}

// Interfaces para prioridades de turno
export interface ShiftPriorities {
  [day: string]: { [shiftId: string]: boolean };
}

// Interfaces para reglas especiales 
export interface SpecialRules {
  employeeSelections?: {
    [buttonId: string]: string[];
  }
}

// Interfaz para listas de empleados
export interface EmployeeList {
  id: string;
  name: string;
  employees: Employee[];
  shifts: Shift[];
  rules: RulesState;
  priorities: ShiftPriorities;
  shiftData: ShiftData[];
  specialRules?: SpecialRules;
}