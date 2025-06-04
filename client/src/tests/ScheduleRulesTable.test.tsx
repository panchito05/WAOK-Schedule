import { describe, it, expect } from 'vitest';
import { ShiftRow } from '../context/ShiftContext';

// Importamos la función que vamos a testear
// Nota: La función formatBlockedShifts está dentro del componente ScheduleRulesTable
// Por ahora crearemos una versión de prueba aquí para testing
const formatBlockedShifts = (blockedShifts: { [shiftId: string]: { blockedDays: string[]; isActive: boolean } } | undefined, shifts: ShiftRow[]) => {
  if (!blockedShifts || Object.keys(blockedShifts).length === 0) return 'None';
  
  const activeBlockedShifts = Object.entries(blockedShifts)
    .filter(([_, shiftData]) => shiftData.isActive && shiftData.blockedDays.length > 0);
  
  if (activeBlockedShifts.length === 0) return 'None';
  
  // Mapeo de días en inglés a español
  const dayTranslations: { [key: string]: string } = {
    'monday': 'Mon',
    'tuesday': 'Tue', 
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun',
    'all': 'All Days'
  };
  
  return activeBlockedShifts
    .map(([shiftId, shiftData]) => {
      // Buscar el turno por su ID
      const shift = shifts.find(s => s.id === shiftId);
      const shiftName = shift ? `${shift.startTime} - ${shift.endTime}` : 'Unknown Shift';
      
      if (shiftData.blockedDays.includes('all')) {
        return `${shiftName} (All Days)`;
      } else {
        // Traducir los días y formatearlos
        const translatedDays = shiftData.blockedDays
          .map(day => dayTranslations[day.toLowerCase()] || day)
          .join(', ');
        return `${shiftName} (${translatedDays})`;
      }
    })
    .join(', ');
};

// Mock data for shifts
const mockShifts: ShiftRow[] = [
  {
    id: 'uid_morning_shift_123',
    startTime: '7:00 AM',
    endTime: '3:00 PM',
    duration: '8h',
    lunchBreakDeduction: 30,
    isOvertimeActive: false,
    overtimeEntries: [],
    name: 'Morning Shift'
  },
  {
    id: 'uid_afternoon_shift_456',
    startTime: '3:00 PM',
    endTime: '11:00 PM',
    duration: '8h',
    lunchBreakDeduction: 30,
    isOvertimeActive: false,
    overtimeEntries: [],
    name: 'Afternoon Shift'
  },
  {
    id: 'uid_night_shift_789',
    startTime: '11:00 PM',
    endTime: '7:00 AM',
    duration: '8h',
    lunchBreakDeduction: 30,
    isOvertimeActive: false,
    overtimeEntries: [],
    name: 'Night Shift'
  }
];

describe('formatBlockedShifts', () => {
  it('should return "None" when blockedShifts is undefined', () => {
    const result = formatBlockedShifts(undefined, mockShifts);
    expect(result).toBe('None');
  });

  it('should return "None" when blockedShifts is empty object', () => {
    const result = formatBlockedShifts({}, mockShifts);
    expect(result).toBe('None');
  });

  it('should return "None" when no shifts are active', () => {
    const blockedShifts = {
      'uid_morning_shift_123': {
        blockedDays: ['monday', 'tuesday'],
        isActive: false
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('None');
  });

  it('should return "None" when active shifts have no blocked days', () => {
    const blockedShifts = {
      'uid_morning_shift_123': {
        blockedDays: [],
        isActive: true
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('None');
  });

  it('should format single shift with specific blocked days', () => {
    const blockedShifts = {
      'uid_morning_shift_123': {
        blockedDays: ['monday', 'tuesday'],
        isActive: true
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('7:00 AM - 3:00 PM (Mon, Tue)');
  });

  it('should format single shift blocked all days', () => {
    const blockedShifts = {
      'uid_afternoon_shift_456': {
        blockedDays: ['all'],
        isActive: true
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('3:00 PM - 11:00 PM (All Days)');
  });

  it('should format multiple blocked shifts', () => {
    const blockedShifts = {
      'uid_morning_shift_123': {
        blockedDays: ['monday'],
        isActive: true
      },
      'uid_night_shift_789': {
        blockedDays: ['friday', 'saturday'],
        isActive: true
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('7:00 AM - 3:00 PM (Mon), 11:00 PM - 7:00 AM (Fri, Sat)');
  });

  it('should handle mix of blocked and non-blocked shifts', () => {
    const blockedShifts = {
      'uid_morning_shift_123': {
        blockedDays: ['monday'],
        isActive: true
      },
      'uid_afternoon_shift_456': {
        blockedDays: [],
        isActive: true
      },
      'uid_night_shift_789': {
        blockedDays: ['sunday'],
        isActive: false
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('7:00 AM - 3:00 PM (Mon)');
  });

  it('should handle invalid shift index gracefully', () => {
    const blockedShifts = {
      'uid_nonexistent_shift': {
        blockedDays: ['monday'],
        isActive: true
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('Unknown Shift (Mon)');
  });

  it('should handle malformed shift ID gracefully', () => {
    const blockedShifts = {
      'invalid_id': {
        blockedDays: ['monday'],
        isActive: true
      }
    };
    const result = formatBlockedShifts(blockedShifts, mockShifts);
    expect(result).toBe('Unknown Shift (Mon)');
  });
});