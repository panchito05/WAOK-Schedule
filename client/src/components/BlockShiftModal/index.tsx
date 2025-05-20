import React, { useState } from 'react';
import { X } from 'lucide-react';

interface BlockShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName?: string;
  shift: {
    id: string;
    startTime: string;
    endTime: string;
  };
  onSave: (days: string[]) => void;
}

const BlockShiftModal: React.FC<BlockShiftModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  shift,
  onSave,
}) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        const newDays = prev.filter(d => d !== day);
        setSelectAll(false);
        return newDays;
      } else {
        const newDays = [...prev, day];
        setSelectAll(newDays.length === daysOfWeek.length);
        return newDays;
      }
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedDays(!selectAll ? [...daysOfWeek] : []);
  };

  const handleSave = () => {
    onSave(selectedDays);
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

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">
            {employeeName && <span className="block text-gray-600 mb-1">{employeeName}</span>}
            {shift.startTime} - {shift.endTime}
          </h2>
          <h3 className="text-lg">Select Days to Block Shift</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium">All Days</span>
          </label>

          <div className="border-t pt-3 space-y-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockShiftModal;