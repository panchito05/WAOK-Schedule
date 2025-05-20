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
  const { getCurrentList, updateList } = useEmployeeLists();
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
  
  // Get employee selection data from currentList or initialize if not exists
  useEffect(() => {
    const currentList = getCurrentList();
    if (currentList) {
      // Initialize specialRules and employeeSelections if they don't exist
      if (!currentList.specialRules) {
        updateList(currentList.id, {
          specialRules: {
            employeeSelections: {}
          }
        });
      } else if (!currentList.specialRules.employeeSelections) {
        const updatedSpecialRules = {
          ...currentList.specialRules,
          employeeSelections: {}
        };
        updateList(currentList.id, {
          specialRules: updatedSpecialRules
        });
      }
    }
  }, [getCurrentList, updateList]);
  
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
  
  // Obtener la duración del turno seleccionado
  const getShiftDuration = (shiftId: string): string => {
    if (!shiftId) return "N/A";
    
    const shiftIndex = parseInt(shiftId.replace('shift_', '')) - 1;
    if (shiftIndex >= 0 && shiftIndex < shifts.length) {
      return shifts[shiftIndex].duration || "N/A";
    }
    return "N/A";
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
              id={`special-btn-${columnIndex + 1}`}
              onClick={() => handleSelectEmployees(columnIndex)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
            >
              Select Employees
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
                    {getCurrentList()?.employees.map((employee, index) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{index + 1}.</td>
                        <td className="p-2">
                          <input 
                            type="checkbox" 
                            id={`employee-${employee.id}`}
                            value={employee.id}
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={(e) => handleCheckboxChange(employee.id, e.target.checked)}
                            className="h-5 w-5"
                          />
                        </td>
                        <td className="p-2">
                          <label htmlFor={`employee-${employee.id}`} className="cursor-pointer">
                            {employee.name}
                          </label>
                        </td>
                        <td className="p-2 text-gray-600">{employee.id}</td>
                      </tr>
                    ))}
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