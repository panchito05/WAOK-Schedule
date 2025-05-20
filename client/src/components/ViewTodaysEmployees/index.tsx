import React from 'react';
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

interface ViewTodaysEmployeesProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  employees: Employee[];
  timeRanges: Shift[];
  onPreviousDay: () => void;
  onNextDay: () => void;
  countScheduledEmployees: (shift: Shift, date: Date, employees: Employee[]) => number;
  convertTo12Hour: (time: string) => string;
  formatDateForTitle: (date: Date) => string;
}

const ViewTodaysEmployees: React.FC<ViewTodaysEmployeesProps> = ({
  isOpen,
  onClose,
  date,
  employees,
  timeRanges,
  onPreviousDay,
  onNextDay,
  countScheduledEmployees,
  convertTo12Hour,
  formatDateForTitle
}) => {
  return (
    <TodaysEmployeesModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Employees for: ${formatDateForTitle(date)}`}
      onPreviousDay={onPreviousDay}
      onNextDay={onNextDay}
    >
      <TodaysEmployeesContent
        date={date}
        employees={employees}
        timeRanges={timeRanges}
        countScheduledEmployees={countScheduledEmployees}
        convertTo12Hour={convertTo12Hour}
      />
    </TodaysEmployeesModal>
  );
};

export default ViewTodaysEmployees;