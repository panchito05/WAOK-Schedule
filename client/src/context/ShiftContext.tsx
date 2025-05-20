import React, { createContext, useContext, useState, ReactNode } from "react";

type ShiftContextType = {
  // Define your context state and functions here
};

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function useShift() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
}

export function ShiftProvider({ children }: { children: ReactNode }) {
  // Define your state and functions here

  const value = {
    // Provide your state and functions here
  };

  return <ShiftContext.Provider value={value as ShiftContextType}>{children}</ShiftContext.Provider>;
}
