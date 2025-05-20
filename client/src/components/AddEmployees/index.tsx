// src/components/AddEmployees/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import DatePickerModal from '../DatePickerModal';
import { useShiftContext } from '../../context/ShiftContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useRules } from '../../context/RulesContext';
import { useSelectedEmployees } from '../../context/SelectedEmployeesContext';
import BlockShiftModal from '../BlockShiftModal';
import AssignPermanentShiftsModal from '../AssignPermanentShiftsModal';
import PreferenceManager from '../PreferenceManager';
import LeaveModal from '../LeaveModal';
import { ChevronDown, AlertCircle, Loader2, Edit2 } from 'lucide-react';

// Interfaz Employee (Debe coincidir con la del contexto)
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  fixedShifts: { [day: string]: string[] };
  maxConsecutiveShifts: number;
  shiftPreferences: (number | null)[];
  leave: { id: string; startDate: string; endDate: string; leaveType: string; hoursPerDay: number }[];
  blockedShifts: { [shiftId: string]: string[] };
  notes: {
    confidential: string;
    aiRules: string;
  };
}

// Mantener el componente EditableField sin cambios, ya está funcional.
interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, onChange, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
  }, [value, isEditing]);

  const handleContainerClick = () => {
    if (isEditing) return;
    setShowConfirm(true);
    setIsClosing(false);
  };

  const handleConfirm = () => {
    setIsEditing(true);
    setIsClosing(true);
    setTimeout(() => {
      setShowConfirm(false);
      setIsClosing(false);
    }, 150);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowConfirm(false);
      setIsClosing(false);
    }, 150);
    setTempValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (tempValue !== value) {
        onChange(tempValue);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value);
    }
  };

  return (
    <div className="relative group cursor-pointer flex-1" onClick={handleContainerClick}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className={`w-full border border-gray-300 rounded px-3 py-1 min-w-0 ${className}`}
        />
      ) : (
        <div className="flex items-center hover:bg-gray-50 rounded px-2 py-1 w-full border border-gray-200">
          <span className="flex-1">{value}</span>
        </div>
      )}
      {showConfirm && (
        <div className="absolute z-10 top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className={`transition-opacity duration-150 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-sm mb-3">¿Desea editar este campo?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                className="px-2 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


interface BlockShiftModalState {
  isOpen: boolean;
  shift: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
  employeeIndex: number | null;
}

interface NewEmployeeForm {
  id: string;
  name: string;
  hireDate: string;
  email: string;
  phone: string;
}

const AddEmployees: React.FC = () => {
  const { shifts } = useShiftContext(); 
  const { getCurrentList, updateList } = useEmployeeLists();
  const { rules } = useRules();

  // Estado para controlar la visibilidad de la tabla de empleados
  const [isEmployeesTableHidden, setIsEmployeesTableHidden] = useState(() => {
    // Recuperar el estado guardado de localStorage o usar false (visible) como valor predeterminado
    const savedState = localStorage.getItem('employeesTableHidden');
    return savedState ? JSON.parse(savedState) : false;
  });

  // Definimos un estado local para rastrear el empleado list cargado
  const [employeeStateLoaded, setEmployeeStateLoaded] = useState(false);
  
  // Estado local para hacer caching de la lista actual para evitar re-renders continuos
  const [localEmployeeList, setLocalEmployeeList] = useState<any>(null);
  const [localEmployees, setLocalEmployees] = useState<any[]>([]);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Usar el contexto compartido para la selección de empleados
  const { selectedEmployeeIds, setSelectedEmployeeIds } = useSelectedEmployees();
  
  // Importar funciones del contexto de selección
  const { toggleEmployeeSelection, toggleAllEmployees } = useSelectedEmployees();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [leaveModalState, setLeaveModalState] = useState<{ isOpen: boolean; employeeIndex: number | null }>({
    isOpen: false,
    employeeIndex: null
  });
  const [assignShiftsModalState, setAssignShiftsModalState] = useState<{ isOpen: boolean; employeeIndex: number | null }>({
    isOpen: false,
    employeeIndex: null
  });
  const [newEmployee, setNewEmployee] = useState<NewEmployeeForm>({
    id: '',
    name: '',
    hireDate: '',
    email: '',
    phone: ''
  });

  const [modalState, setModalState] = useState<BlockShiftModalState>({
    isOpen: false,
    shift: null,
    employeeIndex: null
  });

  // Usamos useEffect una sola vez para cargar los datos iniciales
  useEffect(() => {
    if (!employeeStateLoaded) {
      const list = getCurrentList();
      if (list) {
        setLocalEmployeeList(list);
        setLocalEmployees(list.employees || []);
        setIsLoading(false);
        setEmployeeStateLoaded(true);
      }
    }
  }, [getCurrentList, employeeStateLoaded]);
  
  // Acceso directo para el código que necesita estas variables
  const currentEmployeeList = localEmployeeList;
  const employees = localEmployees;


  const formatDateInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleInputChange = (field: keyof NewEmployeeForm, value: string) => {
    setNewEmployee(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleAddEmployee = () => {
    if (!newEmployee.id || !newEmployee.name || !newEmployee.hireDate) {
      setFormError('Please fill in all required fields');
      return;
    }

    // Use current employees from context for validation
    if (employees.some(emp => emp.id === newEmployee.id)) {
      setFormError('An employee with this ID already exists');
      return;
    }
    
    // Seleccionar automáticamente el nuevo empleado
    setSelectedEmployeeIds(prev => [...prev, newEmployee.id]);

    // Create the new employee object with explicit defaults for optional fields
    const employeeToAdd: Employee = {
      id: newEmployee.id,
      name: newEmployee.name,
      email: newEmployee.email || '', // Ensure empty string if null/undefined
      phone: newEmployee.phone || '', // Ensure empty string if null/undefined
      hireDate: newEmployee.hireDate,
      // Default values for the new employee, consistent with Employee interface
      fixedShifts: {},
      maxConsecutiveShifts: parseInt(rules.maxConsecutiveShifts) || 5, // Use global rules
      shiftPreferences: Array(shifts.length).fill(null), // Initialize with correct size
      leave: [],
      blockedShifts: {},
      notes: {
        confidential: '',
        aiRules: ''
      }
    };

    if (currentEmployeeList) {
      // Crea un nuevo array con el empleado añadido
      const employeesWithNew = [...employees, employeeToAdd];

      // Realizar una copia profunda del array de empleados
      const updatedEmployeesDeepCopy = JSON.parse(JSON.stringify(employeesWithNew));

      // Actualizar también el estado local para evitar problemas de sincronización
      setLocalEmployees(updatedEmployeesDeepCopy);

      // Debug - puede eliminarse en producción
      console.log("Antes de actualizar (AddEmployees):", employees.length, "empleados");
      console.log("Nuevo empleado a añadir:", employeeToAdd);
      console.log("Array de empleados con copia profunda:", updatedEmployeesDeepCopy.length, "empleados");

      // Actualizar el contexto con el array copiado profundamente
      updateList(currentEmployeeList.id, { employees: updatedEmployeesDeepCopy });

      // Debug - puede eliminarse en producción
      console.log("Llamada a updateList con:", updatedEmployeesDeepCopy.length, "empleados");

      // Limpiar el formulario
      setNewEmployee({ id: '', name: '', hireDate: '', email: '', phone: '' });
      setFormError(null);
    }
  };

  // Keep the updateEmployeeProperty function - it uses shallow copies which is standard for object updates
  const updateEmployeeProperty = (employeeIndex: number, property: keyof Employee, value: any) => {
    if (currentEmployeeList) {
      const updatedEmployees = employees.map((emp, idx) => 
        idx === employeeIndex ? { ...emp, [property]: value } : emp
      );
       // You might consider a deep copy here too if issues persist with inline editing,
       // but standard practice often uses shallow copies for property updates.
      updateList(currentEmployeeList.id, { employees: updatedEmployees });
    }
  };

  // Keep updateEmployeeNoteProperty - uses shallow copies
  const updateEmployeeNoteProperty = (employeeIndex: number, noteType: keyof Employee['notes'], value: string) => {
    if (currentEmployeeList) {
      const updatedEmployees = employees.map((emp, idx) => 
        idx === employeeIndex ? { ...emp, notes: { ...emp.notes, [noteType]: value } } : emp
      );
      updateList(currentEmployeeList.id, { employees: updatedEmployees });
    }
  };

  // Keep handleRemoveEmployee - uses filter which returns a new array
  const handleRemoveEmployee = (employeeId: string) => {
    if (currentEmployeeList) {
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      updateList(currentEmployeeList.id, { employees: updatedEmployees });
    }
  };

  const handleBlockClick = (employeeIndex: number, shift: { id: string; startTime: string; endTime: string }) => {
    setModalState({
      isOpen: true,
      shift,
      employeeIndex
    });
  };

  const handleSaveBlockedDays = (days: string[]) => {
    if (modalState.employeeIndex === null || !modalState.shift || !currentEmployeeList) return;

    const employeeIndex = modalState.employeeIndex;
    const shiftId = modalState.shift.id;

    const updatedEmployees = employees.map((emp, idx) => {
      if (idx === employeeIndex) {
        const newBlockedShifts = { ...emp.blockedShifts };
        if (days.length === 0) {
          delete newBlockedShifts[shiftId];
        } else {
          newBlockedShifts[shiftId] = days;
        }
        return { ...emp, blockedShifts: newBlockedShifts };
      }
      return emp;
    });
    updateList(currentEmployeeList.id, { employees: updatedEmployees }); // Standard shallow update
  };

  const handlePreferencesChange = (employeeIndex: number, newPreferences: (number | null)[]) => {
    updateEmployeeProperty(employeeIndex, 'shiftPreferences', newPreferences); // Standard shallow update
  };

  const handleAddLeave = (employeeIndex: number, leaveData: { startDate: string; endDate: string; type: string; hoursPerDay: number }) => {
    if (currentEmployeeList) {
      const newLeaveEntry = { ...leaveData, id: crypto.randomUUID(), leaveType: leaveData.type };
      const employeeToUpdate = employees[employeeIndex];
      const updatedLeave = [...(employeeToUpdate.leave || []), newLeaveEntry];
      updateEmployeeProperty(employeeIndex, 'leave', updatedLeave); // Standard shallow update
    }
  };

  const handleSaveFixedShifts = (fixedShifts: { [day: string]: string[] }) => {
    if (assignShiftsModalState.employeeIndex === null || !currentEmployeeList) return;
    updateEmployeeProperty(assignShiftsModalState.employeeIndex, 'fixedShifts', fixedShifts); // Standard shallow update
  };
  
  // Estas funciones ahora vienen del contexto de SelectedEmployees

  if (isLoading && employees.length === 0 && !currentEmployeeList) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p>Loading employee data...</p>
      </div>
    );
  }

  if (!currentEmployeeList) {
    return (
        <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">No employee list is currently selected or available.</p>
            <p className="text-sm text-gray-600">Please select or create an employee list.</p>
        </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Add Employees</h2>
        <button
          id="toggle-employees-table"
          className={`px-4 py-2 rounded transition-colors ${isEmployeesTableHidden ? 'bg-[#ffd700] text-black' : 'bg-white text-[#19b08d] hover:bg-gray-100'}`}
          onClick={() => {
            const newState = !isEmployeesTableHidden;
            setIsEmployeesTableHidden(newState);
            localStorage.setItem('employeesTableHidden', JSON.stringify(newState));
          }}
          data-en-show="Show Employees Table" data-en-hide="Hide Employees Table"
          data-es-show="Mostrar Tabla de Empleados" data-es-hide="Ocultar Tabla de Empleados"
        >
          {isEmployeesTableHidden ? 'Show Employees Table' : 'Hide Employees Table'}
        </button>
      </div>

      {isEmployeesTableHidden && (
        <div className="bg-[#ffd700] border border-gray-300 text-black text-center py-4 px-2 rounded mb-4">
          <span className="table-hidden-message font-bold">
            Employees Table is hidden. Press 'Show Employees Table' button to make it visible again
          </span>
        </div>
      )}

      {!isEmployeesTableHidden && (
        <>
          <div className="space-y-4 mb-8">
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{formError}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter employee ID"
                  value={newEmployee.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={newEmployee.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hire Date <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={newEmployee.hireDate}
                    onChange={(e) => handleInputChange('hireDate', formatDateInput(e.target.value))}
                    className="w-full border border-gray-300 rounded-l px-3 py-2"
                  />
                  <button 
                    onClick={() => setIsDatePickerOpen(true)}
                    className="bg-gray-200 border-t border-r border-b border-gray-300 rounded-r px-3 py-2"
                  >
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmployee.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={newEmployee.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddEmployee}
                  className="bg-[#19b08d] text-white px-4 py-2 rounded hover:bg-[#117cee] transition-colors w-full"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                {/* Loader row based on loading state and employee count */}
                <tr>
                  <th className="py-2 px-4 text-left border-b">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={employees.length > 0 && selectedEmployeeIds.length === employees.length}
                        onChange={() => toggleAllEmployees(employees.map(emp => emp.id))}
                        className="mr-2"
                      />
                      ID
                    </div>
                  </th>
                  <th className="py-2 px-4 text-left border-b">Name</th>
                  <th className="py-2 px-4 text-left border-b">Email / Phone</th>
                  <th className="py-2 px-4 text-left border-b">Hire Date</th>
                  <th className="py-2 px-4 text-left border-b">Shift Preferences</th>
                  <th className="py-2 px-4 text-left border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedEmployeeIds.includes(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                          className="mr-2"
                        />
                        <EditableField
                          value={employee.id}
                          onChange={(value) => {
                            // You might want to disable ID editing or add validation here
                            updateEmployeeProperty(index, 'id', value);
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <EditableField
                        value={employee.name}
                        onChange={(value) => updateEmployeeProperty(index, 'name', value)}
                      />
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="space-y-2">
                        <EditableField
                          value={employee.email}
                          onChange={(value) => updateEmployeeProperty(index, 'email', value)}
                          className="text-xs"
                        />
                        <EditableField
                          value={employee.phone}
                          onChange={(value) => updateEmployeeProperty(index, 'phone', value)}
                          className="text-xs"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <EditableField
                        value={employee.hireDate}
                        onChange={(value) => updateEmployeeProperty(index, 'hireDate', value)}
                      />
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="space-y-2">
                        <PreferenceManager
                          preferences={employee.shiftPreferences}
                          shifts={shifts}
                          onChange={(newPreferences) => handlePreferencesChange(index, newPreferences)}
                        />
                        <div className="flex items-center justify-between text-xs mt-1">
                          <button
                            onClick={() => handleBlockClick(index, shifts[0])}
                            className="text-red-600 hover:text-red-800"
                          >
                            Block Shifts
                          </button>
                          <button
                            onClick={() => setLeaveModalState({ isOpen: true, employeeIndex: index })}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Add Leave
                          </button>
                          <button
                            onClick={() => setAssignShiftsModalState({ isOpen: true, employeeIndex: index })}
                            className="text-green-600 hover:text-green-800"
                          >
                            Fix Shifts
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleRemoveEmployee(employee.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                        <div className="relative group">
                          <button className="text-gray-600 hover:text-gray-800">
                            <ChevronDown className="h-5 w-5" />
                          </button>
                          <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                            <div className="py-1">
                              <a
                                href="#"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log('View employee details:', employee);
                                }}
                              >
                                View Details
                              </a>
                              <a
                                href="#"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log('Edit employee:', employee);
                                }}
                              >
                                Edit Information
                              </a>
                              <a
                                href="#"
                                className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveEmployee(employee.id);
                                }}
                              >
                                Delete Employee
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No employees added yet. Fill the form above to add your first employee.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modales */}
      <BlockShiftModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, shift: null, employeeIndex: null })}
        employeeName={modalState.employeeIndex !== null && employees[modalState.employeeIndex] ? employees[modalState.employeeIndex].name : 'Employee'}
        shift={modalState.shift!}
        onSave={handleSaveBlockedDays}
      />
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={(date) => {
          handleInputChange('hireDate', date);
          setIsDatePickerOpen(false);
        }} 
      />
      {leaveModalState.employeeIndex !== null && employees[leaveModalState.employeeIndex] && (
        <LeaveModal
          isOpen={leaveModalState.isOpen}
          onClose={() => setLeaveModalState({ isOpen: false, employeeIndex: null })}
          employeeName={employees[leaveModalState.employeeIndex].name}
          onSave={(leave) => {
            if (leaveModalState.employeeIndex !== null) {
              handleAddLeave(leaveModalState.employeeIndex, leave);
            }
          }}
        />
      )}
      {assignShiftsModalState.employeeIndex !== null && employees[assignShiftsModalState.employeeIndex] && (
        <AssignPermanentShiftsModal
          isOpen={assignShiftsModalState.isOpen}
          onClose={() => setAssignShiftsModalState({ isOpen: false, employeeIndex: null })}
          employeeName={employees[assignShiftsModalState.employeeIndex].name}
          shifts={shifts} // Assuming shifts are available
          initialFixedShifts={employees[assignShiftsModalState.employeeIndex].fixedShifts}
          onSave={handleSaveFixedShifts}
        />
      )}
    </div>
  );
};

export default AddEmployees;