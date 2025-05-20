import React, { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { X as XIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useShiftContext } from '../../context/ShiftContext';

interface ViewTodaysEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
}

// Tipo para representar a un empleado con su turno para un día específico
interface EmployeeShiftInfo {
  id: string;
  name: string;
  shiftName: string; // Por ejemplo, "7:00 AM - 3:00 PM" o "Leave: Vacation"
  comment: string;
}

// Tipo para la información de cobertura de un turno
interface ShiftCoverageInfo {
  id: string;
  name: string; // Por ejemplo, "Morning Shift (7:00 AM - 3:00 PM)"
  idealStaff: number;
  actualStaff: number;
}

const ViewTodaysEmployeesModal: React.FC<ViewTodaysEmployeesModalProps> = ({ 
  isOpen, 
  onClose, 
  initialDate 
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const { getCurrentList } = useEmployeeLists();
  const { shifts } = useShiftContext();
  
  // Simular la búsqueda de empleados para el día seleccionado
  // Esta función necesitará ser implementada en detalle para buscar empleados
  // con turnos fijos en ese día de la semana o turnos manuales para esa fecha específica
  const getEmployeesForDate = (date: Date): EmployeeShiftInfo[] => {
    const currentList = getCurrentList();
    if (!currentList) return [];
    
    const dayOfWeek = format(date, 'EEEE').toLowerCase(); // 'monday', 'tuesday', etc.
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Filtrar los empleados que tienen turnos para este día
    return currentList.employees.map(employee => {
      // Comprobar si el empleado está de permiso en esta fecha
      const onLeave = employee.leave?.some(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        return date >= startDate && date <= endDate;
      });
      
      if (onLeave) {
        // Encontrar el tipo de permiso
        const leaveType = employee.leave?.find(leave => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          return date >= startDate && date <= endDate;
        })?.leaveType || 'Leave';
        
        return {
          id: employee.id,
          name: employee.name,
          shiftName: `Leave: ${leaveType}`,
          comment: ''
        };
      }
      
      // Comprobar si el empleado tiene un turno fijo para este día de la semana
      const fixedShift = employee.fixedShifts?.[dayOfWeek];
      if (fixedShift && fixedShift.length > 0) {
        // Encontrar el turno correspondiente
        const shiftId = fixedShift[0]; // Tomar el primer turno asignado
        const shiftIndex = parseInt(shiftId.replace('shift_', '')) - 1;
        if (shiftIndex >= 0 && shiftIndex < shifts.length) {
          const shift = shifts[shiftIndex];
          return {
            id: employee.id,
            name: employee.name,
            shiftName: `${shift.startTime} - ${shift.endTime}`,
            comment: ''
          };
        }
      }
      
      // Si no tiene un turno fijo o está de permiso, retornar null
      return null;
    }).filter(Boolean) as EmployeeShiftInfo[]; // Filtrar los null
  };
  
  // Obtener información de cobertura de turnos para el día seleccionado
  const getShiftCoverageInfo = (date: Date): ShiftCoverageInfo[] => {
    // Por ahora, simplemente retornamos información de cobertura basada en los turnos configurados
    return shifts.map((shift, index) => {
      // Aquí se debería calcular el número ideal de personal y el número real
      // basado en la configuración y los empleados asignados
      return {
        id: `shift_${index + 1}`,
        name: `${shift.startTime} - ${shift.endTime}`,
        idealStaff: 5, // Valor por defecto, debería venir de la configuración
        actualStaff: getEmployeesForDate(date).filter(e => 
          e.shiftName === `${shift.startTime} - ${shift.endTime}`
        ).length
      };
    });
  };
  
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };
  
  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };
  
  if (!isOpen) return null;
  
  const employeesForDay = getEmployeesForDate(currentDate);
  const shiftCoverage = getShiftCoverageInfo(currentDate);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <div className="flex items-center">
            <button 
              onClick={goToPreviousDay}
              className="p-2 mr-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">
              Employees for: {format(currentDate, 'MMMM d, yyyy')}
            </h2>
            <button 
              onClick={goToNextDay}
              className="p-2 ml-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {employeesForDay.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees scheduled for this date.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Employee</th>
                  <th className="p-2 text-left">Shift</th>
                  <th className="p-2 text-left">Comment</th>
                </tr>
              </thead>
              <tbody>
                {employeesForDay.map(employee => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{employee.name}</td>
                    <td className="p-2">{employee.shiftName}</td>
                    <td className="p-2">{employee.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Shift Coverage</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Shift</th>
                  <th className="p-2 text-left">Ideal Staff</th>
                  <th className="p-2 text-left">Actual Staff</th>
                </tr>
              </thead>
              <tbody>
                {shiftCoverage.map(coverage => (
                  <tr key={coverage.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{coverage.name}</td>
                    <td className="p-2">{coverage.idealStaff}</td>
                    <td className="p-2">{coverage.actualStaff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTodaysEmployeesModal;