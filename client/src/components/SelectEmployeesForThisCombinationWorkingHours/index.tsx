import React, { useState, useEffect, useRef } from 'react';
import { useShiftContext } from '../../context/ShiftContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { X as XIcon } from 'lucide-react';

interface ShiftSelection {
  shiftId: string;
  count: number;
}

interface Column {
  topShift: ShiftSelection;
  bottomShift: ShiftSelection;
}

interface EmployeeSelection {
  [key: string]: string[]; // buttonId -> array of employee uniqueIds
}

const SelectEmployeesForThisCombinationWorkingHours: React.FC = () => {
  const { shifts } = useShiftContext();
  const { getCurrentList, updateList, refreshTrigger } = useEmployeeLists();
  
  // Usar un valor inicial por defecto para evitar llamar a getCurrentList durante la inicialización
  const [columns, setColumns] = useState<Column[]>([
    { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } },
    { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } },
    { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } }
  ]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentButtonId, setCurrentButtonId] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  
  // Efecto para cargar los datos una sola vez cuando el componente se monta
  useEffect(() => {
    // Si ya se inicializó, no hacemos nada
    if (initialized.current) return;
    
    const currentList = getCurrentList();
    if (!currentList) return;
    
    // Cargar datos de columnas desde localStorage
    try {
      const storedColumnsJSON = localStorage.getItem(`shiftColumns_${currentList.id}`);
      if (storedColumnsJSON) {
        const parsedColumns = JSON.parse(storedColumnsJSON);
        setColumns(parsedColumns);
      }
    } catch (e) {
      console.error('Error parsing stored columns:', e);
    }
    
    // Marcar como inicializado
    initialized.current = true;
  }, []);

  // useEffect para actualizar las columnas cuando cambie la lista (refreshTrigger)
  useEffect(() => {
    if (!initialized.current) return;
    
    const currentList = getCurrentList();
    if (!currentList) return;
    
    // Cargar datos de columnas desde localStorage para la nueva lista
    try {
      const storedColumnsJSON = localStorage.getItem(`shiftColumns_${currentList.id}`);
      if (storedColumnsJSON) {
        const parsedColumns = JSON.parse(storedColumnsJSON);
        setColumns(parsedColumns);
      } else {
        // Si no hay datos guardados para esta lista, usar valores por defecto
        setColumns([
          { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } },
          { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } },
          { topShift: { shiftId: '', count: 0 }, bottomShift: { shiftId: '', count: 0 } }
        ]);
      }
    } catch (e) {
      console.error('Error parsing stored columns:', e);
    }
  }, [refreshTrigger, getCurrentList]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeEmployeeSelectionModal();
      }
    };
    
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Función para guardar el estado de las columnas en localStorage
  const saveColumnsToLocalStorage = (newColumns: Column[]) => {
    const currentList = getCurrentList();
    if (currentList && newColumns.some(col => col.topShift.shiftId || col.bottomShift.shiftId)) {
      try {
        localStorage.setItem(`shiftColumns_${currentList.id}`, JSON.stringify(newColumns));
      } catch (e) {
        console.error('Error saving columns to localStorage:', e);
      }
    }
  };

  const handleShiftChange = (columnIndex: number, position: 'top' | 'bottom', shiftId: string) => {
    // Verificar si hay empleados asignados a esta combinación antes de cambiar
    const currentList = getCurrentList();
    const buttonId = `special-btn-${columnIndex + 1}`;
    
    // Verificar si hay empleados asignados a esta combinación
    const hasAssignedEmployees = currentList?.specialRules?.employeeSelections?.[buttonId]?.length > 0;
    
    if (hasAssignedEmployees) {
      const confirmChange = window.confirm(
        "Esta combinación ya tiene empleados asignados. Si cambias el turno, podrías crear conflictos. ¿Deseas continuar?"
      );
      if (!confirmChange) return;
    }
    
    setColumns(prev => {
      const newColumns = [...prev];
      
      // No hacemos nada si se intenta seleccionar el mismo turno arriba y abajo
      // La validación se hará en el renderizado de las opciones
      
      // Actualizar el turno seleccionado
      if (position === 'top') {
        newColumns[columnIndex].topShift.shiftId = shiftId;
      } else {
        newColumns[columnIndex].bottomShift.shiftId = shiftId;
      }
      
      // Guardar en localStorage después de actualizar
      saveColumnsToLocalStorage(newColumns);
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
      
      // Guardar en localStorage después de actualizar
      saveColumnsToLocalStorage(newColumns);
      return newColumns;
    });
  };
  
  // Obtener la duración del turno seleccionado
  const getShiftDuration = (shiftId: string): string => {
    if (!shiftId) return "N/A";
    
    // Buscar el turno por ID directo
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.duration || "N/A";
  };
  
  // Función para convertir la duración del turno de formato "8h 0m" a horas decimales
  const durationToHours = (duration: string): number => {
    if (duration === "N/A") return 0;
    
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };
  
  // Calcular el total de horas para una columna
  const calculateTotalHours = (column: Column): number => {
    const topShiftDuration = durationToHours(getShiftDuration(column.topShift.shiftId));
    const bottomShiftDuration = durationToHours(getShiftDuration(column.bottomShift.shiftId));
    
    return (topShiftDuration * column.topShift.count) + (bottomShiftDuration * column.bottomShift.count);
  };
  
  // Verificar si un empleado ya está seleccionado en otro botón
  const isEmployeeSelectedInOtherButton = (employeeId: string): {isSelected: boolean, buttonName?: string} => {
    const currentList = getCurrentList();
    if (!currentList || !currentList.specialRules?.employeeSelections) return {isSelected: false};
    
    const allSelections = currentList.specialRules.employeeSelections;
    const buttonIds = Object.keys(allSelections).filter(id => id !== currentButtonId);
    
    for (const buttonId of buttonIds) {
      if (allSelections[buttonId]?.includes(employeeId)) {
        // Extraer el número de botón para mostrar en qué combinación está seleccionado
        const buttonNumber = buttonId.replace('special-btn-', '');
        return {
          isSelected: true,
          buttonName: `Combinación ${buttonNumber}`
        };
      }
    }
    
    return {isSelected: false};
  };

  const handleSelectEmployees = (columnIndex: number) => {
    const column = columns[columnIndex];
    console.log(`Selecting employees for column ${columnIndex + 1}:`, column);
    
    const buttonId = `special-btn-${columnIndex + 1}`;
    setCurrentButtonId(buttonId);
    
    // Get topShift and bottomShift durations
    const topShiftDuration = getShiftDuration(column.topShift.shiftId);
    const bottomShiftDuration = getShiftDuration(column.bottomShift.shiftId);
    
    const currentList = getCurrentList();
    const allEmployees = currentList?.employees || [];
    
    // Get previously selected employees for this button
    let preSelectedEmployees: string[] = [];
    if (currentList?.specialRules?.employeeSelections && 
        currentList.specialRules.employeeSelections[buttonId]) {
      preSelectedEmployees = currentList.specialRules.employeeSelections[buttonId];
    }
    
    setSelectedEmployees(preSelectedEmployees);
    
    // Set modal title with shift durations and selected count
    setModalTitle(`Select Employees For This Combination Working Hours: ${topShiftDuration} + ${bottomShiftDuration} (Seleccionados: ${preSelectedEmployees.length}/${allEmployees.length})`);
    
    // Open the modal
    setIsModalOpen(true);
  };

  // Función para actualizar el contador de empleados seleccionados en el título del modal
  const updateModalTitle = (selectedCount: number) => {
    const currentList = getCurrentList();
    const allEmployees = currentList?.employees || [];
    
    const columnIndex = parseInt(currentButtonId.replace('special-btn-', '')) - 1;
    if (columnIndex >= 0 && columnIndex < columns.length) {
      const column = columns[columnIndex];
      const topShiftDuration = getShiftDuration(column.topShift.shiftId);
      const bottomShiftDuration = getShiftDuration(column.bottomShift.shiftId);
      
      setModalTitle(`Select Employees For This Combination Working Hours: ${topShiftDuration} + ${bottomShiftDuration} (Seleccionados: ${selectedCount}/${allEmployees.length})`);
    }
  };
  
  // Función para manejar el cambio de selección en los checkboxes
  const handleCheckboxChange = (employeeId: string, checked: boolean) => {
    let updatedSelection: string[];
    
    if (checked) {
      // Agregar empleado a la selección
      updatedSelection = [...selectedEmployees, employeeId];
    } else {
      // Quitar empleado de la selección
      updatedSelection = selectedEmployees.filter(id => id !== employeeId);
    }
    
    setSelectedEmployees(updatedSelection);
    updateModalTitle(updatedSelection.length);
  };
  
  // Función para guardar la selección de empleados
  const saveEmployeeSelection = () => {
    const currentList = getCurrentList();
    if (!currentList || !currentButtonId) return;
    
    // Preparar el objeto de selecciones de empleados
    const currentSelections = currentList.specialRules?.employeeSelections || {};
    const updatedSelections = {
      ...currentSelections,
      [currentButtonId]: selectedEmployees
    };
    
    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem(`employeeSelections_${currentList.id}`, JSON.stringify(updatedSelections));
    } catch (e) {
      console.error('Error saving employee selections to localStorage:', e);
    }
    
    // Actualizar la lista con las nuevas selecciones
    if (currentList.specialRules) {
      const updatedSpecialRules = {
        ...currentList.specialRules,
        employeeSelections: updatedSelections
      };
      
      updateList(currentList.id, {
        specialRules: updatedSpecialRules
      });
    } else {
      updateList(currentList.id, {
        specialRules: {
          employeeSelections: updatedSelections
        }
      });
    }
    
    // Cerrar el modal y mostrar confirmación
    closeEmployeeSelectionModal();
    alert("Employee selection saved!");
  };
  
  // Función para cerrar el modal
  const closeEmployeeSelectionModal = () => {
    setIsModalOpen(false);
    setCurrentButtonId('');
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Select Employees For This Combination Working Hours</h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-full">
                <select
                  value={column.topShift.shiftId}
                  onChange={(e) => handleShiftChange(columnIndex, 'top', e.target.value)}
                  className="flex-1 w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select Shift</option>
                  {shifts.map((shift, index) => {
                    const shiftId = `uid_${Math.random().toString(36).substr(2, 15)}`;
                    const isDisabled = column.bottomShift.shiftId === shiftId;
                    return (
                      <option 
                        key={index} 
                        value={shiftId} 
                        disabled={isDisabled}
                        className={isDisabled ? "text-gray-400" : ""}
                      >
                        {shift.startTime} - {shift.endTime}
                      </option>
                    );
                  })}
                </select>
                {column.bottomShift.shiftId && column.topShift.shiftId === column.bottomShift.shiftId && (
                  <div className="text-red-500 text-xs mt-1">No se puede seleccionar el mismo turno en ambas posiciones</div>
                )}
              </div>
              <input
                type="number"
                min="0"
                value={column.topShift.count}
                onChange={(e) => handleCountChange(columnIndex, 'top', parseInt(e.target.value) || 0)}
                className="w-16 border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-full">
                <select
                  value={column.bottomShift.shiftId}
                  onChange={(e) => handleShiftChange(columnIndex, 'bottom', e.target.value)}
                  className="flex-1 w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select Shift</option>
                  {shifts.map((shift, index) => {
                    const shiftId = `uid_${Math.random().toString(36).substr(2, 15)}`;
                    const isDisabled = column.topShift.shiftId === shiftId;
                    return (
                      <option 
                        key={index} 
                        value={shiftId} 
                        disabled={isDisabled}
                        className={isDisabled ? "text-gray-400" : ""}
                      >
                        {shift.startTime} - {shift.endTime}
                      </option>
                    );
                  })}
                </select>
                {column.topShift.shiftId && column.topShift.shiftId === column.bottomShift.shiftId && (
                  <div className="text-red-500 text-xs mt-1">No se puede seleccionar el mismo turno en ambas posiciones</div>
                )}
              </div>
              <input
                type="number"
                min="0"
                value={column.bottomShift.count}
                onChange={(e) => handleCountChange(columnIndex, 'bottom', parseInt(e.target.value) || 0)}
                className="w-16 border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <button
              id={`special-btn-${columnIndex + 1}`}
              onClick={() => handleSelectEmployees(columnIndex)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-semibold flex justify-between items-center"
            >
              <span>Select Employees</span>
              <span className="bg-blue-700 px-2 py-1 rounded-md ml-2 font-bold whitespace-nowrap">
                {calculateTotalHours(column).toFixed(1)}h
              </span>
            </button>
          </div>
        ))}
      </div>
      
      {/* Modal de selección de empleados */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div 
            id="select-employees-modal"
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[80vh] flex flex-col"
          >
            <div className="modal-header flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">{modalTitle}</h2>
              <button 
                onClick={closeEmployeeSelectionModal}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              <div id="employee-checkbox-list" className="space-y-2">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left w-12">#</th>
                      <th className="p-2 text-left">Select</th>
                      <th className="p-2 text-left">Employee</th>
                      <th className="p-2 text-left">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentList()?.employees.map((employee, index) => {
                      // Verificar si el empleado está seleccionado en otro botón
                      const { isSelected, buttonName } = isEmployeeSelectedInOtherButton(employee.id);
                      
                      return (
                        <tr key={employee.id} className={`border-b ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                          <td className="p-2">{index + 1}.</td>
                          <td className="p-2">
                            <input 
                              type="checkbox" 
                              id={`employee-${employee.id}`}
                              value={employee.id}
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={(e) => handleCheckboxChange(employee.id, e.target.checked)}
                              disabled={isSelected}
                              className={`h-5 w-5 ${isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </td>
                          <td className="p-2">
                            <label htmlFor={`employee-${employee.id}`} className={`${isSelected ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}>
                              {employee.name}
                              {isSelected && (
                                <span className="ml-2 text-xs text-red-500 font-semibold">
                                  (Ya asignado en {buttonName})
                                </span>
                              )}
                            </label>
                          </td>
                          <td className="p-2 text-gray-600">{employee.id}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end gap-4">
              <button 
                onClick={closeEmployeeSelectionModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                id="save-employee-selection-btn"
                onClick={saveEmployeeSelection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectEmployeesForThisCombinationWorkingHours;