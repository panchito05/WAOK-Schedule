import React, { useState, useEffect, useRef } from 'react';
import { useShiftContext } from '../../context/ShiftContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';
import { useRules } from '../../context/RulesContext';
import { findShiftById } from '../../utils/shiftUtils';

interface ShiftData {
  id: string;
  name: string;
  timeRange: string;
  counts: number[];
  idealNumber: number;
}

// Función para calcular la duración del turno en horas
function calculateShiftDurationInHours(startTime: string, endTime: string, lunchBreakDeduction: number = 0): number {
  if (!startTime || !endTime) return 0;
  
  // Convertir formato de 12 horas a 24 horas si es necesario
  const convertTo24Hour = (time: string): string => {
    if (time.includes('AM') || time.includes('PM')) {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return time;
  };
  
  const start24 = convertTo24Hour(startTime);
  const end24 = convertTo24Hour(endTime);
  
  const startDate = new Date(`2000-01-01T${start24}:00`);
  let endDate = new Date(`2000-01-01T${end24}:00`);
  
  // Si el turno cruza medianoche
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  
  // Restar el tiempo de almuerzo (convertir minutos a horas)
  return Math.max(0, hours - (lunchBreakDeduction / 60));
}

// Función para calcular el número ideal de personal para un turno
function calculateIdealPersonnel(
  dailyCounts: number[], 
  shiftDurationHours: number, 
  minBiweeklyHours: number
): number {
  if (minBiweeklyHours <= 0 || shiftDurationHours <= 0) return 0;
  
  // Calcular el total de horas-enfermera necesarias por semana
  const totalWeeklyNurseHours = dailyCounts.reduce((sum, count) => sum + (count * shiftDurationHours), 0);
  
  // Calcular las horas que trabajaría un empleado de tiempo completo en dos semanas
  const biweeklyHoursPerEmployee = minBiweeklyHours;
  
  // Calcular el número ideal de empleados equivalentes a tiempo completo
  // Multiplicamos por 2 porque tenemos datos semanales pero el mínimo es quincenal
  const idealPersonnel = (totalWeeklyNurseHours * 2) / biweeklyHoursPerEmployee;
  
  return Math.round(idealPersonnel * 100) / 100; // Redondear a 2 decimales
}

const PersonnelTable: React.FC = () => {
  const { shifts } = useShiftContext();
  const { shiftData, setShiftData } = usePersonnelData();
  const { rules } = useRules();

  // useEffect para sincronizar con cambios en turnos
  useEffect(() => {
    if (shifts.length === 0) return;
    
    console.log("Sincronizando shiftData con cambios en shifts o reglas");
    const newShiftData = shifts.map((shift, index) => {
      // Preservar los counts existentes si ya existen para este shift
      const existingShift = Array.isArray(shiftData) 
        ? shiftData.find(s => s.timeRange === `${shift.startTime} - ${shift.endTime}`)
        : null;
      
      const defaultCounts = [4, 4, 4, 4, 4, 4, 4];
      const currentCounts = existingShift ? existingShift.counts : defaultCounts;
      
      // Calcular la duración del turno en horas
      const shiftDurationHours = calculateShiftDurationInHours(
        shift.startTime, 
        shift.endTime, 
        shift.lunchBreakDeduction || 0
      );
      
      // Obtener las horas mínimas por quincena de las reglas
      const minBiweeklyHours = parseFloat(rules.minHoursPerTwoWeeks) || 80;
      
      // Calcular el número ideal de personal
      const idealNumber = calculateIdealPersonnel(
        currentCounts,
        shiftDurationHours,
        minBiweeklyHours
      );
      
      return {
        id: index + 1,
        name: `Shift ${index + 1}`,
        timeRange: `${shift.startTime} - ${shift.endTime}`,
        counts: currentCounts,
        idealNumber: idealNumber
      };
    });
    setShiftData(newShiftData);
  }, [shifts, rules.minHoursPerTwoWeeks]);

  // useEffect para recalcular cuando solo cambien las reglas
  const prevMinHoursRef = useRef(rules.minHoursPerTwoWeeks);
  
  useEffect(() => {
    // Solo actualizar si cambió específicamente minHoursPerTwoWeeks
    if (prevMinHoursRef.current !== rules.minHoursPerTwoWeeks && Array.isArray(shiftData) && shiftData.length > 0) {
      console.log("Recalculando idealNumber por cambio en minHoursPerTwoWeeks");
      
      setShiftData(prevShiftData => 
        Array.isArray(prevShiftData) ? prevShiftData.map(shift => {
          const shiftRef = shifts.find((_, index) => index + 1 === shift.id);
          if (!shiftRef) return shift;
          
          const shiftDurationHours = calculateShiftDurationInHours(
            shiftRef.startTime, 
            shiftRef.endTime, 
            shiftRef.lunchBreakDeduction || 0
          );
          
          const minBiweeklyHours = parseFloat(rules.minHoursPerTwoWeeks) || 80;
          
          const newIdealNumber = calculateIdealPersonnel(
            shift.counts,
            shiftDurationHours,
            minBiweeklyHours
          );
          
          return {
            ...shift,
            idealNumber: newIdealNumber
          };
        }) : []
      );
    }
    
    prevMinHoursRef.current = rules.minHoursPerTwoWeeks;
  }, [rules.minHoursPerTwoWeeks, shifts]);

  // Función para recalcular el idealNumber cuando cambian los counts
  const recalculateIdealNumber = (shiftId: string, newCounts: number[]) => {
    const shift = findShiftById(shiftId, shifts);
    if (!shift) return 0;
    
    const shiftDurationHours = calculateShiftDurationInHours(
      shift.startTime, 
      shift.endTime, 
      shift.lunchBreakDeduction || 0
    );
    
    const minBiweeklyHours = parseFloat(rules.minHoursPerTwoWeeks) || 80;
    
    return calculateIdealPersonnel(
      newCounts,
      shiftDurationHours,
      minBiweeklyHours
    );
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Calcular el total de empleados ideales sumando los idealNumber de todos los turnos
  // Validar que shiftData sea un array antes de usar reduce
  const totalIdealPersonnel = Array.isArray(shiftData) 
    ? shiftData.reduce((sum, shift) => sum + shift.idealNumber, 0)
    : 0;

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Ideal Number of Personnel per Shift and Day</h2>
      </div>

      {Array.isArray(shiftData) && shiftData.map((shift) => (
        <div key={shift.id} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {shift.name}: {shift.timeRange}
          </h3>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white">
                  <th className="px-4 py-3 text-center border-r border-gray-100 w-32">Day</th>
                  {days.map((day) => (
                    <th key={day} className="px-4 py-3 text-center border-r border-gray-100">
                      {day}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">
                    Ideal Number of Personnel
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-4 py-3 border-r border-gray-300 font-semibold text-center">Count</td>
                  {shift.counts.map((count, index) => (
                    <td key={index} className="px-4 py-3 border-r border-gray-300 text-center">
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => {
                          const newCounts = [...shift.counts];
                          const value = parseInt(e.target.value);
                          newCounts[index] = isNaN(value) || value < 0 ? 0 : value;
                          
                          // Recalcular el idealNumber con los nuevos counts
                          const newIdealNumber = recalculateIdealNumber(shift.id, newCounts);
                          
                          if (Array.isArray(shiftData)) {
                            const newShifts = shiftData.map(s => 
                              s.id === shift.id ? {...s, counts: newCounts, idealNumber: newIdealNumber} : s
                            );
                            setShiftData(newShifts);
                          }
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
        <span className="text-lg text-center">
          Total Number of Employees Needed to Meet Staffing Requirements Across All Shifts:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{totalIdealPersonnel.toFixed(2)}</span>
          <span className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center font-bold">!</span>
        </div>
      </div>
    </div>
  );
};

export default PersonnelTable;