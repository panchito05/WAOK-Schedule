import React from 'react';

interface Employee {
  id: string;
  name: string;
  leave?: { id: string; startDate: string; endDate: string; leaveType: string; hoursPerDay: number }[];
  manualShifts?: { [dateString: string]: string };
  fixedShifts?: { [dayOfWeek: string]: string[] };
  shiftComments?: { [dateString: string]: string };
}

interface Shift {
  id: string;
  start: string;
  end: string;
  nurseCounts: { [dayOfWeek: string]: number };
}

interface TodaysEmployeesContentProps {
  date: Date;
  employees: Employee[];
  timeRanges: Shift[];
  countScheduledEmployees: (shift: Shift, date: Date, employees: Employee[]) => number;
  convertTo12Hour: (time: string) => string;
}

const TodaysEmployeesContent: React.FC<TodaysEmployeesContentProps> = ({
  date,
  employees,
  timeRanges,
  countScheduledEmployees,
  convertTo12Hour
}) => {
  const dateString = date.toISOString().split('T')[0];
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()];
  
  // Filtrar empleados programados para esta fecha
  const scheduledEmployees = employees.filter(employee => {
    // Verificar si está de licencia
    const isOnLeave = employee.leave?.some(l => {
      const leaveStart = new Date(l.startDate + 'T00:00:00Z');
      const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
      return date >= leaveStart && date <= leaveEnd;
    });
    
    // Si está de licencia, se considera programado
    if (isOnLeave) return true;
    
    // Verificar si tiene un turno manual asignado
    const manualShift = employee.manualShifts?.[dateString];
    if (manualShift && manualShift !== 'day-off') return true;
    
    // Verificar si tiene un turno fijo para este día de la semana
    const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
    if (fixedShift && fixedShift !== 'day-off' && (!manualShift || manualShift === 'day-off')) return true;
    
    return false;
  });
  
  // Función para obtener el turno de un empleado
  const getEmployeeShift = (employee: Employee): { type: string; text: string } => {
    // Verificar si está de licencia
    const leave = employee.leave?.find(l => {
      const leaveStart = new Date(l.startDate + 'T00:00:00Z');
      const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
      return date >= leaveStart && date <= leaveEnd;
    });
    
    if (leave) {
      return { 
        type: 'leave', 
        text: leave.leaveType 
      };
    }
    
    // Verificar turno manual
    const manualShift = employee.manualShifts?.[dateString];
    if (manualShift) {
      if (manualShift === 'day-off') {
        return { type: 'day-off', text: 'Day Off' };
      }
      
      const shift = timeRanges.find(shift => shift.id === manualShift);
      if (shift) {
        return { 
          type: 'manual', 
          text: `${convertTo12Hour(shift.start)} - ${convertTo12Hour(shift.end)}` 
        };
      }
    }
    
    // Verificar turno fijo
    const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
    if (fixedShift && fixedShift !== 'day-off') {
      const shift = timeRanges.find(shift => shift.id === fixedShift);
      if (shift) {
        return { 
          type: 'fixed', 
          text: `${convertTo12Hour(shift.start)} - ${convertTo12Hour(shift.end)}` 
        };
      }
    }
    
    return { type: 'none', text: 'No shift assigned' };
  };
  
  return (
    <div className="todaysEmployees">
      {/* Tabla de empleados programados */}
      {scheduledEmployees.length > 0 ? (
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 border text-left">Name</th>
                <th className="px-4 py-2 border text-left">Shift</th>
                <th className="px-4 py-2 border text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {scheduledEmployees.map((employee) => {
                const shiftInfo = getEmployeeShift(employee);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{employee.name}</td>
                    <td className={`px-4 py-2 border ${shiftInfo.type === 'leave' ? 'bg-orange-100' : (shiftInfo.type === 'day-off' ? 'bg-yellow-100' : '')}`}>
                      {shiftInfo.text}
                    </td>
                    <td className="px-4 py-2 border">
                      {employee.shiftComments?.[dateString] || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 text-center rounded">
          There are no employees scheduled for this date.
        </div>
      )}
      
      {/* Información de turnos */}
      <h3 className="text-xl font-bold mb-4">Shift Information</h3>
      <table className="w-full border-collapse">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 border text-left">Shift</th>
            <th className="px-4 py-2 border text-left">Ideal Staff per Shift</th>
            <th className="px-4 py-2 border text-left">Staff for this Shift</th>
          </tr>
        </thead>
        <tbody>
          {timeRanges.map((shift) => (
            <tr key={shift.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                {convertTo12Hour(shift.start)} - {convertTo12Hour(shift.end)}
              </td>
              <td className="px-4 py-2 border">
                {shift.nurseCounts[dayOfWeek] || 0}
              </td>
              <td className="px-4 py-2 border">
                {countScheduledEmployees(shift, date, employees)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodaysEmployeesContent;