import React, { createContext, useState, useContext, ReactNode } from 'react';

// Contexto para manejar los empleados seleccionados
interface SelectedEmployeesContextType {
  selectedEmployeeIds: string[];
  setSelectedEmployeeIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleEmployeeSelection: (employeeId: string) => void;
  toggleAllEmployees: (allEmployeeIds: string[]) => void;
}

const SelectedEmployeesContext = createContext<SelectedEmployeesContextType | undefined>(undefined);

export const SelectedEmployeesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

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