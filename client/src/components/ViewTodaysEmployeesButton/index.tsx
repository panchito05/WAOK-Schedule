import React, { useState } from 'react';
import TodaysEmployeesModal from '../TodaysEmployeesModal';
import TodaysEmployeesContent from '../TodaysEmployeesContent';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(date);
  
  const openModal = () => {
    setCurrentDate(date);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
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
      <button
        onClick={openModal}
        className="mt-2 text-white text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
      >
        View Today's Employees
      </button>
      
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
    </>
  );
};

export default ViewTodaysEmployeesButton;