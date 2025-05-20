import React, { useState, useEffect } from 'react';
import { useShiftContext } from '../../context/ShiftContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';

interface ShiftData {
  id: number;
  name: string;
  timeRange: string;
  counts: number[];
  idealNumber: number;
}

const PersonnelTable: React.FC = () => {
  const { shifts } = useShiftContext();
  const { shiftData, setShiftData } = usePersonnelData();

  useEffect(() => {
    // Update shiftData when shifts change
    const newShiftData = shifts.map((shift, index) => ({
      id: index + 1,
      name: `Shift ${index + 1}`,
      timeRange: `${shift.startTime} - ${shift.endTime}`,
      counts: [4, 4, 4, 4, 4, 4, 4],
      idealNumber: 5.60
    }));
    setShiftData(newShiftData);
  }, [shifts]);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const totalEmployeesNeeded = shiftData.reduce((sum, shift) => 
    sum + Math.max(...shift.counts), 0);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white py-3 rounded">Ideal Number of Personnel per Shift and Day</h2>

      {shiftData.map((shift) => (
        <div key={shift.id} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {shift.name}: {shift.timeRange}
          </h3>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white">
                  <th className="px-4 py-3 text-left border-r border-gray-100 w-32">Day</th>
                  {days.map((day) => (
                    <th key={day} className="px-4 py-3 text-left border-r border-gray-100">
                      {day}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">
                    Ideal Number of Personnel
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-4 py-3 border-r border-gray-300">Count</td>
                  {shift.counts.map((count, index) => (
                    <td key={index} className="px-4 py-3 border-r border-gray-300">
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => {
                          const newCounts = [...shift.counts];
                          const value = parseInt(e.target.value);
                          newCounts[index] = isNaN(value) || value < 0 ? 0 : value;
                          const newShifts = shiftData.map(s => 
                            s.id === shift.id ? {...s, counts: newCounts} : s
                          );
                          setShiftData(newShifts);
                        }}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 font-medium">
                    {shift.idealNumber.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white p-4 rounded-lg flex justify-between items-center">
        <span className="text-lg">
          Total Number of Employees Needed to Meet Staffing Requirements Across All Shifts:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{totalEmployeesNeeded.toFixed(2)}</span>
          <span className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center font-bold">!</span>
        </div>
      </div>
    </div>
  );
};

export default PersonnelTable;