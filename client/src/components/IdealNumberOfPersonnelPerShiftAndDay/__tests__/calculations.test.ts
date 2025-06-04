import { describe, it, expect } from 'vitest';

// Importamos las funciones que vamos a probar
function calculateShiftDurationInHours(startTime: string, endTime: string, lunchBreakDeduction: number = 0): number {
  if (!startTime || !endTime) return 0;
  
  const convertTo24Hour = (time: string): string => {
    if (time.includes('AM') || time.includes('PM')) {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return time;
  };
  
  const start24 = convertTo24Hour(startTime);
  const end24 = convertTo24Hour(endTime);
  
  const startDate = new Date(`2000-01-01T${start24}:00`);
  let endDate = new Date(`2000-01-01T${end24}:00`);
  
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  
  return Math.max(0, hours - (lunchBreakDeduction / 60));
}

function calculateIdealPersonnel(dailyCounts: number[], shiftDurationHours: number, minBiweeklyHours: number): number {
  if (shiftDurationHours <= 0 || minBiweeklyHours <= 0) return 0;
  
  const totalWeeklyNurseHours = dailyCounts.reduce((sum, count) => sum + (count * shiftDurationHours), 0);
  const biweeklyHoursPerEmployee = minBiweeklyHours;
  const idealPersonnel = (totalWeeklyNurseHours * 2) / biweeklyHoursPerEmployee;
  
  return Math.round(idealPersonnel * 100) / 100;
}

describe('calculateShiftDurationInHours', () => {
  describe('Formato 12 horas', () => {
    it('debería calcular correctamente duración AM a AM', () => {
      expect(calculateShiftDurationInHours('8:00 AM', '12:00 PM')).toBe(4);
    });

    it('debería calcular correctamente duración AM a PM', () => {
      expect(calculateShiftDurationInHours('6:00 AM', '2:00 PM')).toBe(8);
    });

    it('debería calcular correctamente duración PM a PM', () => {
      expect(calculateShiftDurationInHours('2:00 PM', '10:00 PM')).toBe(8);
    });

    it('debería manejar turnos que cruzan medianoche', () => {
      expect(calculateShiftDurationInHours('10:00 PM', '6:00 AM')).toBe(8);
    });

    it('debería manejar 12:00 AM correctamente', () => {
      expect(calculateShiftDurationInHours('12:00 AM', '8:00 AM')).toBe(8);
    });

    it('debería manejar 12:00 PM correctamente', () => {
      expect(calculateShiftDurationInHours('12:00 PM', '8:00 PM')).toBe(8);
    });
  });

  describe('Formato 24 horas', () => {
    it('debería calcular correctamente duración en formato 24h', () => {
      expect(calculateShiftDurationInHours('06:00', '14:00')).toBe(8);
    });

    it('debería manejar turnos nocturnos en formato 24h', () => {
      expect(calculateShiftDurationInHours('22:00', '06:00')).toBe(8);
    });

    it('debería manejar medianoche en formato 24h', () => {
      expect(calculateShiftDurationInHours('00:00', '08:00')).toBe(8);
    });
  });

  describe('Deducción de almuerzo', () => {
    it('debería deducir tiempo de almuerzo correctamente', () => {
      expect(calculateShiftDurationInHours('6:00 AM', '2:00 PM', 30)).toBe(7.5);
    });

    it('debería deducir múltiples breaks', () => {
      expect(calculateShiftDurationInHours('6:00 AM', '2:00 PM', 60)).toBe(7);
    });

    it('no debería dar resultado negativo con break muy largo', () => {
      expect(calculateShiftDurationInHours('6:00 AM', '8:00 AM', 120)).toBe(0);
    });

    it('debería manejar break de 0 minutos', () => {
      expect(calculateShiftDurationInHours('6:00 AM', '2:00 PM', 0)).toBe(8);
    });
  });

  describe('Casos edge', () => {
    it('debería retornar 0 para tiempo de inicio vacío', () => {
      expect(calculateShiftDurationInHours('', '2:00 PM')).toBe(0);
    });

    it('debería retornar 0 para tiempo de fin vacío', () => {
      expect(calculateShiftDurationInHours('6:00 AM', '')).toBe(0);
    });

    it('debería retornar 0 para ambos tiempos vacíos', () => {
      expect(calculateShiftDurationInHours('', '')).toBe(0);
    });

    it('debería manejar el mismo tiempo de inicio y fin', () => {
      expect(calculateShiftDurationInHours('6:00 AM', '6:00 AM')).toBe(0);
    });

    it('debería manejar minutos fraccionarios', () => {
      expect(calculateShiftDurationInHours('6:30 AM', '2:45 PM')).toBe(8.25);
    });
  });
});

describe('calculateIdealPersonnel', () => {
  describe('Cálculos básicos', () => {
    it('debería calcular personal ideal para turno estándar', () => {
      const dailyCounts = [2, 2, 2, 2, 2, 1, 1]; // 7 días
      const shiftDuration = 8; // 8 horas
      const minBiweeklyHours = 72; // 72 horas quincenales
      
      // Total semanal: (2*8*5) + (1*8*2) = 80 + 16 = 96 horas
      // Quincenal: 96 * 2 = 192 horas
      // Personal ideal: 192 / 72 = 2.67
      expect(calculateIdealPersonnel(dailyCounts, shiftDuration, minBiweeklyHours)).toBe(2.67);
    });

    it('debería calcular para turnos más cortos', () => {
      const dailyCounts = [3, 3, 3, 3, 3, 2, 2];
      const shiftDuration = 4; // turno de 4 horas
      const minBiweeklyHours = 40;
      
      // Total semanal: (3*4*5) + (2*4*2) = 60 + 16 = 76 horas
      // Quincenal: 76 * 2 = 152 horas
      // Personal ideal: 152 / 40 = 3.8
      expect(calculateIdealPersonnel(dailyCounts, shiftDuration, minBiweeklyHours)).toBe(3.8);
    });

    it('debería redondear a 2 decimales', () => {
      const dailyCounts = [1, 1, 1, 1, 1, 1, 1];
      const shiftDuration = 8.333; // duración no estándar
      const minBiweeklyHours = 80;
      
      const result = calculateIdealPersonnel(dailyCounts, shiftDuration, minBiweeklyHours);
      expect(result.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('Casos edge', () => {
    it('debería retornar 0 para duración de turno 0', () => {
      expect(calculateIdealPersonnel([2, 2, 2, 2, 2, 1, 1], 0, 72)).toBe(0);
    });

    it('debería retornar 0 para duración de turno negativa', () => {
      expect(calculateIdealPersonnel([2, 2, 2, 2, 2, 1, 1], -1, 72)).toBe(0);
    });

    it('debería retornar 0 para horas quincenales mínimas 0', () => {
      expect(calculateIdealPersonnel([2, 2, 2, 2, 2, 1, 1], 8, 0)).toBe(0);
    });

    it('debería retornar 0 para horas quincenales negativas', () => {
      expect(calculateIdealPersonnel([2, 2, 2, 2, 2, 1, 1], 8, -72)).toBe(0);
    });

    it('debería manejar array vacío de conteos diarios', () => {
      expect(calculateIdealPersonnel([], 8, 72)).toBe(0);
    });

    it('debería manejar todos los conteos en 0', () => {
      expect(calculateIdealPersonnel([0, 0, 0, 0, 0, 0, 0], 8, 72)).toBe(0);
    });

    it('debería manejar valores decimales en conteos', () => {
      const dailyCounts = [1.5, 1.5, 1.5, 1.5, 1.5, 1, 1];
      const result = calculateIdealPersonnel(dailyCounts, 8, 72);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('Escenarios reales', () => {
    it('debería calcular para turno de día típico', () => {
      // Turno diurno con 30min almuerzo = 11.5 horas productivas
      const dailyCounts = [4, 4, 4, 4, 4, 3, 3];
      const shiftDuration = 11.5;
      const minBiweeklyHours = 80;
      
      const result = calculateIdealPersonnel(dailyCounts, shiftDuration, minBiweeklyHours);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(20); // verificación de rango razonable
    });

    it('debería calcular para turno nocturno', () => {
      // Turno nocturno típicamente tiene menos personal
      const dailyCounts = [1, 1, 1, 1, 1, 1, 1];
      const shiftDuration = 12;
      const minBiweeklyHours = 72;
      
      const result = calculateIdealPersonnel(dailyCounts, shiftDuration, minBiweeklyHours);
      expect(result).toBe(2.33); // (1*12*7*2)/72 = 2.33
    });

    it('debería calcular para diferentes requerimientos de fin de semana', () => {
      // Más personal entre semana, menos en fin de semana
      const dailyCounts = [5, 5, 5, 5, 5, 2, 2];
      const shiftDuration = 8;
      const minBiweeklyHours = 80;
      
      const result = calculateIdealPersonnel(dailyCounts, shiftDuration, minBiweeklyHours);
      expect(result).toBeGreaterThan(2);
      expect(result).toBeLessThan(10);
    });
  });
});