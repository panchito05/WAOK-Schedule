import { ShiftRow } from '../types/common';

/**
 * Busca un turno por su ID en una lista de turnos
 * @param shiftId - El ID del turno a buscar (formato uid_xxx)
 * @param shifts - Array de turnos donde buscar
 * @returns El turno encontrado o undefined si no existe
 */
export const findShiftById = (shiftId: string, shifts: ShiftRow[]): ShiftRow | undefined => {
  return shifts.find(shift => shift.id === shiftId);
};

/**
 * Formatea el tiempo de un turno en formato "HH:MM - HH:MM"
 * @param shift - El turno a formatear
 * @returns String con el formato de tiempo del turno
 */
export const formatShiftTime = (shift: ShiftRow): string => {
  return `${shift.startTime} - ${shift.endTime}`;
};

/**
 * Valida si un shiftId tiene el formato correcto uid_xxx
 * @param shiftId - El ID a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export const isValidShiftId = (shiftId: string): boolean => {
  const uidPattern = /^uid_[a-zA-Z0-9]+$/;
  return uidPattern.test(shiftId);
};

/**
 * Genera un nuevo shiftId único con formato uid_xxx
 * @returns Nuevo shiftId único
 */
export const generateUniqueShiftId = (): string => {
  return `uid_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Obtiene múltiples turnos por sus IDs
 * @param shiftIds - Array de IDs de turnos a buscar
 * @param shifts - Array de turnos donde buscar
 * @returns Array de turnos encontrados (solo los que existen)
 */
export const findShiftsByIds = (shiftIds: string[], shifts: ShiftRow[]): ShiftRow[] => {
  return shiftIds
    .map(id => findShiftById(id, shifts))
    .filter((shift): shift is ShiftRow => shift !== undefined);
};