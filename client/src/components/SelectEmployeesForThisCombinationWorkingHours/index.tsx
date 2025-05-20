import React, { useState } from 'react';
import { useShiftContext } from '../../context/ShiftContext';

interface ShiftSelection {
  shiftId: string;
  count: number;
}

interface Column {
  topShift: ShiftSelection;
  bottomShift: ShiftSelection;
}

const SelectEmployeesForThisCombinationWorkingHours: React.FC = () => {
  const { shifts } = useShiftContext();
  const [columns, setColumns] = useState<Column[]>([
    { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } },
    { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } },
    { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } }
  ]);

  const handleShiftChange = (columnIndex: number, position: 'top' | 'bottom', shiftId: string) => {
    setColumns(prev => {
      const newColumns = [...prev];
      if (position === 'top') {
        newColumns[columnIndex].topShift.shiftId = shiftId;
      } else {
        newColumns[columnIndex].bottomShift.shiftId = shiftId;
      }
      return newColumns;
    });
  };

  const handleCountChange = (columnIndex: number, position: 'top' | 'bottom', count: number) => {
    setColumns(prev => {
      const newColumns = [...prev];
      if (position === 'top') {
        newColumns[columnIndex].topShift.count = count;
      } else {
        newColumns[columnIndex].bottomShift.count = count;
      }
      return newColumns;
    });
  };

  const handleSelectEmployees = (columnIndex: number) => {
    const column = columns[columnIndex];
    console.log(`Selecting employees for column ${columnIndex + 1}:`, column);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-6">Select Employees For This Combination Working Hours:</h2>

      <div className="grid grid-cols-3 gap-6">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            <div className="flex items-center gap-2">
              <select
                value={column.topShift.shiftId}
                onChange={(e) => handleShiftChange(columnIndex, 'top', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Shift</option>
                {shifts.map((shift, index) => (
                  <option key={index} value={`shift_${index + 1}`}>
                    {shift.startTime} - {shift.endTime}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={column.topShift.count}
                onChange={(e) => handleCountChange(columnIndex, 'top', parseInt(e.target.value) || 0)}
                className="w-16 border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={column.bottomShift.shiftId}
                onChange={(e) => handleShiftChange(columnIndex, 'bottom', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Shift</option>
                {shifts.map((shift, index) => (
                  <option key={index} value={`shift_${index + 1}`}>
                    {shift.startTime} - {shift.endTime}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={column.bottomShift.count}
                onChange={(e) => handleCountChange(columnIndex, 'bottom', parseInt(e.target.value) || 0)}
                className="w-16 border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <button
              onClick={() => handleSelectEmployees(columnIndex)}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Select Employees
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectEmployeesForThisCombinationWorkingHours;