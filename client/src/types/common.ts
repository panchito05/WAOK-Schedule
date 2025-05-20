/**
 * Definiciones de tipos compartidos para toda la aplicación
 * Este archivo centraliza todas las interfaces para evitar inconsistencias
 */

/**
 * Definición de una entrada de horas extra para un turno
 */
export interface ShiftOvertime {
  date: string;
  quantity: number;
  isActive: boolean;
}

/**
 * Definición completa de un turno de trabajo
 */
export interface ShiftRow {
  id?: string;
  startTime: string;
  endTime: string;
  duration: string;
  lunchBreakDeduction: number;
  isOvertimeActive?: boolean;
  overtimeEntries?: ShiftOvertime[];
  // Propiedades adicionales usadas en EmployeeScheduleProvisional
  start?: string; 
  end?: string;
  lunchBreak?: number;
  nurseCounts?: { [dayOfWeek: string]: number };
}

/**
 * Definición de un empleado con todos sus atributos
 */
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  // Propiedades para asignación de turnos
  fixedShifts: { [day: string]: string[] };
  maxConsecutiveShifts: number;
  shiftPreferences: (number | null)[];
  leave: { id: string; startDate: string; endDate: string; leaveType: string; hoursPerDay: number }[];
  blockedShifts: { [shiftId: string]: string[] };
  notes: {
    confidential: string;
    aiRules: string;
  };
  // Propiedades usadas en EmployeeScheduleProvisional
  uniqueId?: string;
  preferences?: (number | null)[];
  unavailableShifts?: { [shiftIndex: number]: number[] };
  selected?: boolean;
  maxConsecutiveShiftsForThisSpecificEmployee?: number;
  manualShifts?: { [date: string]: string | 'day-off' };
  autoDaysOff?: string[];
  lockedShifts?: { [date: string]: string };
  columnComments?: string;
  shiftComments?: { [key: string]: string };
}

/**
 * Definición de reglas para la programación de turnos
 */
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
  // Compatibilidad con otras definiciones
  maxConsecutiveShiftsForAllEmployees?: string;
  daysOffAfterMaxConsecutiveShift?: string;
  weekendsOffPerMonth?: string;
  minHoursWeek?: string;
  minHoursBiweekly?: string;
  minBiweeklyHours?: string;
}

/**
 * Definición para prioridades de turnos
 */
export interface ShiftPriorities {
  [day: string]: { [shiftId: string]: boolean };
}

/**
 * Definición para datos de turnos en el contexto de personal
 */
export interface ShiftData {
  id: number;
  name: string;
  timeRange: string;
  counts: number[];
  idealNumber: number;
}

/**
 * Definición para reglas especiales
 */
export interface SpecialRules {
  employeeSelections?: {
    [buttonId: string]: string[];
  }
}

/**
 * Definición completa de una lista de empleados
 */
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