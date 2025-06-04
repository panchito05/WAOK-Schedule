import { describe, it, expect } from 'vitest';
import { 
  findShiftById, 
  formatShiftTime, 
  isValidShiftId, 
  generateUniqueShiftId, 
  findShiftsByIds 
} from './shiftUtils';
import { ShiftRow } from '../types/common';

// Mock data para pruebas
const mockShifts: ShiftRow[] = [
  {
    id: 'uid_abc123def',
    name: 'Turno Mañana',
    startTime: '08:00',
    endTime: '16:00',
    color: '#FF5733'
  },
  {
    id: 'uid_xyz789ghi',
    name: 'Turno Tarde',
    startTime: '16:00',
    endTime: '00:00',
    color: '#33FF57'
  },
  {
    id: 'uid_mno456pqr',
    name: 'Turno Noche',
    startTime: '00:00',
    endTime: '08:00',
    color: '#3357FF'
  }
];

describe('shiftUtils', () => {
  describe('findShiftById', () => {
    it('debería encontrar un turno por su ID válido', () => {
      const result = findShiftById('uid_abc123def', mockShifts);
      expect(result).toBeDefined();
      expect(result?.id).toBe('uid_abc123def');
      expect(result?.name).toBe('Turno Mañana');
    });

    it('debería retornar undefined para un ID que no existe', () => {
      const result = findShiftById('uid_nonexistent', mockShifts);
      expect(result).toBeUndefined();
    });

    it('debería retornar undefined con array vacío', () => {
      const result = findShiftById('uid_abc123def', []);
      expect(result).toBeUndefined();
    });

    it('debería manejar IDs vacíos', () => {
      const result = findShiftById('', mockShifts);
      expect(result).toBeUndefined();
    });
  });

  describe('formatShiftTime', () => {
    it('debería formatear correctamente el tiempo de un turno', () => {
      const shift = mockShifts[0];
      const result = formatShiftTime(shift);
      expect(result).toBe('08:00 - 16:00');
    });

    it('debería manejar turnos nocturnos', () => {
      const shift = mockShifts[1];
      const result = formatShiftTime(shift);
      expect(result).toBe('16:00 - 00:00');
    });

    it('debería manejar turnos con horarios especiales', () => {
      const specialShift: ShiftRow = {
        id: 'uid_special',
        name: 'Especial',
        startTime: '23:30',
        endTime: '07:30',
        color: '#000000'
      };
      const result = formatShiftTime(specialShift);
      expect(result).toBe('23:30 - 07:30');
    });
  });

  describe('isValidShiftId', () => {
    it('debería validar IDs con formato uid_xxx correcto', () => {
      expect(isValidShiftId('uid_abc123def')).toBe(true);
      expect(isValidShiftId('uid_123')).toBe(true);
      expect(isValidShiftId('uid_xyz789')).toBe(true);
      expect(isValidShiftId('uid_UPPER123')).toBe(true);
    });

    it('debería rechazar IDs con formato incorrecto', () => {
      expect(isValidShiftId('shift_1')).toBe(false);
      expect(isValidShiftId('123')).toBe(false);
      expect(isValidShiftId('uid_')).toBe(false);
      expect(isValidShiftId('uid')).toBe(false);
      expect(isValidShiftId('')).toBe(false);
      expect(isValidShiftId('uid_abc-123')).toBe(false); // guiones no permitidos
      expect(isValidShiftId('uid_abc 123')).toBe(false); // espacios no permitidos
    });
  });

  describe('generateUniqueShiftId', () => {
    it('debería generar IDs con formato uid_xxx', () => {
      const id = generateUniqueShiftId();
      expect(isValidShiftId(id)).toBe(true);
      expect(id).toMatch(/^uid_[a-zA-Z0-9]+$/);
    });

    it('debería generar IDs únicos', () => {
      const id1 = generateUniqueShiftId();
      const id2 = generateUniqueShiftId();
      expect(id1).not.toBe(id2);
    });

    it('debería generar múltiples IDs únicos', () => {
      const ids = Array.from({ length: 10 }, () => generateUniqueShiftId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10); // Todos deben ser únicos
    });
  });

  describe('findShiftsByIds', () => {
    it('debería encontrar múltiples turnos por sus IDs', () => {
      const ids = ['uid_abc123def', 'uid_xyz789ghi'];
      const result = findShiftsByIds(ids, mockShifts);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('uid_abc123def');
      expect(result[1].id).toBe('uid_xyz789ghi');
    });

    it('debería filtrar IDs que no existen', () => {
      const ids = ['uid_abc123def', 'uid_nonexistent', 'uid_xyz789ghi'];
      const result = findShiftsByIds(ids, mockShifts);
      expect(result).toHaveLength(2);
      expect(result.every(shift => shift.id !== 'uid_nonexistent')).toBe(true);
    });

    it('debería retornar array vacío si ningún ID existe', () => {
      const ids = ['uid_nonexistent1', 'uid_nonexistent2'];
      const result = findShiftsByIds(ids, mockShifts);
      expect(result).toHaveLength(0);
    });

    it('debería manejar array vacío de IDs', () => {
      const result = findShiftsByIds([], mockShifts);
      expect(result).toHaveLength(0);
    });

    it('debería manejar array vacío de turnos', () => {
      const ids = ['uid_abc123def'];
      const result = findShiftsByIds(ids, []);
      expect(result).toHaveLength(0);
    });
  });
});