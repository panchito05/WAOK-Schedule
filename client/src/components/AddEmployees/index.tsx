// src/components/AddEmployees/index.tsx - CODIGO CON LA SOLUCION aplicando la copia profunda
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import DatePickerModal from '../DatePickerModal';
import { useShiftContext } from '../../context/ShiftContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext'; // Correcto
import { useRules } from '../../context/RulesContext';
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

  // Eliminar llamada a getCurrentList de aquí - es parte del problema
  // Definimos un estado local para rastrear el empleado list cargado
  const [employeeStateLoaded, setEmployeeStateLoaded] = useState(false);
  
  // Estado local para hacer caching de la lista actual para evitar re-renders continuos
  const [localEmployeeList, setLocalEmployeeList] = useState<any>(null);
  const [localEmployees, setLocalEmployees] = useState<any[]>([]);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

   // Keep other handler functions (handleBlockClick, handleSaveBlockedDays, etc.)
   // as they correctly update specific parts of the employee object and then call updateList.
   // If deep copy is needed for these updates too based on your diagnosis,
   // you would apply similar JSON.parse(JSON.stringify(...)) before updateList calls.

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
    // Deep copy here if needed for blocked shifts updates too
    // const updatedEmployeesDeepCopy = JSON.parse(JSON.stringify(updatedEmployees));
    // updateList(currentEmployeeList.id, { employees: updatedEmployeesDeepCopy });
    updateList(currentEmployeeList.id, { employees: updatedEmployees }); // Standard shallow update
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
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Add Employees</h2>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* Espacio vacío para mantener el justify-between */}
        <button className="text-gray-600 hover:text-gray-800">
          Hide Employees Table
        </button>
      </div>

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
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="w-1/4 px-4 py-3 text-left border-r border-gray-300">NAME & USER ID</th>
              <th className="w-1/4 px-4 py-3 text-left border-r border-gray-300">SHIFT PREFERENCES</th>
              <th className="w-[12%] px-4 py-3 text-left border-r border-gray-300">LOCKED SHIFT</th>
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
                  <input type="checkbox" className="rounded border-gray-300" />
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
                   <div className="space-y-2">
                    {shifts.map((shift, shiftIndex) => {
                       // Use shift.id if available from context, fallback to index if needed for old data
                       const shiftId = shift.id || `shift_${shiftIndex + 1}`;
                      const blockedDays = employee.blockedShifts?.[shiftId] || [];
                      const isBlocked = blockedDays.length > 0;
                      const shiftInfo = {
                         id: shiftId, // Pass a consistent ID to the modal
                        startTime: shift.startTime,
                        endTime: shift.endTime
                      };

                      return (
                        <button
                           key={shiftId} // Use the consistent ID for the key
                          onClick={() => handleBlockClick(index, shiftInfo)}
                          className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                            isBlocked 
                              ? 'bg-red-500 text-white hover:opacity-90' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Block Shift {shiftIndex + 1}: {shift.startTime} - {shift.endTime}
                          {isBlocked && (
                            <span className="block text-xs mt-1">
                              Blocked: {blockedDays.join(', ')}
                            </span>
                          )}
                        </button>
                      );
                    })}
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