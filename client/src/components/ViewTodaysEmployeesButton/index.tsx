import React, { useState } from 'react';
import TodaysEmployeesModal from '../TodaysEmployeesModal';
import TodaysEmployeesContent from '../TodaysEmployeesContent';

// Interfaces definidas localmente para este componente
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

interface ViewTodaysEmployeesButtonProps {
  date: Date;
  employees: Employee[];
  timeRanges: Shift[];
  countScheduledEmployees: (shift: Shift, date: Date, employees: Employee[]) => number;
  convertTo12Hour: (time: string) => string;
}

const ViewTodaysEmployeesButton: React.FC<ViewTodaysEmployeesButtonProps> = ({
  date,
  employees,
  timeRanges,
  countScheduledEmployees,
  convertTo12Hour
}) => {
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(date));
  
  // Función para abrir el modal
  const openModal = () => {
    setCurrentDate(new Date(date)); // Asegurarse de que es una nueva instancia
    setIsModalOpen(true);
  };
  
  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Funciones para navegar entre días
  const goToPreviousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setUTCDate(prevDate.getUTCDate() - 1);
    setCurrentDate(prevDate);
  };
  
  const goToNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    setCurrentDate(nextDate);
  };
  
  // Función para formatear fecha como texto
  const formatDateForTitle = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        onClick={openModal}
        className="mt-2 text-white text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
      >
        View Today's Employees
      </button>
      
      {/* Modal que muestra los empleados del día seleccionado */}
      {isModalOpen && (
        <TodaysEmployeesModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Employees for: ${formatDateForTitle(currentDate)}`}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
        >
          <TodaysEmployeesContent
            date={currentDate}
            employees={employees}
            timeRanges={timeRanges}
            countScheduledEmployees={countScheduledEmployees}
            convertTo12Hour={convertTo12Hour}
          />
        </TodaysEmployeesModal>
      )}
    </>
  );
};

export default ViewTodaysEmployeesButton;