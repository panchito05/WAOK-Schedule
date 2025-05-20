import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Clave para localStorage
const SELECTED_EMPLOYEES_STORAGE_KEY = 'selectedEmployeeIds';

// Contexto para manejar los empleados seleccionados
interface SelectedEmployeesContextType {
  selectedEmployeeIds: string[];
  setSelectedEmployeeIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleEmployeeSelection: (employeeId: string) => void;
  toggleAllEmployees: (allEmployeeIds: string[]) => void;
}

const SelectedEmployeesContext = createContext<SelectedEmployeesContextType | undefined>(undefined);

// Función auxiliar para cargar los IDs seleccionados desde localStorage
const loadSelectedEmployeeIds = (): string[] => {
  try {
    const savedIds = localStorage.getItem(SELECTED_EMPLOYEES_STORAGE_KEY);
    return savedIds ? JSON.parse(savedIds) : [];
  } catch (error) {
    console.error('Error al cargar empleados seleccionados de localStorage:', error);
    return [];
  }
};

export const SelectedEmployeesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializar con los valores guardados en localStorage
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(loadSelectedEmployeeIds());
  
  // Guardar en localStorage cada vez que cambia la selección
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_EMPLOYEES_STORAGE_KEY, JSON.stringify(selectedEmployeeIds));
    } catch (error) {
      console.error('Error al guardar empleados seleccionados en localStorage:', error);
    }
  }, [selectedEmployeeIds]);

  // Función para manejar la selección individual
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Función para seleccionar/deseleccionar todos
  const toggleAllEmployees = (allEmployeeIds: string[]) => {
    // Verificamos si allEmployeeIds es un array válido
    if (!Array.isArray(allEmployeeIds)) {
      console.error("toggleAllEmployees recibió un valor no válido:", allEmployeeIds);
      return;
    }
    
    if (selectedEmployeeIds.length === allEmployeeIds.length &&
        allEmployeeIds.every(id => selectedEmployeeIds.includes(id))) {
      // Si todos están seleccionados, deseleccionar todos
      setSelectedEmployeeIds([]);
    } else {
      // Si no todos están seleccionados, seleccionar todos
      setSelectedEmployeeIds([...allEmployeeIds]);
    }
  };

  return (
    <SelectedEmployeesContext.Provider 
      value={{ 
        selectedEmployeeIds, 
        setSelectedEmployeeIds, 
        toggleEmployeeSelection, 
        toggleAllEmployees 
      }}
    >
      {children}
    </SelectedEmployeesContext.Provider>
  );
};

// Hook para facilitar el acceso al contexto
export const useSelectedEmployees = () => {
  const context = useContext(SelectedEmployeesContext);
  if (context === undefined) {
    throw new Error('useSelectedEmployees must be used within a SelectedEmployeesProvider');
  }
  return context;
};