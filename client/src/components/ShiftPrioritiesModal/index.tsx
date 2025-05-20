import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useShiftContext } from '../../context/ShiftContext';
import { useShiftPriorities, ShiftPriorities } from '../../context/ShiftPrioritiesContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ShiftPrioritiesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { shifts } = useShiftContext();
  const { priorities: contextPriorities, setPriorities: setContextPriorities } = useShiftPriorities();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [localPriorities, setLocalPriorities] = useState<ShiftPriorities>(() => {
    const initial: ShiftPriorities = {};
    days.forEach(day => {
      initial[day] = {};
      shifts.forEach(shift => {
        const shiftKey = `${shift.startTime}-${shift.endTime}`;
        initial[day][shiftKey] = contextPriorities[day]?.[shiftKey] || false;
      });
    });
    return initial;
  });

  const handlePriorityChange = (day: string, shiftKey: string, checked: boolean) => {
    const newPriorities = {
      ...localPriorities,
      [day]: {
        ...localPriorities[day],
        [shiftKey]: checked
      }
    };
    setLocalPriorities(newPriorities);
    setContextPriorities(newPriorities);
  };

  const handleSave = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Set Shift Priorities</h2>

        <div className="space-y-6">
          {days.map(day => (
            <div key={day} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold mb-4">{day}</h3>
              <div className="space-y-3">
                {shifts.map(shift => {
                  const shiftKey = `${shift.startTime}-${shift.endTime}`;
                  return (
                    <div key={shiftKey} className="flex items-center gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPriorities[day][shiftKey]}
                          onChange={(e) => handlePriorityChange(day, shiftKey, e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
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
            Save Priorities
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftPrioritiesModal;