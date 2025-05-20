import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte un formato de hora a formato 12 horas (AM/PM)
 * @param time Hora en formato string
 * @returns Hora formateada en 12h con AM/PM
 */
export function convertTo12Hour(time: string | undefined): string {
  if (!time) return 'Not set';
  
  // Check if time already includes AM/PM
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  
  // Specific shift time corrections based on common patterns
  let ampm = 'AM';
  
  if (hourNum === 7 && parseInt(minute) === 0) {
    ampm = 'AM'; // First shift starts at 7:00 AM
  } else if (hourNum === 3 && parseInt(minute) === 0) {
    ampm = 'PM'; // Second shift starts at 3:00 PM
  } else if (hourNum === 11 && parseInt(minute) === 0) {
    ampm = 'PM'; // Third shift starts at 11:00 PM
  } else {
    // Default logic for other times
    ampm = hourNum >= 12 ? 'PM' : 'AM';
  }
  
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

/**
 * Calcula la duración entre dos horarios en formato "horas minutos"
 * @param startTime Hora de inicio
 * @param endTime Hora de fin
 * @param lunchBreakDeduction Minutos de deducción por descanso
 * @returns Duración formateada como "Xh Ym"
 */
export function calculateDuration(startTime: string, endTime: string, lunchBreakDeduction: number = 0): string {
  try {
    // Parse the time strings
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return { hours, minutes };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    // Calculate total minutes
    let startMinutes = start.hours * 60 + start.minutes;
    let endMinutes = end.hours * 60 + end.minutes;

    // If end time is before start time, add 24 hours
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    // Calculate duration and subtract lunch break
    const totalMinutes = endMinutes - startMinutes - lunchBreakDeduction;

    // Convert to hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '0h 0m';
  }
}

/**
 * Formatea una fecha para mostrar
 * @param date Objeto Date
 * @returns String con fecha formateada
 */
export function formatDate(date: Date): string {
  // Usando UTC para consistencia
  const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC' };
  const day = date.getUTCDate();
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

  return `${day} / ${month} / ${year} (${weekday})`;
}

/**
 * Formatea una fecha para mostrar en HTML con estilo
 * @param date Objeto Date
 * @returns String HTML con fecha formateada
 */
export function formatDateHTML(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC' };
  const day = date.getUTCDate();
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

  return `
      <div style="text-align: center;">
          <div>${day} / ${month} / ${year}</div>
          <div>${weekday}</div>
      </div>
  `;
}

/**
 * Obtiene el tiempo con el formato correcto (AM/PM) para turnos específicos
 * @param shiftIndex Índice del turno (0, 1, 2)
 * @returns Objeto con hora de inicio y fin del turno
 */
export function getCorrectShiftTime(shiftIndex: number): { startTime: string, endTime: string } {
  switch (shiftIndex) {
    case 0: // Primer turno
      return { startTime: "7:00 AM", endTime: "3:00 PM" };
    case 1: // Segundo turno
      return { startTime: "3:00 PM", endTime: "11:00 PM" };
    case 2: // Tercer turno
      return { startTime: "11:00 PM", endTime: "7:00 AM" };
    default:
      return { startTime: "Unknown", endTime: "Unknown" };
  }
}

/**
 * Formatea un tiempo para mostrar correctamente
 * @param time Tiempo a formatear
 * @returns Tiempo formateado
 */
export function formatTime(time: string): string {
  try {
    const date = new Date(`2000/01/01 ${time}`);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original if error
  }
}
