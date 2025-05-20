import React, { useMemo, useEffect } from 'react';
import { useShiftContext } from '../../context/ShiftContext';
import { useRules } from '../../context/RulesContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';
import { useShiftPriorities } from '../../context/ShiftPrioritiesContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useSelectedEmployees } from '../../context/SelectedEmployeesContext';
import { Calendar } from 'lucide-react';
import { ShiftRow } from '../../context/ShiftContext'; 

// Estilos CSS adicionales para la funcionalidad de ocultar/mostrar la tabla
const styles = {
  tableHeaderHidden: {
    position: 'relative',
    background: '#FEF9C3', // Color amarillo claro para indicar que está oculto
  },
  tableHiddenMessage: {
    fontWeight: 'bold',
    color: '#000',
    padding: '10px',
    textAlign: 'center',
    width: '100%',
  },
  tableHiddenButton: {
    backgroundColor: '#ffd700',
    color: '#000',
    borderRadius: '4px',
    padding: '8px 16px',
    transition: 'all 0.3s ease',
  }
};

const formatPreferences = (preferences: (number | null)[], shifts: ShiftRow[]) => {
  if (!preferences?.length) return 'None';

  // Sort preferences by priority number
  const sortedPrefs = preferences
    .map((pref, index) => ({ pref, index }))
    .filter(({ pref }) => pref !== null)
    .sort((a, b) => (a.pref || 0) - (b.pref || 0));

  if (sortedPrefs.length === 0) return 'None';

  return sortedPrefs
    .map(({ pref, index }) => {
      const shift = shifts[index];
      return shift ? `Pref #${pref}: ${shift.startTime} - ${shift.endTime}` : null;
    })
    .filter(Boolean)
    .join(', ');
};

const formatFixedShifts = (fixedShifts: { [day: string]: string[] } | undefined, shifts: ShiftRow[]) => {
  if (!fixedShifts || Object.keys(fixedShifts).length === 0) return 'None';
  return Object.entries(fixedShifts)
    .filter(([_, shiftIds]) => shiftIds && shiftIds.length > 0)
    .map(([day, shiftIds]) => 
      shiftIds[0] === 'day-off' 
        ? `${day}: Day Off`
        : `${day}: ${(() => {
            const shiftIndex = parseInt(shiftIds[0].split('_')[1]) - 1;
            const shift = shifts[shiftIndex];
            return shift ? `${shift.startTime}-${shift.endTime}` : 'Unknown';
          })()}`
    )
    .join(', ');
};

const formatLeaves = (leaves: { startDate: string; endDate: string; leaveType: string; hoursPerDay: number }[] | undefined) => {
  if (!leaves || leaves.length === 0) return 'No leaves';
  return leaves
    .map(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const formatDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
      return `${leave.leaveType}: ${formatDate(startDate)} to ${formatDate(endDate)} (${leave.hoursPerDay} hrs/day)`;
    })
    .join(', ');
};

const ScheduleRulesTable: React.FC = () => {
  const { shifts } = useShiftContext();
  const { rules } = useRules();
  const { shiftData } = usePersonnelData();
  const { getFormattedPriorities, priorities } = useShiftPriorities();
  const { getCurrentList } = useEmployeeLists();
  const { selectedEmployeeIds } = useSelectedEmployees();
  const [isTableHidden, setIsTableHidden] = React.useState(false);
  
  // Guardamos el estado en localStorage para persistir después de recargar la página
  const [isTableBodyHidden, setIsTableBodyHidden] = React.useState(() => {
    const savedState = localStorage.getItem('scheduleRulesTableHidden');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  // Referencias a elementos del DOM para manipulación directa
  const rulesTableRef = React.useRef<HTMLDivElement>(null);

  // Función para alternar la visibilidad del cuerpo de la tabla
  const toggleTableBody = () => {
    const newState = !isTableBodyHidden;
    setIsTableBodyHidden(newState);
    localStorage.setItem('scheduleRulesTableHidden', JSON.stringify(newState));
  };
  
  // Efecto para aplicar los estilos CSS cuando cambia el estado de la tabla
  useEffect(() => {
    const tableHeaders = document.querySelectorAll('.table-header-hidden');
    const tableHiddenMessage = document.querySelectorAll('.table-hidden-message');
    const tableHiddenButton = document.getElementById('toggle-schedule-rules-table');
    
    if (isTableBodyHidden) {
      // Aplicar estilos cuando la tabla está oculta
      tableHeaders.forEach(header => {
        Object.assign((header as HTMLElement).style, styles.tableHeaderHidden);
      });
      
      tableHiddenMessage.forEach(message => {
        Object.assign((message as HTMLElement).style, styles.tableHiddenMessage);
      });
      
      if (tableHiddenButton) {
        Object.assign(tableHiddenButton.style, styles.tableHiddenButton);
      }
    } else {
      // Restaurar estilos por defecto
      tableHeaders.forEach(header => {
        (header as HTMLElement).style.position = '';
        (header as HTMLElement).style.background = '';
      });
      
      if (tableHiddenButton) {
        tableHiddenButton.style.backgroundColor = '';
        tableHiddenButton.style.color = '';
      }
    }
  }, [isTableBodyHidden]);

  // Filtramos empleados para mostrar solo los seleccionados
  const employees = useMemo(() => {
    const currentList = getCurrentList();
    const allEmployees = currentList?.employees || [];
    // Solo mostramos los empleados que estén seleccionados
    return allEmployees.filter(employee => selectedEmployeeIds.includes(employee.id));
  }, [getCurrentList, selectedEmployeeIds]);

  return (
    <div className={`w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata'] ${isTableHidden ? 'hidden' : ''}`}>
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule Rules Table</h2>
        <button 
          id="toggle-schedule-rules-table"
          onClick={toggleTableBody}
          className={`px-4 py-2 rounded transition-colors ${isTableBodyHidden ? 'bg-yellow-500 text-black table-hidden-button' : 'bg-white text-[#19b08d] hover:bg-gray-100'}`}
          data-es-show="Mostrar Tabla de Reglas de Horario"
          data-es-hide="Ocultar Tabla de Reglas de Horario"
        >
          {isTableBodyHidden ? 'Show Schedule Rules Table' : 'Hide Schedule Rules Table'}
        </button>
      </div>

      {isTableBodyHidden && (
        <div className="bg-yellow-100 text-black text-center py-4 px-2 rounded mb-4">
          <span className="table-hidden-message font-bold">
            Schedule Rules Table is hidden. Press 'Show Schedule Rules Table' button to make it visible again
          </span>
        </div>
      )}

      {/* Todo el contenido de la tabla - Solo visible cuando el cuerpo no está oculto */}
      {!isTableBodyHidden && (
        <div 
          id="rules-display" 
          className="overflow-hidden schedule-rules-section" 
          ref={rulesTableRef}
        >
          {/* General Rules Table */}
          <table id="rules-table" className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-50 text-left">Category</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Start Date</td>
                <td className="border px-4 py-2">
                  {rules.startDate}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">End Date</td>
                <td className="border px-4 py-2">
                  {rules.endDate}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Maximum consecutive shifts (For All Employees):</td>
                <td className="border px-4 py-2">
                  {rules.maxConsecutiveShifts}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum days off after max consecutive shifts:</td>
                <td className="border px-4 py-2">
                  {rules.minDaysOffAfterMax}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum weekends off per month:</td>
                <td className="border px-4 py-2">
                  {rules.minWeekendsOffPerMonth}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum rest hours between shifts:</td>
                <td className="border px-4 py-2">
                  {rules.minRestHoursBetweenShifts}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Written Rule 1:</td>
                <td className="border px-4 py-2">
                  {rules.writtenRule1 || 'None'}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Written Rule 2:</td>
                <td className="border px-4 py-2">
                  {rules.writtenRule2 || 'None'}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum hours per week:</td>
                <td className="border px-4 py-2">
                  {rules.minHoursPerWeek}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum hours per two weeks:</td>
                <td className="border px-4 py-2">
                  {rules.minHoursPerTwoWeeks}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Shifts Table */}
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-50 text-left">Shift</th>
                <th className="border px-4 py-2 bg-gray-50 text-center">Sunday</th>
                <th className="border px-4 py-2 bg-gray-50 text-center">Monday</th>
                <th className="border px-4 py-2 bg-gray-50 text-center">Tuesday</th>
                <th className="border px-4 py-2 bg-gray-50 text-center">Wednesday</th>
                <th className="border px-4 py-2 bg-gray-50 text-center">Thursday</th>
                <th className="border px-4 py-2 bg-gray-50 text-center">Friday</th>
                <th className="border px-4 py-2 bg-gray-50 text-center">Saturday</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    Shift {index + 1}: {shift.startTime} - {shift.endTime}
                  </td>
                  {shiftData[index]?.counts.map((count, dayIndex) => (
                    <td key={dayIndex} className="border px-4 py-2 text-center">
                      {count}
                    </td>
                  )) || Array(7).fill(0).map((_, i) => (
                    <td key={i} className="border px-4 py-2 text-center">0</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Shift Priorities Table */}
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-50 text-left">Day</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Shift Priorities</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(priorities).map(([day, dayPriorities]) => (
                <tr key={day}>
                  <td className="border px-4 py-2">{day}</td>
                  <td className="border px-4 py-2">{getFormattedPriorities(day)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Employees Table */}
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-50 text-left">#</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Employee</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">ID</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Hire Date</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">AI Rules</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Max Consecutive Shifts</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Shift Preferences</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Locked Shift</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Fixed/Permanent Shifts</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Leaves</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{employee.name}</td>
                  <td className="border px-4 py-2">{employee.id}</td>
                  <td className="border px-4 py-2">{employee.hireDate}</td>
                  <td className="border px-4 py-2">{employee.notes?.aiRules || 'N/A'}</td>
                  <td className="border px-4 py-2">{employee.maxConsecutiveShifts || rules.maxConsecutiveShifts}</td>
                  <td className="border px-4 py-2">{formatPreferences(employee.shiftPreferences, shifts)}</td>
                  <td className="border px-4 py-2">{Object.entries(employee.blockedShifts || {}).map(([shiftId, days]) => {
                    const shiftIndex = parseInt(shiftId.split('_')[1]) - 1;
                    const shift = shifts[shiftIndex];
                    return shift ? `${shift.startTime}-${shift.endTime} (${days.join(', ')})` : '';
                  }).filter(Boolean).join(', ') || 'None'}</td>
                  <td className="border px-4 py-2">{formatFixedShifts(employee.fixedShifts, shifts)}</td>
                  <td className="border px-4 py-2">{formatLeaves(employee.leave)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleRulesTable;