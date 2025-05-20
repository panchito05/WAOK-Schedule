import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  onSave: (leave: { startDate: string; endDate: string; type: string; hoursPerDay: number }) => void;
}

const leaveTypes = [
  'Paid Vacation',
  'Sick Leave',
  'Family and Medical Leave (FMLA)',
  'Bereavement Leave',
  'Birth or Adoption Leave',
  'Marriage Leave',
  'Study Leave',
  'Military Service Leave',
  'Jury Duty',
  'Voting Leave',
  'Moving Leave',
  'Personal Affairs Leave',
  'Unpaid Leave',
  'Short-term Disability Leave',
  'Religious Leave',
  'Personal Emergency Leave',
  'Other Type of Leave (Editable Write Your Leave)'
];

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  onSave
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Paid Vacation');
  const [hoursPerDay, setHoursPerDay] = useState('8');

  const handleSave = () => {
    if (!startDate || !endDate || !leaveType || !hoursPerDay) {
      return;
    }

    onSave({
      startDate,
      endDate,
      type: leaveType,
      hoursPerDay: parseFloat(hoursPerDay)
    });

    // Reset form
    setStartDate('');
    setEndDate('');
    setLeaveType('Paid Vacation');
    setHoursPerDay('8');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-6">Select Date or Date Range</h2>

        <div className="bg-green-500 text-white px-4 py-2 rounded mb-6">
          Adding Leave for: {employeeName}
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="mm/dd/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Leave
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours per Leave Day (for biweekly calculation):
            </label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., 8"
            />
            <p className="text-xs text-gray-500 mt-1">
              (Enter 0 if leave days don't count towards total hours)
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Save Leave
        </button>
      </div>
    </div>
  );
};

export default LeaveModal;