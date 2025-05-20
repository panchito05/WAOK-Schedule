import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Users } from 'lucide-react'; // Renombrar para evitar conflicto
import { useRules } from '../../context/RulesContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useShiftContext } from '../../context/ShiftContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';
import { useSelectedEmployees } from '../../context/SelectedEmployeesContext';
import OvertimeModal from '../OvertimeModal';

// --- Definición de Tipos de Datos (Simulando la estructura del JS) ---

// Estructura simplificada de un Turno (Shift)
interface Shift {
  id: string;
  start: string; // HH:mm
  end: string;   // HH:mm
  duration: string; // e.g., "8h 0m"
  lunchBreak: number; // minutes
  nurseCounts: { [dayOfWeek: string]: number }; // e.g., { "Monday": 5, "Tuesday": 6 }
  shiftComments?: string;
  // Propiedades de Overtime (simuladas)
  isOvertimeActiveForShift?: boolean;
  disableOvertime?: boolean;
  overtimeEntries?: { date: string; isActive: boolean; quantity: number }[];
}

// Estructura simplificada de un Empleado
interface Employee {
  id: string; // Employee ID
  uniqueId: string; // Unique ID used internally
  name: string;
  hireDate?: string; // YYYY-MM-DD
  commentOrRules?: string;
  note?: string; // Confidential note
  preferences: (number | null)[]; // Array matching timeRanges order, 1 for first pref, etc.
  unavailableShifts: { [shiftIndex: number]: number[] }; // { shiftIndex: [dayIndex, ...] }
  selected: boolean;
  maxConsecutiveShiftsForThisSpecificEmployee: number;
  leave: { id: string; startDate: string; endDate: string; leaveType: string; hoursPerDay: number }[]; // Array of leave objects
  fixedShifts: { [dayOfWeek: string]: string[] }; // { dayOfWeek: [shiftId] or ['day-off'] }
  manualShifts: { [date: string]: string | 'day-off' }; // { YYYY-MM-DD: shiftId or 'day-off' }
  autoDaysOff?: string[]; // Array of YYYY-MM-DD strings
  lockedShifts?: { [date: string]: string }; // { YYYY-MM-DD: shiftId }
  columnComments?: string; // Comment for the summary column
}

// Estructura de Reglas Generales
interface Rules {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  maxConsecutiveShiftsForAllEmployees: string; // Stored as string from select
  daysOffAfterMaxConsecutiveShift: string; // Stored as string from select
  weekendsOffPerMonth: string; // Stored as string from select
  minRestHoursBetweenShifts: string; // Stored as string from select
  writtenRule1: string;
  writtenRule2: string;
  minHoursWeek: string; // Stored as string from input
  minHoursBiweekly: string; // Stored as string from input
}


// --- Funciones de Utilidad (Adaptadas de tu código JS) ---

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function calculateShiftDuration(start: string, end: string, lunchBreak: number = 0): string {
  // Simplified calculation for display purposes
  if (!start || !end) return 'N/A';
  const startTime = new Date(`2000-01-01T${start}`);
  let endTime = new Date(`2000-01-01T${end}`);
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  let diff = endTime.getTime() - startTime.getTime() - (lunchBreak * 60000);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.round((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function convertTo12Hour(time: string | undefined): string {
  if (!time) return 'Not set';
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

function formatDate(date: Date): string {
    // Adaptado para mostrar solo Día/Mes/Año y Día de la semana
    // Usando UTC para simular el comportamiento original
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

function calculatePreferenceMatchPercentage(employee: Employee, shifts: Shift[], startDateStr: string, endDateStr: string): string {
    if (!employee || !Array.isArray(employee.preferences)) {
        return '0.00';
    }

    const startDate = new Date(startDateStr + 'T00:00:00Z');
    const endDate = new Date(endDateStr + 'T00:00:00Z');
    let totalScheduledOrLeaveDays = 0;
    let successfulMatchDays = 0;

    const firstPreferenceIndex = employee.preferences.indexOf(1);
    const preferredShiftId = (firstPreferenceIndex !== -1 && shifts[firstPreferenceIndex]) ? shifts[firstPreferenceIndex].id : null;

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        const dayOfWeek = daysOfWeek[d.getUTCDay()];

        const isOnLeave = employee.leave?.some(l => {
            const leaveStart = new Date(l.startDate + 'T00:00:00Z');
            const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
            const currentDate = new Date(dateString + 'T00:00:00Z');
            return currentDate >= leaveStart && currentDate <= leaveEnd;
        });

        if (isOnLeave) {
            totalScheduledOrLeaveDays++;
            successfulMatchDays++;
        } else {
            const manualShift = employee.manualShifts?.[dateString];
            const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];

            let assignedShiftId = null;
            if (manualShift && manualShift !== 'day-off') {
                assignedShiftId = manualShift;
            } else if (!manualShift && fixedShift && fixedShift !== 'day-off') {
                assignedShiftId = fixedShift;
            }

            if (assignedShiftId) {
                totalScheduledOrLeaveDays++;
                if (preferredShiftId && assignedShiftId === preferredShiftId) {
                    successfulMatchDays++;
                }
            }
        }
    }

    return totalScheduledOrLeaveDays > 0 ? (successfulMatchDays / totalScheduledOrLeaveDays * 100).toFixed(2) : '0.00';
}

function getPreferenceAndBlockedInfo(employee: Employee, shifts: Shift[]): string {
    let html = '<div class="space-y-2">';

    // Preferred Shifts
    html += '<div class="mb-2">';
    html += '<strong>Preferred:</strong><br>';
    if (Array.isArray(employee.preferences) && employee.preferences.length > 0) {
        const preferredShiftIndex = employee.preferences.indexOf(1);
        if (preferredShiftIndex !== -1 && shifts[preferredShiftIndex]) {
            const shift = shifts[preferredShiftIndex];
            html += `${shift.startTime} - ${shift.endTime}`;
        } else {
            html += 'None';
        }
    } else {
        html += 'None';
    }
    html += '</div>';

    // Blocked Shifts
    html += '<div>';
    html += '<strong>Blocked:</strong><br>';
    if (employee.blockedShifts && Object.keys(employee.blockedShifts).length > 0) {
        const blockedEntries = Object.entries(employee.blockedShifts)
            .map(([shiftId, days]) => {
                const shiftIndex = parseInt(shiftId.split('_')[1]) - 1;
                const shift = shifts[shiftIndex];
                if (!shift || !days.length) return null;
                const dayNames = days.map(day => day.substr(0, 3)).join(', ');
                return `${shift.startTime} - ${shift.endTime} (${dayNames})`;
            })
            .filter(Boolean);
        html += blockedEntries.length ? blockedEntries.join('<br>') : 'None';
    } else {
        html += 'None';
    }
    html += '</div>';

    html += '</div>';
    return html;
}

function calculateShiftHours(start: string, end: string, lunchBreak: number = 0): number {
    const startTime = new Date(`2000-01-01T${start}`);
    let endTime = new Date(`2000-01-01T${end}`);
    if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
    }
    let diff = endTime.getTime() - startTime.getTime();
    if (lunchBreak) {
        diff -= lunchBreak * 60000;
    }
    return diff / (1000 * 60 * 60);
}

function countFreeWeekends(employee: Employee, startDateStr: string, endDateStr: string, shifts: Shift[]): number {
    let freeWeekends = 0;
    const startDate = new Date(startDateStr + 'T00:00:00Z');
    const endDate = new Date(endDateStr + 'T00:00:00Z');

    for (let d = new Date(startDate); d.getTime() <= endDate.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
        const currentDate = new Date(d);
        const currentUTCDayIndex = currentDate.getUTCDay();

        if (currentUTCDayIndex === 6) { // Saturday UTC
            const saturdayString = currentDate.toISOString().split('T')[0];
            const sundayDate = new Date(currentDate.getTime());
            sundayDate.setUTCDate(sundayDate.getUTCDate() + 1);
            const sundayString = sundayDate.toISOString().split('T')[0];

            if (sundayDate.getTime() <= endDate.getTime()) {
                const isSaturdayWorking = getCurrentShift(employee, saturdayString, shifts) && getCurrentShift(employee, saturdayString, shifts) !== 'day-off';
                const isSundayWorking = getCurrentShift(employee, sundayString, shifts) && getCurrentShift(employee, sundayString, shifts) !== 'day-off';
                 // Also check leaves
                 const isSaturdayOnLeave = employee.leave?.some(l => { const ls=new Date(l.startDate+'T00:00:00Z'); const le=new Date(l.endDate+'T00:00:00Z'); const cur=new Date(saturdayString+'T00:00:00Z'); return cur >= ls && cur <= le; });
                 const isSundayOnLeave = employee.leave?.some(l => { const ls=new Date(l.startDate+'T00:00:00Z'); const le=new Date(l.endDate+'T00:00:00Z'); const cur=new Date(sundayString+'T00:00:00Z'); return cur >= ls && cur <= le; });


                if (!isSaturdayWorking && !isSundayWorking && !isSaturdayOnLeave && !isSundayOnLeave) {
                    freeWeekends++;
                }
            }
        }
    }
    return freeWeekends;
}


function formatBiweeklyHours(hoursData: number[], minBiweeklyHours: number): string {
    return hoursData.map((hours, index) => {
        let backgroundColor = 'transparent';
        let textColor = 'black';
        if (hours < minBiweeklyHours) {
            backgroundColor = 'yellow';
            textColor = 'black';
        } else if (hours > minBiweeklyHours) {
            backgroundColor = 'red';
            textColor = 'white';
        }
        return `<div style="background-color: ${backgroundColor}; color: ${textColor}; padding: 2px; margin-bottom: 2px;">Biweekly ${index + 1}: ${hours.toFixed(2)} hours</div>`;
    }).join('');
}

function calculateEmployeeHours(employee: Employee, startDateStr: string, endDateStr: string, shifts: Shift[]): number[] {
    let biweeklyHours: number[] = [];
    let currentBiweeklyHours = 0;
    let dayCount = 0;

    const startDate = new Date(startDateStr + 'T00:00:00Z');
    const endDate = new Date(endDateStr + 'T00:00:00Z');

    for (let d = new Date(startDate); d.getTime() <= endDate.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
        const currentDate = new Date(d.getTime()); // Use copy UTC
        const dateString = currentDate.toISOString().split('T')[0];
        const dayOfWeek = daysOfWeek[currentDate.getUTCDay()];

        let hoursForThisDay = 0;

        const leaveForThisDay = employee.leave?.find(l => {
            const leaveStart = new Date(l.startDate + 'T00:00:00Z');
            const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
            const current = new Date(dateString + 'T00:00:00Z');
            return current >= leaveStart && current <= leaveEnd;
        });


        if (leaveForThisDay) {
             hoursForThisDay = leaveForThisDay.hoursPerDay || 0;
         } else {
             const manualShift = employee.manualShifts?.[dateString];
             const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
             let effectiveShiftId = null;
             if (manualShift && manualShift !== 'day-off') {
                effectiveShiftId = manualShift;
             } else if (fixedShift && fixedShift !== 'day-off' && (!manualShift || manualShift === 'day-off')) {
                 effectiveShiftId = fixedShift;
             }

             if (effectiveShiftId) {
                 const shift = shifts.find(r => r.id === effectiveShiftId);
                 if (shift && shift.start && shift.end) {
                     hoursForThisDay = calculateShiftHours(shift.start, shift.end, shift.lunchBreak || 0);
                 }
             }
        }


        currentBiweeklyHours += hoursForThisDay;
        dayCount++;
        const isEndOfBiweeklyPeriod = (dayCount === 14);
        const isLastDayOfRange = (currentDate.getTime() >= endDate.getTime());

        if (isEndOfBiweeklyPeriod || isLastDayOfRange) {
            biweeklyHours.push(Number(currentBiweeklyHours.toFixed(2)));
            currentBiweeklyHours = 0;
            if (isEndOfBiweeklyPeriod && !isLastDayOfRange) {
                 dayCount = 0;
            }
        }
    }
    return biweeklyHours;
}

function getCurrentShift(employee: Employee, dateString: string, shifts: Shift[]): string | null {
    if (!employee || !dateString || !shifts) return null;

    const date = new Date(dateString + 'T00:00:00Z'); // Use UTC
    const dayOfWeek = daysOfWeek[date.getUTCDay()]; // Use UTC day

    const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
    if (fixedShift) {
        return fixedShift;
    }

    const manualShift = employee.manualShifts?.[dateString];
    if (manualShift !== undefined) { // Check specifically for undefined
         return manualShift;
    }

    return null;
}


function getShiftTime(shiftId: string, shifts: Shift[]): string {
    const shift = shifts.find(s => s.id === shiftId);
    return shift ? `${convertTo12Hour(shift.start)} - ${convertTo12Hour(shift.end)}` : 'Unknown Shift';
}


function countScheduledEmployees(shift: Shift, date: Date, allEmployees: Employee[]): number {
    let count = 0;
    const dateString = date.toISOString().split('T')[0]; // UTC date string
    const dayOfWeek = daysOfWeek[date.getUTCDay()]; // UTC day

    allEmployees.forEach(employee => {
        const isOnLeave = employee.leave?.some(l => {
            const leaveStart = new Date(l.startDate + 'T00:00:00Z');
            const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
            const current = new Date(dateString + 'T00:00:00Z');
            return current >= leaveStart && current <= leaveEnd;
        });

        if (!isOnLeave) {
            const manualShift = employee.manualShifts?.[dateString];
            const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];

            // Check if the employee has this shift assigned
            if (manualShift === shift.id) {
                count++;
            } else if (!manualShift && fixedShift === shift.id) {
                count++;
            }
        }
    });
    return count;
}

function shouldDisplayOvertime(shift: Shift, dateString: string, allEmployees: Employee[], shifts: Shift[]): number {
    let totalOvertime = 0;
    const date = new Date(dateString + 'T00:00:00Z'); // Use UTC
    const dayOfWeek = daysOfWeek[date.getUTCDay()]; // Use UTC day

    const idealStaff = shift.nurseCounts[dayOfWeek] || 0;
    const currentStaff = countScheduledEmployees(shift, date, allEmployees);
    const staffNeeded = Math.max(0, idealStaff - currentStaff);

    // Check if the shift has overtime enabled and is not disabled
    if (shift.isOvertimeActive) {
        totalOvertime = staffNeeded;
    }

    // Specific day overtime (always added)
    if (shift.overtimeEntries) {
        const entry = shift.overtimeEntries.find(
            entry => entry.date === dateString
        );
        if (entry) {
            if (entry.isActive) {
                totalOvertime += entry.quantity;
            }
        }
    }

    return totalOvertime;
}

function exceedsMaxConsecutiveShifts(employee: Employee, dateString: string, rules: Rules, shifts: Shift[]): boolean {
    // Simplified check - actual logic in JS involves counting previous shifts
    // For display purposes, let's just assume we can check a flag or simplify
    // This is a placeholder - replicating the exact JS logic here is complex without the full context
    // A real implementation would look back from dateString and count shifts
     return false; // Placeholder - needs actual logic
}

function violatesMinRestTime(employee: Employee, dateString: string, newShiftId: string, rules: Rules, shifts: Shift[]): boolean {
    // Simplified check - actual logic in JS involves checking shifts before and after
    // This is a placeholder - replicating the exact JS logic here is complex
    return false; // Placeholder - needs actual logic
}

// --- Componente React ---

const EmployeeScheduleTable: React.FC = () => {
  // --- Simulación de datos y estado inicial ---
  const { getCurrentList, updateList } = useEmployeeLists(); // Added updateList here
  const { shifts } = useShiftContext();
  const { shiftData } = usePersonnelData();
  // Usar el contexto de selección de empleados
  const { selectedEmployeeIds } = useSelectedEmployees();
  
  // Use memo to prevent unnecessary rerenders of employees data
  // Filtramos los empleados para mostrar solo los seleccionados
  const employees = useMemo(() => {
    const currentList = getCurrentList();
    const allEmployees = currentList?.employees || [];
    // Solo mostramos los empleados que estén seleccionados
    return allEmployees.filter(employee => selectedEmployeeIds.includes(employee.id));
  }, [getCurrentList, selectedEmployeeIds]);

  // We're removing this useEffect that causes an infinite update cycle
  // The employees are already managed by the parent context,
  // and we don't need to update the list every time local employees state changes

  // Convert shifts to the format expected by the component
  const timeRanges = useMemo(() => shifts.map((shift, index) => ({
    id: `shift_${index + 1}`,
    start: shift.startTime.split(' ')[0],
    end: shift.endTime.split(' ')[0],
    duration: shift.duration,
    lunchBreak: shift.lunchBreakDeduction,
    isOvertimeActive: shift.isOvertimeActive,
    overtimeEntries: shift.overtimeEntries || [],
    nurseCounts: {
      Sunday: shiftData[index]?.counts[0] || 0,
      Monday: shiftData[index]?.counts[1] || 0,
      Tuesday: shiftData[index]?.counts[2] || 0,
      Wednesday: shiftData[index]?.counts[3] || 0,
      Thursday: shiftData[index]?.counts[4] || 0,
      Friday: shiftData[index]?.counts[5] || 0,
      Saturday: shiftData[index]?.counts[6] || 0
    },
    shiftComments: ''
  })), [shifts, shiftData]);

  const { rules } = useRules();

  const [isScheduleTableHidden, setIsScheduleTableHidden] = useState(false);
  const [overtimeModal, setOvertimeModal] = useState<{
    isOpen: boolean;
    shift: { startTime: string; endTime: string } | null;
  }>({
    isOpen: false,
    shift: null
  });

  // --- Generar rango de fechas dinámicamente ---
  const dateRange: Date[] = [];
  const startDate = new Date(rules.startDate + 'T00:00:00Z');
  const endDate = new Date(rules.endDate + 'T00:00:00Z');

  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate) {
    for (let d = new Date(startDate); d.getTime() <= endDate.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
      dateRange.push(new Date(d)); // Store Date objects (UTC midnight)
    }
  } else {
      console.error("Invalid date range:", rules.startDate, rules.endDate);
  }


  // --- Renderizado del Componente ---

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" data-en="Employee Schedule" data-es="Horario Empleados">Employee Schedule Provisional</h2> {/* Added data-en/es */}
        <div className="space-x-2">
          {/* Toggle button for the table */}
          <button
             className={`px-4 py-2 rounded hover:bg-blue-600 transition-colors ${isScheduleTableHidden ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}
             onClick={() => setIsScheduleTableHidden(!isScheduleTableHidden)}
             data-en-show="Show Employee Schedule Table" data-en-hide="Hide Employee Schedule Table"
             data-es-show="Mostrar Tabla Horario Empleados" data-es-hide="Ocultar Tabla Horario Empleados"
          >
             {isScheduleTableHidden ? 'Show Employee Schedule Table' : 'Hide Employee Schedule Table'} {/* Default text */}
          </button>

          {/* AI and Print buttons (text and functionality are placeholders) */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Create Schedule with AI
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Print Schedule
          </button>
        </div>
      </div>

      {/* Table Container with Scroll */}
      <div className={`border rounded-lg overflow-x-auto employee-schedule-table-container ${isScheduleTableHidden ? 'hidden' : ''}`}>
        {/* Table */}
        <table className="w-full border-collapse employee-schedule-table">
          {/* Table Header */}
          <thead className={`bg-gray-200 ${isScheduleTableHidden ? 'table-header-hidden' : ''}`}>
              {/* Hidden message row - rendered dynamically in JS, simplified here */}
              {isScheduleTableHidden && (
                  <tr>
                       <th colSpan={4 + dateRange.length} className="bg-yellow-500 text-black text-center py-2">
                            <span data-en="Employee Schedule Table is hidden. Press 'Show Employee Schedule Table' button to make it visible again" data-es="La Tabla de Horario de Empleados está oculta. Presiona 'Mostrar Tabla Horario Empleados' para hacerla visible de nuevo">Employee Schedule Table is hidden. Press 'Show Employee Schedule Table' button to make it visible again</span>
                       </th>
                   </tr>
              )}
             {!isScheduleTableHidden && (
                 <tr>
                    {/* Static Headers */}
                    <th style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 text-left border border-gray-300" data-en="Employees" data-es="Empleados">Employees</th>
                    <th style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 text-left border border-gray-300" data-en="Shift: Preferences or Locked" data-es="Turno: Preferencias o Bloqueado">Shift: Preferences or Locked</th>
                    <th style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 text-left border border-gray-300" data-en="Total Shifts / Hours" data-es="Total Turnos / Horas">Total Shifts / Hours</th> {/* Todas las columnas con el mismo ancho */}

                    {/* Dynamic Date Headers */}
                    {dateRange.map((date) => {
                       const isSunday = date.getUTCDay() === 0;
                        const dateString = date.toISOString().split('T')[0];
                        return (
                            <th
                                key={dateString}
                                className={`px-2 py-1 text-center border border-gray-300 w-[120px] ${isSunday ? 'bg-gray-100' : ''}`} // Added Sunday class
                            >
                                {/* Using dangerouslySetInnerHTML to render formatted date HTML */}
                                <div dangerouslySetInnerHTML={{ __html: formatDate(date) }}></div>
                                <button className="mt-2 w-full bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
                                    <Users className="h-4 w-4" /> {/* Lucide icon */}
                                    <span data-en="View Today's Employees" data-es="Visualizar Personal de Hoy">View Today's Employees</span> {/* Added translation */}
                                </button>
                            </th>
                        );
                    })}
                    {/* Summary Header */}
                     <th className="px-2 py-1 text-left border border-gray-300 w-[200px]" data-en="Summary and/or Considerations for this Schedule" data-es="Resumen y/o Consideraciones para este Horario">Summary and/or Considerations for this Schedule</th> {/* Added width guess */}
                 </tr>
             )}
          </thead>

          {/* Table Body */}
          <tbody>
            {/* Employee Rows */}
            {employees.map((employee, index) => {
              const matchPercentage = calculatePreferenceMatchPercentage(employee, timeRanges, rules.startDate, rules.endDate);
              const hoursData = calculateEmployeeHours(employee, rules.startDate, rules.endDate, timeRanges);
              const minBiweeklyHours = parseInt(rules.minBiweeklyHours) || 0;
              const freeWeekends = countFreeWeekends(employee, rules.startDate, rules.endDate, timeRanges);
              const requiredWeekendsForPeriod = Math.ceil((parseInt(rules.weekendsOffPerMonth) || 0) * (dateRange.length / 28)); // Simple approx


              return (
                <tr key={employee.uniqueId} className="border-b border-gray-300 align-top"> {/* Added align-top */}
                  {/* Employee Info Cell */}
                  <td style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 border border-gray-300">
                    <div className="flex flex-col"> {/* Use flex-col for stacking */}
                        <span>{index + 1}. {employee.name}</span> {/* Added employee number */}
                        <span className="text-sm text-gray-500">({matchPercentage}% match)
</span> {/* Added match % */}
                    </div>
                    <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded" data-en="View in Calendar" data-es="Ver en Calendario"> {/* Added text-sm, translation */}
                      View in Calendar
                    </button>
                  </td>

                  {/* Preferences/Blocked Cell */}
                   {/* Using dangerouslySetInnerHTML to render formatted HTML string */}
                  <td style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 border border-gray-300" dangerouslySetInnerHTML={{ __html: getPreferenceAndBlockedInfo(employee, timeRanges) }}>
                     {/* Content rendered by getPreferenceAndBlockedInfo */}
                  </td>

                  {/* Total Hours / Weekends Cell */}
                  <td style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 border border-gray-300">
                      {/* Using dangerouslySetInnerHTML for colored hours */}
                      <div dangerouslySetInnerHTML={{ __html: formatBiweeklyHours(hoursData, minBiweeklyHours) }}></div>
                      <div style={{
                           marginTop: '5px',
                           borderTop: '1px solid #ddd',
                           padding: '5px',
                           backgroundColor: freeWeekends < requiredWeekendsForPeriod ? 'yellow' : 'transparent', // Highlight weekends if insufficient
                           color: freeWeekends < requiredWeekendsForPeriod ? 'black' : 'inherit',
                           fontSize: '0.9em' // Smaller font for weekend info
                       }}>
                           <strong># Free Weekends:</strong> {freeWeekends}
                       </div>
                  </td>

                  {/* Dynamic Daily Cells */}
                  {dateRange.map((date) => {
                    const dateString = date.toISOString().split('T')[0];
                    const dayOfWeek = daysOfWeek[date.getUTCDay()];
                    const isSunday = date.getUTCDay() === 0;

                     // Check if employee is on leave for this date
                     const isOnLeave = employee.leave?.some(l => {
                         const leaveStart = new Date(l.startDate + 'T00:00:00Z');
                         const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
                         const current = new Date(dateString + 'T00:00:00Z');
                         return current >= leaveStart && current <= leaveEnd;
                     });

                     // Determine the assigned shift (manual overrides fixed)
                     const manualShift = employee.manualShifts?.[dateString];
                     const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
                     const assignedShift = (manualShift !== undefined) ? manualShift : fixedShift; // Use undefined check

                     const isAutoDayOff = employee.autoDaysOff?.includes(dateString);
                     const isLocked = employee.lockedShifts?.[dateString];
                     const exceedsMax = exceedsMaxConsecutiveShifts(employee, dateString, rules, timeRanges); // Placeholder check
                     const violatesMinRest = violatesMinRestTime(employee, dateString, assignedShift || '', rules, timeRanges); // Placeholder check


                    return (
                      <td
                         key={dateString}
                         className={`px-1 py-1 border border-gray-300 w-[120px] ${isSunday ? 'bg-gray-100' : ''}
                           ${exceedsMax || violatesMinRest ? 'bg-yellow-300' : ''} // Highlight if rules violated (placeholder)
                         `}
                         style={{ position: 'relative' }} // Needed for absolute positioning of swap button
                      >
                           {isOnLeave ? (
                               // Render leave info if on leave
                               <div className="text-center text-sm" style={{ lineHeight: 1.2, padding: '4px', backgroundColor: '#FFA500', color: '#000' }}> {/* Placeholder color */}
                                    {employee.leave?.find(l => l.startDate <= dateString && l.endDate >= dateString)?.leaveType || 'Leave'}
                                     <br />
                                     <small style={{ fontSize: '0.85em', color: 'inherit' }}>({employee.leave?.find(l => l.startDate <= dateString && l.endDate >= dateString)?.hoursPerDay || 0} hrs/day)</small>
                               </div>
                           ) : (
                               // Render shift select if not on leave
                              <div className="flex flex-col items-center">
                                 {/* Shift Select */}
                                 <select
                                     className={`w-full border border-gray-300 rounded px-1 py-0.5 text-sm mb-1 focus:outline-none
                                        ${assignedShift === 'day-off' ? 'bg-yellow-200' : ''}
                                     `}
                                     value={assignedShift || ''} // Use assignedShift as the value
                                     disabled={!!fixedShift || !!isLocked || !!isAutoDayOff} // Disabled if fixed, locked, or auto day off
                                     onChange={(e) => {
                                       const newEmployees = [...employees];
                                       const employeeToUpdate = newEmployees[index];

                                       if (!employeeToUpdate.manualShifts) {
                                         employeeToUpdate.manualShifts = {};
                                       }

                                       if (e.target.value === '') {
                                         delete employeeToUpdate.manualShifts[dateString];
                                       } else {
                                         employeeToUpdate.manualShifts[dateString] = e.target.value;
                                       }

                                       // Since we no longer have a setEmployees function
                                       // we'll only update through the context
                                       const currentList = getCurrentList();
                                       if (currentList) {
                                         updateList(currentList.id, { employees: newEmployees });
                                       }
                                     }}
                                 >
                                     <option value="" data-en="Select Shift" data-es="Seleccionar Turno">Select Shift</option>
                                     <option value="day-off" data-en="Day Off" data-es="Día Libre">Day Off</option>
                                     {timeRanges.map(shift => (
                                         <option
                                             key={shift.id}
                                             value={shift.id}
                                             disabled={employee.unavailableShifts?.[timeRanges.indexOf(shift)]?.includes(date.getUTCDay())} // Disable if blocked (placeholder check)
                                             title={employee.unavailableShifts?.[timeRanges.indexOf(shift)]?.includes(date.getUTCDay()) ? 'Blocked' : ''}
                                         >
                                             {convertTo12Hour(shift.start)} - {convertTo12Hour(shift.end)}
                                              {employee.unavailableShifts?.[timeRanges.indexOf(shift)]?.includes(date.getUTCDay()) ? ' (Blocked)' : ''}
                                         </option>
                                     ))}
                                      {/* Add Leave option - Placeholder */}
                                      <option value="add-leave" disabled>Add Leave</option>
                                 </select>

                                 {/* Row con 4 botones/iconos uniformemente espaciados */}
                                 <div className="flex justify-between items-center w-full px-1 mb-1">
                                     {/* Primer botón: Lock Checkbox */}
                                     <input
                                         type="checkbox"
                                         className="lock-shift h-3 w-3"
                                         checked={!!isLocked}
                                         readOnly // Make checkbox read-only for static demo
                                         title="Check This Box To Fix The Shift For The Chosen Day As An Employee Request, Ensuring It Can't Be Changed By Mistake Unless You Uncheck It."
                                     />
                                     
                                     {/* Segundo botón: Comment Icon */}
                                     <span className="comment-icon text-sm cursor-help" title="Any Comment Written Here Is Visible To Both The Supervisor And The Employee In The Work Schedule.">
                                          📝
                                     </span>
                                     
                                     {/* Tercer botón: Swap Shift */}
                                     <button
                                         className="change-shift-btn text-sm focus:outline-none"
                                         title="Swapping Shifts Between Employees"
                                     >
                                         🔄
                                     </button>
                                     
                                     {/* Cuarto botón: espacio reservado para un futuro botón */}
                                     <span className="w-4"></span>
                                 </div>
                                 
                                 {/* Área para mostrar comentarios si existen */}
                                 {employee.shiftComments?.[dateString] && (
                                     <div className="w-full">
                                         <span className="comment-text text-xs overflow-hidden text-ellipsis whitespace-nowrap" title={employee.shiftComments[dateString]}>
                                             {employee.shiftComments[dateString]}
                                         </span>
                                     </div>
                                 )}
                              </div>
                           )}
                      </td>
                    );
                  })}
                  {/* Summary Comment Cell */}
                   <td className="px-2 py-1 border border-gray-300 w-[200px]">
                      {/* Use textarea matching JS output, pre-filled with employee.columnComments */}
                       <textarea
                           className="comment-textarea w-full h-[60px] border border-gray-300 resize-none p-1 text-sm overflow-hidden"
                           placeholder="Click here to add comments for this employee..."
                           title="Add any comments or notes about this employee"
                           value={employee.columnComments || ''}
                           readOnly // Make textarea read-only for static demo
                           style={{ height: '60px', transition: 'none' }} // Keep initial height, disable transition
                       ></textarea>
                   </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="border-b border-gray-300 font-bold bg-gray-100">
              <td colSpan={3} className="px-2 py-1 border border-gray-300">
                Total Employees by Shifts
              </td>
              {dateRange.map((date) => (
                <td key={date.toISOString().split('T')[0]} className="px-2 py-1 border border-gray-300 w-[120px]">
                  {/* Content is empty in the original JS output for this row */}
                </td>
              ))}
               <td className="px-2 py-1 border border-gray-300 w-[200px]">
                   {/* Empty cell for the summary column */}
               </td>
            </tr>

            {/* Shift Rows */}
            {timeRanges.map((shift, index) => {
                 // Calculate preference count and percentage
                 const preferenceCount = employees.filter(emp =>
                    emp.selected && Array.isArray(emp.preferences) && emp.preferences[index] === 1
                 ).length;
                 const totalSelectedEmployees = employees.filter(emp => emp.selected).length;
                 const preferencePercentage = totalSelectedEmployees > 0
                    ? ((preferenceCount / totalSelectedEmployees) * 100).toFixed(2)
                    : '0.00';

                return (
                    <tr key={shift.id} className="border-b border-gray-300 align-top"> {/* Added align-top */}
                         {/* Shift Info Cell */}
                         <td className="px-2 py-1 border border-gray-300 w-[150px]">
                             <div className="flex flex-col">
                                 <span>{convertTo12Hour(shift.start)} - {convertTo12Hour(shift.end)}</span>
                                  {/* Overtime Button with Available Count */}
                                  <button 
                                    onClick={() => setOvertimeModal({ 
                                      isOpen: true, 
                                      shift: { 
                                        index,
                                        startTime: convertTo12Hour(shift.start), 
                                        endTime: convertTo12Hour(shift.end) 
                                      } 
                                    })}
                                    className={`add-overtime-btn px-2 py-1 rounded text-sm mt-1 text-white ${
                                      shift.isOvertimeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                                  >
                                      Add or Edit Overtime
                                      <br/>
                                      <span className="available-count text-xs">
                                          {shift.isOvertimeActive && <span className="font-bold">[Overtime Active] </span>}
                                           Available: {dateRange.reduce((sum, date) =>
                                              sum + shouldDisplayOvertime(shift, date.toISOString().split('T')[0], employees, timeRanges)
                                           , 0)} {/* Sum up overtime across all dates */}
                                      </span>
                                  </button>
                             </div>
                         </td>

                         {/* Preference Count Cell */}
                         <td className="px-2 py-1 border border-gray-300 text-center w-[150px]"> {/* Centered as in JS */}
                             Pref: {preferenceCount}
                         </td>

                         {/* Preference Percentage Cell */}
                         <td className="px-2 py-1 border border-gray-300 text-center w-[150px]"> {/* Centered as in JS */}
                             {preferencePercentage}%
                         </td>

                         {/* Dynamic Daily Cells for Shift Counts */}
                         {dateRange.map((date) => {
                             const dateString = date.toISOString().split('T')[0];
                             const dayOfWeek = daysOfWeek[date.getUTCDay()];
                             const isSunday = date.getUTCDay() === 0;

                             const scheduledCount = countScheduledEmployees(shift, date, employees);
                             const idealCount = shift.nurseCounts[dayOfWeek] || 0;
                             const overtimeCount = shouldDisplayOvertime(shift, dateString, employees, timeRanges);

                            return (
                                <td
                                    key={dateString}
                                    className={`px-2 py-1 border border-gray-300 text-center w-[120px] ${isSunday ? 'bg-gray-100' : ''}`}
                                >
                                    <div className="flex flex-col items-center">
                                        {/* Scheduled Count with Staff button */}
                                         <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#3B82F6', padding: '2px 5px', borderRadius: '3px' }}>
                                            <span style={{color: 'white', fontWeight: 'bold', marginRight: '4px'}}>{scheduledCount}</span>
                                            <button
                                                 className="text-white text-xs ml-1 bg-transparent border-none underline cursor-pointer"
                                                 title="Staff For This Shift"
                                            >
                                                 Staff For This Shift
                                            </button>
                                         </div>

                                        {/* Ideal Staff */}
                                        <div className="mt-1 text-sm text-gray-600">
                                            ({idealCount}) Ideal Staff For This Shift
                                        </div>

                                        {/* Available Overtime Display (if > 0) */}
                                         {overtimeCount > 0 && (
                                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3px', border: '1px solid #ccc', padding: '4px', backgroundColor: '#FFFF00', borderRadius: '4px', fontSize: '0.8em' }}>
                                                  <span>Available Shifts: {overtimeCount}</span>
                                                  <small style={{ color: '#666' }}></small> {/* Placeholder for message */}
                                              </div>
                                         )}
                                    </div>
                                </td>
                            );
                         })}
                         {/* Summary Comment Cell */}
                         <td className="px-2 py-1 border border-gray-300 w-[200px]">
                              {/* Use textarea matching JS output, pre-filled with shift.shiftComments */}
                             <textarea
                                className="comment-textarea w-full h-[60px] border border-gray-300 resize-none p-1 text-sm overflow-hidden"
                                placeholder="Click here to add comments for this shift..."
                                title="Add any comments or notes related to this shift"
                                value={shift.shiftComments || ''}
                                readOnly // Make textarea read-only for static demo
                                style={{ height: '60px', transition: 'none' }}
                             ></textarea>
                         </td>
                     </tr>
                );
            })}
          </tbody>
        </table>
      </div>

       {/* Placeholder for the horizontal scrollbar wrapper */}
       <div className="horizontal-scroll-wrapper">
           <div className="horizontal-scroll-content"></div> {/* Content div */}
       </div>

       {/* Overtime Modal */}
       <OvertimeModal
         isOpen={overtimeModal.isOpen}
         onClose={() => setOvertimeModal({ isOpen: false, shift: null })}
         shift={overtimeModal.shift || { startTime: '', endTime: '' }}
       />

       {/* Note: Modals like Block Shift, Priorities, Calendar, Overtime, etc., are not included here */}
       {/* as they are separate UI elements triggered by interactions not replicated in this static structure. */}

    </div>
  );
};

export default EmployeeScheduleTable;