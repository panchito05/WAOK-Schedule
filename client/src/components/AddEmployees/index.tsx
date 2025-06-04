// src/components/AddEmployees/index.tsx - CODIGO CON LA SOLUCION aplicando la copia profunda
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import DatePickerModal from '../DatePickerModal';
import { useShiftContext } from '../../context/ShiftContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext'; // Correcto
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
  notes: {
    confidential: string;
    aiRules: string;
  };
  blockedShifts?: { 
    [shiftId: string]: {
      blockedDays: string[];
      isActive: boolean;
    }
  };
}

// CompleteModalData interface removed

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
          className={`w-full border border-gray-300 rounded px-3 py-1 min-w-0 min-h-[32px] bg-white ${className}`}
        />
      ) : (
        <div className="flex items-center hover:bg-gray-50 rounded px-2 py-1 w-full border border-gray-200 min-h-[32px] bg-white">
          <span className="flex-1">{value || '\u00A0'}</span>
        </div>
      )}
      {showConfirm && (
        <div className="absolute z-10 top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-5 min-w-[400px] w-full">
          <div className={`transition-opacity duration-150 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-row items-center justify-between gap-6 whitespace-nowrap">
              <span className="text-sm flex-shrink-0">¿Desea editar este campo?</span>
              <div className="flex flex-row gap-3 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                  className="px-4 py-2 text-sm bg-green-500 text-white hover:bg-green-600 rounded whitespace-nowrap"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




interface NewEmployeeForm {
  id: string;
  name: string;
  hireDate: string;
  email: string;
  phone: string;
}

const AddEmployees: React.FC = () => {
  const { shifts } = useShiftContext(); 
  const { getCurrentList, updateList, refreshTrigger } = useEmployeeLists();
  const { rules } = useRules();
  
  // Estado para controlar la visibilidad de la tabla (igual que ScheduleRulesTable)
  const [isTableBodyHidden, setIsTableBodyHidden] = useState(() => {
    const savedState = localStorage.getItem('employeesTableHidden');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  // Función para alternar la visibilidad
  const toggleTableBody = () => {
    const newState = !isTableBodyHidden;
    setIsTableBodyHidden(newState);
    localStorage.setItem('employeesTableHidden', JSON.stringify(newState));
  };
  
  // useEffect para estilos dinámicos (igual que ScheduleRulesTable)
  useEffect(() => {
    const addEmployeesTableElement = document.querySelector('.add-employees-table');
    if (addEmployeesTableElement) {
      if (isTableBodyHidden) {
        addEmployeesTableElement.classList.add('table-hidden');
      } else {
        addEmployeesTableElement.classList.remove('table-hidden');
      }
    }
  }, [isTableBodyHidden]);

  // Eliminar llamada a getCurrentList de aquí - es parte del problema
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

  // Block shift modal state
  const [blockShiftModalState, setBlockShiftModalState] = useState<{
    isOpen: boolean;
    employeeIndex: number | null;
    employeeName: string;
    shiftId: string;
    shiftTime: string;
    currentBlockedDays: string[];
  }>({
    isOpen: false,
    employeeIndex: null,
    employeeName: '',
    shiftId: '',
    shiftTime: '',
    currentBlockedDays: []
  });

  // Estado independiente para el checkbox maestro
  const [masterCheckboxState, setMasterCheckboxState] = useState(true);

  // Función personalizada para manejar el checkbox maestro
  const handleMasterCheckboxChange = () => {
    if (masterCheckboxState) {
      // Si está marcado, deseleccionar todos y desmarcar el maestro
      setSelectedEmployeeIds([]);
      setMasterCheckboxState(false);
    } else {
      // Si no está marcado, seleccionar todos y marcar el maestro
      const allEmployeeIds = employees.map(emp => emp.id);
      setSelectedEmployeeIds(allEmployeeIds);
      setMasterCheckboxState(true);
    }
  };

  // Usamos useEffect una sola vez para cargar los datos iniciales
  useEffect(() => {
    if (!employeeStateLoaded) {
      const list = getCurrentList();
      if (list) {
        setLocalEmployeeList(list);
        setLocalEmployees(list.employees || []);
        setIsLoading(false);
        setEmployeeStateLoaded(true);
        
        // Seleccionar todos los empleados por defecto cuando se carga la lista por primera vez
        if (list.employees && list.employees.length > 0) {
          const allEmployeeIds = list.employees.map(emp => emp.id);
          setSelectedEmployeeIds(allEmployeeIds);
          setMasterCheckboxState(true);
        } else {
          setMasterCheckboxState(false);
        }
      }
    }
  }, [getCurrentList, employeeStateLoaded, setSelectedEmployeeIds]);

  // useEffect para actualizar automáticamente cuando cambie la lista (refreshTrigger)
  useEffect(() => {
    if (employeeStateLoaded) {
      const list = getCurrentList();
      if (list) {
        const previousEmployeeIds = localEmployees.map(emp => emp.id).sort().join(',');
        const newEmployeeIds = (list.employees || []).map(emp => emp.id).sort().join(',');
        
        // Solo actualizar si la lista de empleados realmente cambió
        if (previousEmployeeIds !== newEmployeeIds) {
          setLocalEmployeeList(list);
          setLocalEmployees(list.employees || []);
          
          // Solo auto-seleccionar cuando la lista de empleados cambió realmente
          if (list.employees && list.employees.length > 0) {
            const allEmployeeIds = list.employees.map(emp => emp.id);
            setSelectedEmployeeIds(allEmployeeIds);
            setMasterCheckboxState(true);
          } else {
            // Si no hay empleados, limpiar la selección
            setSelectedEmployeeIds([]);
            setMasterCheckboxState(false);
          }
        } else {
          // Si la lista es la misma, solo actualizar los datos sin cambiar la selección
          setLocalEmployeeList(list);
          setLocalEmployees(list.employees || []);
        }
      }
    }
  }, [refreshTrigger, getCurrentList, employeeStateLoaded, setSelectedEmployeeIds, localEmployees]);
  
  // useEffect para sincronizar el estado del checkbox maestro cuando todos los empleados son deseleccionados manualmente
  useEffect(() => {
    if (localEmployees.length > 0 && selectedEmployeeIds.length === 0) {
      setMasterCheckboxState(false);
    }
  }, [selectedEmployeeIds, localEmployees.length]);
  
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
      shiftPreferences: Array(shifts && shifts.length > 0 ? shifts.length : 3).fill(null), // Initialize with correct size (use 3 default shifts if none exist)
      leave: [],
      // blockedShifts: {}, // REMOVED: Block shift functionality eliminated
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
      console.log('🔧 [ARCHITECT-AI DEBUG] updateEmployeeProperty called:', {
        employeeIndex,
        property,
        value,
        employee: employees[employeeIndex]?.name,
        currentListId: currentEmployeeList.id
      });
      
      const updatedEmployees = employees.map((emp, idx) => 
        idx === employeeIndex ? { ...emp, [property]: value } : emp
      );
      
      console.log('🔧 [ARCHITECT-AI DEBUG] Employee after update:', updatedEmployees[employeeIndex]);
      console.log('🔧 [ARCHITECT-AI DEBUG] About to call updateList with:', { listId: currentEmployeeList.id, employees: updatedEmployees });
      
       // You might consider a deep copy here too if issues persist with inline editing,
       // but standard practice often uses shallow copies for property updates.
      updateList(currentEmployeeList.id, { employees: updatedEmployees });
      
      console.log('🔧 [ARCHITECT-AI DEBUG] updateEmployeeProperty completed successfully');
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

   // Keep other handler functions (handleBlockClick, handleSaveBlockedDays, etc.)
   // as they correctly update specific parts of the employee object and then call updateList.
   // If deep copy is needed for these updates too based on your diagnosis,
   // you would apply similar JSON.parse(JSON.stringify(...)) before updateList calls.

  // Función para guardar los días bloqueados
  const handleSaveBlockedShift = (employeeIndex: number, shiftId: string, blockedDays: string[]) => {
    if (currentEmployeeList) {
      console.log('🔧 [ARCHITECT-AI DEBUG] handleSaveBlockedShift called with:', { employeeIndex, shiftId, blockedDays });
      
      const employee = employees[employeeIndex];
      const currentBlockedShifts = employee.blockedShifts || {};
      
      // Si no hay días seleccionados, desactivar el bloqueo
      const isActive = blockedDays.length > 0;
      
      const updatedBlockedShifts = {
        ...currentBlockedShifts,
        [shiftId]: {
          blockedDays: blockedDays,
          isActive: isActive
        }
      };
      
      const updatedEmployees = employees.map((emp, idx) => 
        idx === employeeIndex ? { ...emp, blockedShifts: updatedBlockedShifts } : emp
      );
      
      updateList(currentEmployeeList.id, { employees: updatedEmployees });
      
      // Cerrar el modal
      setBlockShiftModalState({
        isOpen: false,
        employeeIndex: null,
        employeeName: '',
        shiftId: '',
        shiftTime: '',
        currentBlockedDays: []
      });
      
      console.log('🔧 [ARCHITECT-AI DEBUG] Block shift saved successfully');
     }
   };

  const handlePreferencesChange = (employeeIndex: number, newPreferences: (number | null)[]) => {
    // Deep copy here if needed for preferences updates too
    // const updatedPreferencesDeepCopy = JSON.parse(JSON.stringify(newPreferences));
    // updateEmployeeProperty(employeeIndex, 'shiftPreferences', updatedPreferencesDeepCopy);
    updateEmployeeProperty(employeeIndex, 'shiftPreferences', newPreferences); // Standard shallow update
  };

  const handleAddLeave = (employeeIndex: number, leaveData: { startDate: string; endDate: string; type: string; hoursPerDay: number }) => {
    if (currentEmployeeList) {
      const newLeaveEntry = { ...leaveData, id: crypto.randomUUID(), leaveType: leaveData.type };
      const employeeToUpdate = employees[employeeIndex];
      const updatedLeave = [...(employeeToUpdate.leave || []), newLeaveEntry];
       // Deep copy here if needed for leave updates too
      // const updatedLeaveDeepCopy = JSON.parse(JSON.stringify(updatedLeave));
      // updateEmployeeProperty(employeeIndex, 'leave', updatedLeaveDeepCopy);
      updateEmployeeProperty(employeeIndex, 'leave', updatedLeave); // Standard shallow update
    }
  };

  const handleSaveFixedShifts = (fixedShifts: { [day: string]: string[] }) => {
    if (assignShiftsModalState.employeeIndex === null || !currentEmployeeList) return;
    // Deep copy here if needed for fixed shifts updates too
    // const fixedShiftsDeepCopy = JSON.parse(JSON.stringify(fixedShifts));
    // updateEmployeeProperty(assignShiftsModalState.employeeIndex, 'fixedShifts', fixedShiftsDeepCopy);
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
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata'] add-employees-table">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white text-center flex-1">Add Employees</h2>
        <button 
          onClick={toggleTableBody}
          className={`px-4 py-2 rounded transition-colors ${
            isTableBodyHidden 
              ? 'bg-yellow-500 text-black table-hidden-button' 
              : 'bg-white text-[#19b08d] hover:bg-gray-100'
          }`}
        >
          {isTableBodyHidden ? 'Show Employees Table' : 'Hide Employees Table'}
        </button>
      </div>

      {/* Mensaje cuando la tabla está oculta */}
      {isTableBodyHidden && (
        <div className="bg-yellow-100 border rounded-lg p-4 mb-6 text-center">
          <p className="text-lg font-bold">
            Employees Table is hidden. Press 'Show Employees Table' button to make it visible again
          </p>
        </div>
      )}

      {/* Contenido principal - solo visible cuando no está oculta */}
      {!isTableBodyHidden && (
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
            <div className="relative">
              <input
                type="text"
                maxLength={10}
                placeholder="mm/dd/yyyy"
                value={newEmployee.hireDate}
                onChange={(e) => handleInputChange('hireDate', formatDateInput(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <button
                onClick={() => setIsDatePickerOpen(true)}
                className="absolute right-3 top-2.5"
              >
                <Calendar className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-500">(Optional)</span>
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
              Phone <span className="text-gray-500">(Optional)</span>
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
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
              disabled={!currentEmployeeList}
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
            {isLoading && employees.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading employees...</span>
                  </div>
                </td>
              </tr>
            )}
            <tr>
              <th className="w-12 px-4 py-3 text-left border-r border-gray-300">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300" 
                  checked={masterCheckboxState}
                  onChange={handleMasterCheckboxChange}
                />
              </th>
              <th className="w-1/4 px-4 py-3 text-left border-r border-gray-300">NAME & USER ID</th>
              <th className="w-1/4 px-4 py-3 text-left border-r border-gray-300">SHIFT PREFERENCES</th>
              <th className="w-[12%] px-4 py-3 text-left border-r border-gray-300">BLOCKED SHIFT</th>
              <th className="w-1/4 px-4 py-3 text-left border-r border-gray-300">NOTES</th>
              <th className="px-4 py-3 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* Mapping over employees from context */}
            {employees.map((employee, index) => (
              // Using employee.id as key - ensure it's unique and stable
              <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 border-r border-gray-300">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300" 
                    checked={selectedEmployeeIds.includes(employee.id)}
                    onChange={() => toggleEmployeeSelection(employee.id)}
                  />
                </td>
                <td className="w-1/4 px-4 py-3 border-r border-gray-300">
                  <div className="space-y-2">
                    {/* Editable Fields for Employee Properties */}
                    <div className="bg-gray-100 p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs text-gray-500 w-24">Name:</label>
                        <EditableField 
                          value={employee.name}
                          onChange={(value) => updateEmployeeProperty(index, 'name', value)}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs text-gray-500 w-24">Hire Date:</label>
                        <EditableField
                          value={employee.hireDate}
                           onChange={(value) => updateEmployeeProperty(index, 'hireDate', value)}
                        />
                      </div>
                    </div>
                     <div className="bg-gray-100 p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs text-gray-500 w-24">Employee ID:</label>
                         <EditableField
                          value={employee.id}
                           onChange={(value) => updateEmployeeProperty(index, 'id', value)}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs text-gray-500 w-24">Email:</label>
                        <EditableField
                          value={employee.email || ''}
                          onChange={(value) => updateEmployeeProperty(index, 'email', value)}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2 w-full">
                        <label className="text-xs text-gray-500 w-24">Phone:</label>
                        <EditableField
                          value={employee.phone || ''}
                          onChange={(value) => updateEmployeeProperty(index, 'phone', value)}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="w-1/4 px-4 py-3 border-r border-gray-300">
                  <div className="flex gap-2">
                    <div className="w-full space-y-2">
                      <div className="bg-gray-100 p-2 rounded border border-gray-200">
                        <div className="flex items-center gap-2 w-full">
                          <label className="text-xs text-gray-500">Max. Consec. Shifts:</label>
                          <input
                            type="number"
                            min="1"
                            max="7" // Or based on global rules
                            value={employee.maxConsecutiveShifts || parseInt(rules.maxConsecutiveShifts)}
                            onChange={(e) => updateEmployeeProperty(index, 'maxConsecutiveShifts', parseInt(e.target.value) || parseInt(rules.maxConsecutiveShifts))}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                      <PreferenceManager
                        shifts={shifts} // Assuming shifts are available
                        initialPreferences={employee.shiftPreferences}
                        onChange={(preferences) => handlePreferencesChange(index, preferences)}
                      />
                    </div>
                  </div>
                </td>
                <td className="w-[12%] px-4 py-3 border-r border-gray-300">
                   <div className="w-full space-y-2">
                    {shifts && shifts.length > 0 ? (
                      // Mostrar turnos existentes con funcionalidad de bloqueo - ALINEADOS con PreferenceManager
                      shifts.map((shift, shiftIndex) => {
                        const shiftId = shift.id || `uid_${Math.random().toString(36).substr(2, 15)}`;
                        const isBlocked = employee.blockedShifts?.[shiftId]?.isActive || false;
                        const blockedDays = employee.blockedShifts?.[shiftId]?.blockedDays || [];
                        
                        // Crear tooltip informativo
                        const getTooltipText = () => {
                          if (!isBlocked) {
                            return `Click para bloquear turno: ${shift.startTime} - ${shift.endTime}`;
                          }
                          
                          if (blockedDays.includes('all')) {
                            return `🔒 TURNO BLOQUEADO: ${shift.startTime} - ${shift.endTime}\nTodos los días bloqueados\nClick para editar`;
                          }
                          
                          if (blockedDays.length > 0) {
                            const dayNames = {
                              'monday': 'Lunes',
                              'tuesday': 'Martes', 
                              'wednesday': 'Miércoles',
                              'thursday': 'Jueves',
                              'friday': 'Viernes',
                              'saturday': 'Sábado',
                              'sunday': 'Domingo'
                            };
                            const blockedDayNames = blockedDays.map(day => dayNames[day] || day).join(', ');
                            return `🔒 TURNO BLOQUEADO: ${shift.startTime} - ${shift.endTime}\nDías bloqueados: ${blockedDayNames}\nClick para editar`;
                          }
                          
                          return `🔒 TURNO BLOQUEADO: ${shift.startTime} - ${shift.endTime}\nClick para editar`;
                        };
                        
                        return (
                          <div key={shiftId} className="flex items-center gap-2 bg-gray-100 p-2 rounded border border-gray-200">
                            <button
                              onClick={() => {
                                setBlockShiftModalState({
                                  isOpen: true,
                                  employeeIndex: index,
                                  employeeName: employee.name,
                                  shiftId: shiftId,
                                  shiftTime: `${shift.startTime} - ${shift.endTime}`,
                                  currentBlockedDays: blockedDays
                                });
                              }}
                              className={`w-full px-3 py-1 rounded text-sm font-semibold transition-colors ${
                                isBlocked 
                                  ? 'bg-[#19b08d] hover:bg-[#148a73] text-white' 
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                              title={getTooltipText()}
                            >
                              {isBlocked ? (
                                <span className="flex items-center justify-center gap-1">
                                  🔒 Blocked {shiftIndex + 1}
                                </span>
                              ) : (
                                `Block Shift ${shiftIndex + 1}`
                              )}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      // Mensaje cuando no hay turnos creados
                      <div className="text-center py-4">
                        <div className="text-sm text-gray-600 mb-2">
                          ⚠️ No hay turnos disponibles
                        </div>
                        <div className="text-xs text-gray-500">
                          Crea turnos en Configuración para poder asignar y bloquear turnos.
                        </div>
                      </div>
                    )}
                    {(!shifts || shifts.length === 0) && (
                      <div className="text-xs text-gray-500 mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                        ⚙️ Sin turnos configurados. Ve a Configuración para crear turnos personalizados.
                      </div>
                    )}
                  </div>
                </td>
                <td className="w-1/4 px-4 py-3 border-r border-gray-300">
                   <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confidential Note
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                        value={employee.notes?.confidential || ''} // Handle potential null/undefined notes object
                        onChange={(e) => updateEmployeeNoteProperty(index, 'confidential', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI Rules
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                        value={employee.notes?.aiRules || ''} // Handle potential null/undefined notes object
                        onChange={(e) => updateEmployeeNoteProperty(index, 'aiRules', e.target.value)}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    <button
                      onClick={() => setLeaveModalState({ isOpen: true, employeeIndex: index })}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
                    >
                      Add Vacation,<br />Sick Leave...
                    </button>
                    <button 
                      onClick={() => setAssignShiftsModalState({ isOpen: true, employeeIndex: index })}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
                    >
                      Assign Permanent<br />Shifts
                    </button>
                    <button 
                      onClick={() => handleRemoveEmployee(employee.id)}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:opacity-90 transition-colors font-semibold"
                    >
                      Remove
                    </button>
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

      {/* BlockShiftModal component */}
      {blockShiftModalState.isOpen && (
        <BlockShiftModal
          isOpen={blockShiftModalState.isOpen}
          onClose={() => setBlockShiftModalState({
            isOpen: false,
            employeeIndex: null,
            employeeName: '',
            shiftId: '',
            shiftTime: '',
            currentBlockedDays: []
          })}
          employeeName={blockShiftModalState.employeeName}
          shiftTime={blockShiftModalState.shiftTime}
          currentBlockedDays={blockShiftModalState.currentBlockedDays}
          onSave={(blockedDays) => {
            if (blockShiftModalState.employeeIndex !== null) {
              handleSaveBlockedShift(blockShiftModalState.employeeIndex, blockShiftModalState.shiftId, blockedDays);
            }
          }}
        />
      )}
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