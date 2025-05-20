import React, { useState, useEffect } from 'react';
import { useRules } from '../../context/RulesContext';

const ScheduleRulesTable: React.FC = () => {
  const { rules } = useRules();
  
  // Estado para controlar la visibilidad de la tabla - se guarda en localStorage
  const [isTableVisible, setIsTableVisible] = useState(() => {
    // Intentamos recuperar el valor de localStorage, predeterminado a true si no existe
    try {
      const savedState = localStorage.getItem('scheduleRulesTableVisible');
      return savedState === null ? true : savedState === 'true';
    } catch (e) {
      return true; // Si hay algún error accediendo a localStorage, mostramos la tabla
    }
  });
  
  // Función para alternar la visibilidad de la tabla
  const toggleTableVisibility = () => {
    const newState = !isTableVisible;
    setIsTableVisible(newState);
    try {
      localStorage.setItem('scheduleRulesTableVisible', newState.toString());
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      {/* Encabezado de la tabla con botón para mostrar/ocultar */}
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule Rules Table</h2>
        <button 
          onClick={toggleTableVisibility}
          className={`px-4 py-2 rounded transition-colors ${!isTableVisible ? 'bg-yellow-500 text-black' : 'bg-white text-[#19b08d] hover:bg-gray-100'}`}
          data-es-show="Mostrar Tabla de Reglas de Horario"
          data-es-hide="Ocultar Tabla de Reglas de Horario"
        >
          {!isTableVisible ? 'Show Schedule Rules Table' : 'Hide Schedule Rules Table'}
        </button>
      </div>

      {/* Mostrar mensaje cuando la tabla está oculta */}
      {!isTableVisible ? (
        <div className="bg-yellow-100 p-4 rounded text-center text-black font-semibold border border-yellow-400">
          Schedule Rules Table is hidden. Press 'Show Schedule Rules Table' button to make it visible again
        </div>
      ) : (
        /* Tabla de reglas con los datos básicos */
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-50 text-left">Category</th>
                <th className="border px-4 py-2 bg-gray-50 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Start Date</td>
                <td className="border px-4 py-2">{rules.startDate}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">End Date</td>
                <td className="border px-4 py-2">{rules.endDate}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Maximum consecutive shifts:</td>
                <td className="border px-4 py-2">{rules.maxConsecutiveShifts}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum days off after max shifts:</td>
                <td className="border px-4 py-2">{rules.minDaysOffAfterMax}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum weekends off per month:</td>
                <td className="border px-4 py-2">{rules.minWeekendsOffPerMonth}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum rest hours between shifts:</td>
                <td className="border px-4 py-2">{rules.minRestHoursBetweenShifts}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum hours per week:</td>
                <td className="border px-4 py-2">{rules.minHoursPerWeek}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Minimum hours per two weeks:</td>
                <td className="border px-4 py-2">{rules.minHoursPerTwoWeeks}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleRulesTable;