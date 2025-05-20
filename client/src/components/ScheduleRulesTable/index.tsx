import React, { useMemo } from 'react';
import { useShiftContext } from '../../context/ShiftContext';
import { useRules } from '../../context/RulesContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';
import { useShiftPriorities } from '../../context/ShiftPrioritiesContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useSelectedEmployees } from '../../context/SelectedEmployeesContext';

// Componente simplificado que solo muestra lo esencial y con capacidad de ocultarse
const ScheduleRulesTable: React.FC = () => {
  const { shifts } = useShiftContext();
  const { rules } = useRules();
  const { shiftData } = usePersonnelData();
  const { getFormattedPriorities } = useShiftPriorities();
  const { getCurrentList } = useEmployeeLists();
  const { selectedEmployeeIds } = useSelectedEmployees();
  
  // Estado para controlar la visibilidad de la tabla - se guarda en localStorage
  const [isTableVisible, setIsTableVisible] = React.useState(
    localStorage.getItem('scheduleRulesTableVisible') !== 'false'
  );
  
  // Función para alternar la visibilidad del cuerpo de la tabla
  const toggleTableVisibility = () => {
    const newState = !isTableVisible;
    setIsTableVisible(newState);
    localStorage.setItem('scheduleRulesTableVisible', newState.toString());
  };

  // Filtramos empleados para mostrar solo los seleccionados
  const employees = useMemo(() => {
    const currentList = getCurrentList();
    if (!currentList) return [];
    
    const allEmployees = currentList.employees || [];
    if (!selectedEmployeeIds.length) return allEmployees;
    
    // Solo mostramos los empleados que estén seleccionados
    return allEmployees.filter(employee => selectedEmployeeIds.includes(employee.id));
  }, [getCurrentList, selectedEmployeeIds]);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule Rules Table</h2>
        <button 
          onClick={toggleTableVisibility}
          className={`px-4 py-2 rounded transition-colors ${!isTableVisible ? 'bg-yellow-500 text-black' : 'bg-white text-[#19b08d] hover:bg-gray-100'}`}
        >
          {!isTableVisible ? 'Show Schedule Rules Table' : 'Hide Schedule Rules Table'}
        </button>
      </div>

      {!isTableVisible ? (
        <div className="bg-yellow-100 p-4 rounded text-center text-black font-semibold border border-yellow-400">
          Schedule Rules Table is hidden. Press 'Show Schedule Rules Table' button to make it visible again
        </div>
      ) : (
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleRulesTable;