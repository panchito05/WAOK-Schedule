import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Users } from 'lucide-react'; // Renombrar para evitar conflicto
import { useRules } from '../../context/RulesContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useShiftContext } from '../../context/ShiftContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';
import { useSelectedEmployees } from '../../context/SelectedEmployeesContext';
import OvertimeModal from '../OvertimeModal';

// --- Definición de Tipos de Datos (Simulando la estructura del JS) ---
interface Employee {
  id: string;
  name: string;
  uniqueId: string;
  preferences: (number | null)[];
  unavailableShifts: { [shiftId: number]: number[] };
  selected: boolean;
  manualShifts: { [date: string]: string };
  leave: { startDate: string; endDate: string; leaveType: string; hoursPerDay: number }[];
  lockedShifts: { [date: string]: string };
  fixedShifts: { [day: string]: string[] };
  autoDaysOff: string[];
  shiftComments: { [date: string]: string };
  columnComments: string;
}

interface Shift {
  id: string;
  start: string;
  end: string;
  nurseCounts: { [day: string]: number };
  shiftComments?: string;
  isOvertimeActive?: boolean;
}

// Función auxiliar para convertir hora de 24h a 12h (AM/PM)
const convertTo12Hour = (time24: string): string => {
  // If time is already formatted, just return it
  if (time24.includes('AM') || time24.includes('PM')) {
    return time24;
  }
  
  // Extract hours and minutes
  const [hours, minutes] = time24.split(':').map(Number);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
  
  // Format and return the time
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

interface TimeRange {
  start: string;
  end: string;
  id: string;
}

// Nombres de los días de la semana (para búsqueda/indexación)
const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Función para verificar si un empleado está de vacaciones o licencia en una fecha específica
const isEmployeeOnLeave = (employee: Employee, dateString: string): boolean => {
  if (!employee.leave || !Array.isArray(employee.leave)) return false;
  
  return employee.leave.some(leave => {
    const startDate = leave.startDate;
    const endDate = leave.endDate;
    return dateString >= startDate && dateString <= endDate;
  });
};

// Función para verificar si se supera el máximo de turnos consecutivos (placeholder, lógica simplificada)
const exceedsMaxConsecutiveShifts = (employee: Employee, dateString: string, rules: any, shifts: TimeRange[]): boolean => {
  // Lógica de simulación - en un sistema real, esto verificaría los turnos anteriores
  // y determinaría si añadir este turno excedería el límite máximo
  return false; // Placeholder - retorna falso para no mostrar advertencias
};

// Función para verificar si se viola el tiempo mínimo de descanso (placeholder, lógica simplificada)
const violatesMinRestTime = (employee: Employee, dateString: string, shiftId: string, rules: any, shifts: TimeRange[]): boolean => {
  // Lógica de simulación - en un sistema real, esto verificaría los turnos anteriores y siguientes
  // y calcularía si hay suficiente tiempo de descanso entre turnos
  return false; // Placeholder - retorna falso para no mostrar advertencias
};

// Contabilizar empleados programados para un turno específico
const countScheduledEmployees = (shift: Shift, date: Date, employees: Employee[]): number => {
  const dateString = date.toISOString().split('T')[0];
  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  
  return employees.filter(emp => {
    // Verificar turnos manuales para esta fecha
    if (emp.manualShifts && emp.manualShifts[dateString] === shift.id) return true;
    
    // Verificar turnos fijos para este día de la semana
    if (emp.fixedShifts && emp.fixedShifts[dayOfWeek] && emp.fixedShifts[dayOfWeek].includes(shift.id)) return true;
    
    return false;
  }).length;
};

// Verificar si se debe mostrar disponibilidad de horas extra
const shouldDisplayOvertime = (shift: Shift, dateString: string, employees: Employee[], timeRanges: TimeRange[]): number => {
  // Verificar si las horas extra están activas para este turno
  if (!shift.isOvertimeActive) return 0;
  
  // En un sistema real, esto calcularía cuántas posiciones de horas extra están disponibles
  // basado en configuraciones, necesidades, límites presupuestarios, etc.
  return Math.floor(Math.random() * 3); // Placeholder - número aleatorio entre 0 y 2
};

// Función para formatear las horas bi-semanales con colores según umbrales
const formatBiweeklyHours = (hours: number, minHours: number): string => {
  let color = 'inherit';
  let message = '';
  
  // Definir color basado en horas (bajo=rojo, óptimo=verde, alto=amarillo)
  if (hours < minHours) {
    color = '#FF5555'; // Rojo para horas insuficientes
    message = 'Insufficient Hours';
  } else if (hours > minHours * 1.25) {
    color = '#FFD700'; // Amarillo para horas excesivas
    message = 'Excessive Hours';
  } else {
    color = '#44CC44'; // Verde para rango óptimo
    message = 'Optimal Hours';
  }
  
  return `<div style="color: ${color};">${hours} hours ${message ? `<span style="font-size: 0.85em;">(${message})</span>` : ''}</div>`;
};

// Función para obtener información de preferencias y turnos bloqueados
const getPreferenceAndBlockedInfo = (employee: Employee, shifts: TimeRange[]): string => {
  let result = '<div class="flex flex-col">';
  
  // Preferencias de turnos
  result += '<div><strong>Preferred:</strong>';
  
  const hasPreferences = employee.preferences && employee.preferences.some(p => p === 1);
  
  if (hasPreferences && Array.isArray(employee.preferences)) {
    result += '<ul class="pl-4">';
    employee.preferences.forEach((pref, index) => {
      if (pref === 1 && shifts[index]) {
        result += `<li>${convertTo12Hour(shifts[index].start)} - ${convertTo12Hour(shifts[index].end)}</li>`;
      }
    });
    result += '</ul>';
  } else {
    result += ' <span class="text-gray-500">None</span>';
  }
  result += '</div>';
  
  // Turnos bloqueados
  result += '<div class="mt-2"><strong>Blocked:</strong>';
  
  let hasBlocked = false;
  if (employee.unavailableShifts) {
    const blockedShifts = Object.entries(employee.unavailableShifts);
    
    if (blockedShifts.length > 0) {
      hasBlocked = true;
      result += '<ul class="pl-4">';
      blockedShifts.forEach(([shiftIndex, days]) => {
        const shift = shifts[parseInt(shiftIndex)];
        if (shift) {
          result += `<li>${convertTo12Hour(shift.start)} - ${convertTo12Hour(shift.end)}`;
          result += ` (${days.map(day => daysOfWeek[day].charAt(0).toUpperCase() + daysOfWeek[day].slice(1, 3)).join(', ')})</li>`;
        }
      });
      result += '</ul>';
    }
  }
  
  if (!hasBlocked) {
    result += ' <span class="text-gray-500">None</span>';
  }
  result += '</div>';
  
  result += '</div>';
  return result;
};

// --- Componente Principal de la Tabla de Programación de Empleados ---
const EmployeeScheduleTable: React.FC = () => {
  // Estado local
  const [overtimeModal, setOvertimeModal] = useState<{ isOpen: boolean; shift: { startTime: string; endTime: string } | null }>({ isOpen: false, shift: null });
  const [isScheduleTableHidden, setIsScheduleTableHidden] = useState(false);
  
  // Acceso a los contextos
  const { rules } = useRules();
  const { getCurrentList } = useEmployeeLists();
  const { shifts: contextShifts } = useShiftContext();
  const { selectedEmployeeIds } = useSelectedEmployees();
  
  // Obtener la lista actual y sus empleados
  const currentList = getCurrentList();
  const employees = currentList?.employees || [];
  const updateList = useEmployeeLists().updateList;
  
  // Convertir los turnos del contexto a TimeRange para uso en este componente
  const timeRanges: TimeRange[] = useMemo(() => contextShifts.map((shift, index) => ({
    id: index.toString(), // Convertir índice a string para usarlo como ID
    start: shift.startTime,
    end: shift.endTime
  })), [contextShifts]);
  
  // Filtrar empleados seleccionados
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => selectedEmployeeIds.includes(emp.id));
  }, [employees, selectedEmployeeIds]);
  
  // Fecha de inicio para el rango de fechas (de Rules)
  const startDateString = rules.startDate || new Date().toISOString().split('T')[0];
  
  // Generar rango de fechas para las columnas de días
  const dateRange = useMemo(() => {
    const start = new Date(startDateString);
    const end = new Date(start);
    end.setDate(end.getDate() + 14); // 2 semanas
    
    const dates = [];
    const current = new Date(start);
    
    while (current < end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [startDateString]);
  
  // --- Renderizado del Componente ---
  return (
    <div className="employee-schedule-table mt-4">
      {/* Controls Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded focus:outline-none"
            onClick={() => setIsScheduleTableHidden(!isScheduleTableHidden)}
          >
            {isScheduleTableHidden ? 'Show Schedule' : 'Hide Schedule'}
          </button>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded focus:outline-none">
            Export to Excel
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded focus:outline-none flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" /> View in Calendar
          </button>
        </div>
      </div>
      
      {/* Schedule Table */}
      <div className="overflow-x-auto relative" style={{ minHeight: '300px' }}> {/* Set a minimum height */}
        <table className="min-w-full border-collapse table-fixed">
          <thead className="bg-gray-100">
            <tr>
               {/* Employee Count Header */}
               <th colSpan={3} className="px-2 py-1 text-left border border-gray-300">
                 <div className="flex justify-between items-center">
                   <span>
                     {filteredEmployees.length} Employees
                   </span>
                   <div className="ml-auto">
                     <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded focus:outline-none text-xs flex items-center">
                       <Users className="w-3 h-3 mr-1" /> 
                       View All Employees
                     </button>
                   </div>
                 </div>
               </th>
                
               {/* Dynamic Date Headers */}
               {dateRange.map((date) => {
                  const isSunday = date.getUTCDay() === 0;
                  return (
                    <th 
                      key={date.toISOString().split('T')[0]} 
                      className={`px-2 py-1 text-center border border-gray-300 w-[120px] ${isSunday ? 'bg-gray-200' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">
                          {date.getUTCDate()} / {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getUTCMonth()]} /
                        </span>
                        <span>
                          {date.getUTCFullYear()}
                        </span>
                        <span className="text-sm">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()]}
                        </span>
                      </div>
                      
                      {/* View Today's Employees Button */}
                      <button className="mt-1 w-full bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-sm">
                        View<br />Today's<br />Employees
                      </button>
                    </th>
                  );
               })}
               {/* Summary Column Header */}
               <th className="px-2 py-1 text-left border border-gray-300 w-[200px]">
                  Comments
               </th>
            </tr>
            
            {/* Column Headers for Shift Configuration */}
             {!isScheduleTableHidden && (
                <tr>
                   {/* Static Headers */}
                   <th style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 text-left border border-gray-300" data-en="Employees" data-es="Empleados">Employees</th>
                   <th style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 text-left border border-gray-300" data-en="Shift: Preferences or Locked" data-es="Turno: Preferencias o Bloqueado">Shift: Preferences or Locked</th>
                   <th style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 text-left border border-gray-300" data-en="Total Shifts / Hours" data-es="Total Turnos / Horas">Total Shifts / Hours</th> {/* Todas las columnas con el mismo ancho */}

                   {/* Dynamic Date Headers */}
                   {dateRange.map((date) => {
                      const isSunday = date.getUTCDay() === 0;
                      return (
                        <th 
                          key={date.toISOString().split('T')[0]} 
                          className={`px-2 py-1 text-center border border-gray-300 ${isSunday ? 'bg-gray-100' : ''}`}
                          style={{width: "120px", minWidth: "120px"}}
                        >
                          <div className="flex flex-col items-center">
                            <span>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()]}</span>
                            <span>{date.getUTCDate()}</span>
                          </div>
                          {/* Este header específico no tiene acción adicional */}
                        </th>
                      );
                   })}
                   {/* Summary Column Sub-Header */}
                   <th className="px-2 py-1 text-center border border-gray-300 w-[200px]" data-en="Employee Notes" data-es="Notas del Empleado">
                      Employee Notes
                   </th>
                </tr>
             )}
          </thead>
          <tbody>
            {/* Employee Rows */}
            {filteredEmployees.map((employee, index) => {
              // Calcular porcentaje de coincidencia como ejemplo (en un sistema real esto sería calculado basado en preferencias vs asignación)
              const matchPercentage = '0.00';
              
              // Calcular horas bi-semanales para mostrar en el resumen
              const hoursData = 80; // Placeholder - en un sistema real se contarían las horas programadas
              
              // Extraer valores del contexto de Rules para validaciones
              const minBiweeklyHours = rules.minHoursPerTwoWeeks ? parseInt(rules.minHoursPerTwoWeeks) : 72;
              
              // Dato ficticio para ejemplo - turnos de fin de semana trabajados/requeridos
              const weekendShiftsWorked = 2;
              const weekendsOffPerMonth = rules.minWeekendsOffPerMonth ? parseInt(rules.minWeekendsOffPerMonth) : 2;
              
              return (
                <tr key={employee.uniqueId} className="border-b border-gray-300 align-top"> {/* Added align-top */}
                  {/* Employee Info Cell */}
                  <td style={{width: "150px", minWidth: "150px"}} className="px-2 py-1 border border-gray-300">
                    <div className="flex flex-col"> {/* Use flex-col for stacking */}
                        <span>{index + 1}. {employee.name}</span> {/* Added employee number */}
                        <span className="text-sm text-gray-500">({matchPercentage}% match)
</span> {/* Added match % */}
                        <button 
                            className="mt-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            data-en="View in Calendar" data-es="Ver en Calendario"
                        >
                            View in Calendar
                        </button>
                    </div>
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
                      }}>
                          <div className="text-sm">Weekends Off: {weekendsOffPerMonth - weekendShiftsWorked}/{weekendsOffPerMonth}</div>
                          <div className="text-sm text-gray-600">Required Days Off: {weekendsOffPerMonth}</div>
                      </div>
                  </td>

                  {/* Dynamic Date Cells */}
                  {dateRange.map((date) => {
                    const dateString = date.toISOString().split('T')[0];
                    const isSunday = date.getUTCDay() === 0;

                    // Determinar si ya hay una asignación para este día
                    const isOnLeave = isEmployeeOnLeave(employee, dateString);
                    
                    // Aquí se determina qué turno está asignado (de varias fuentes posibles)
                    const dayOfWeek = daysOfWeek[date.getUTCDay()];
                    
                    // Prioridad: 1) turno manual, 2) turno fijo, 3) ninguno
                    let assignedShift = '';
                    let fixedShift = '';
                    
                    if (employee.manualShifts && employee.manualShifts[dateString]) {
                      assignedShift = employee.manualShifts[dateString];
                    } else if (employee.fixedShifts && employee.fixedShifts[dayOfWeek] && employee.fixedShifts[dayOfWeek].length > 0) {
                      fixedShift = employee.fixedShifts[dayOfWeek][0];
                      assignedShift = fixedShift;
                    }

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
                                 {/* Icons Row - INTERCAMBIADO DE POSICIÓN con el Select */}
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

                                 {/* Shift Select - INTERCAMBIADO DE POSICIÓN con los iconos */}
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
