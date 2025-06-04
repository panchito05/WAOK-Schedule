import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ShiftRow } from '../../context/ShiftContext';

interface AssignPermanentShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  shifts: ShiftRow[];
  onSave: (fixedShifts: { [day: string]: string[] }) => void;
  initialFixedShifts?: { [day: string]: string[] };
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AssignPermanentShiftsModal: React.FC<AssignPermanentShiftsModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  shifts,
  onSave,
  initialFixedShifts = {}
}) => {
  const [selectedShifts, setSelectedShifts] = useState<{ [day: string]: string[] }>(initialFixedShifts);

  const handleShiftChange = (day: string, value: string) => {
    setSelectedShifts(prev => ({
      ...prev,
      [day]: value === 'day-off' ? ['day-off'] : [value]
    }));
  };

  const handleSave = () => {
    onSave(selectedShifts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold text-center text-green-600 mb-6">
          Assigning Fixed Shifts for: {employeeName}
        </h2>

        <div className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <label className="w-32 font-medium">{day}</label>
              <select
                value={selectedShifts[day]?.[0] || ''}
                onChange={(e) => handleShiftChange(day, e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select shift or day off</option>
                <option value="day-off">Day Off</option>
                {shifts.map((shift, index) => (
                  <option key={index} value={`uid_${Math.random().toString(36).substr(2, 15)}`}>
                    {shift.startTime} - {shift.endTime}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Fixed Shifts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignPermanentShiftsModal;