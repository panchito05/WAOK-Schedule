import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useStore } from './StoreContext';
import { Rules } from '../types/common';

interface RulesContextType {
  rules: Rules;
  updateRules: (rules: Partial<Rules>) => void;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export const RulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getCurrentList, updateList, getRules } = useStore();
  
  // Obtener las reglas del almacén central
  const rules = useMemo(() => {
    return getRules();
  }, [getRules]);
  
  // Función para actualizar las reglas
  const updateRules = useCallback((updatedRules: Partial<Rules>) => {
    const currentList = getCurrentList();
    if (currentList) {
      updateList(currentList.id, { 
        rules: { ...currentList.rules, ...updatedRules } 
      });
    }
  }, [getCurrentList, updateList]);
  
  // Memoizar el valor del contexto para prevenir renderizados innecesarios
  const contextValue = useMemo(() => ({
    rules,
    updateRules
  }), [rules, updateRules]);
  
  return (
    <RulesContext.Provider value={contextValue}>
      {children}
    </RulesContext.Provider>
  );
};

export const useRules = () => {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
};