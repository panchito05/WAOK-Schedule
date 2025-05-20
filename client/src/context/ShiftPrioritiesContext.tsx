import React, { createContext, useContext, useState, ReactNode } from "react";

type ShiftPrioritiesContextType = {
  // Define your context state and functions here
};

const ShiftPrioritiesContext = createContext<ShiftPrioritiesContextType | undefined>(undefined);

export function useShiftPriorities() {
  const context = useContext(ShiftPrioritiesContext);
  if (context === undefined) {
    throw new Error("useShiftPriorities must be used within a ShiftPrioritiesProvider");
  }
  return context;
}

export function ShiftPrioritiesProvider({ children }: { children: ReactNode }) {
  // Define your state and functions here

  const value = {
    // Provide your state and functions here
  };

  return <ShiftPrioritiesContext.Provider value={value as ShiftPrioritiesContextType}>{children}</ShiftPrioritiesContext.Provider>;
}
