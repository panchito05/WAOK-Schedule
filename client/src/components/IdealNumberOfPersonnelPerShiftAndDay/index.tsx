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
    // Solo actualizar shiftData si los turnos han cambiado y shiftData está vacío 
    // o si hay una diferencia en el número de turnos, para evitar bucles infinitos
    const shouldUpdateShiftData = 
      shiftData.length === 0 || 
      shiftData.length !== shifts.length || 
      !shifts.every((shift, index) => 
        index < shiftData.length && 
        `${shift.startTime} - ${shift.endTime}` === shiftData[index].timeRange
      );

    if (shouldUpdateShiftData) {
      console.log("Actualizando shiftData basado en cambios en shifts");
      const newShiftData = shifts.map((shift, index) => {
        // Preservar los counts existentes si ya existen para este shift
        const existingShift = shiftData.find(s => 
          s.timeRange === `${shift.startTime} - ${shift.endTime}`
        );
        
        return {
          id: index + 1,
          name: `Shift ${index + 1}`,
          timeRange: `${shift.startTime} - ${shift.endTime}`,
          counts: existingShift ? existingShift.counts : [4, 4, 4, 4, 4, 4, 4],
          idealNumber: existingShift ? existingShift.idealNumber : 5.60
        };
      });
      setShiftData(newShiftData);
    }
  }, [shifts, shiftData]);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const totalEmployeesNeeded = shiftData.reduce((sum, shift) => 
    sum + Math.max(...shift.counts), 0);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Ideal Number of Personnel per Shift and Day</h2>
      </div>

      {shiftData.map((shift) => (
        <div key={shift.id} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">
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
                  <td className="px-4 py-3 border-r border-gray-300 font-semibold">Count</td>
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
                        className="w-16 border border-gray-300 rounded px-2 py-2 text-center font-medium focus:border-[#19b08d] focus:ring focus:ring-[#117cee] focus:ring-opacity-20"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 font-semibold text-center bg-gray-50">
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