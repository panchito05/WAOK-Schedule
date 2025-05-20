import React, { createContext, useContext, useState, ReactNode } from "react";

type PersonnelDataContextType = {
  // Define your context state and functions here
};

const PersonnelDataContext = createContext<PersonnelDataContextType | undefined>(undefined);

export function usePersonnelData() {
  const context = useContext(PersonnelDataContext);
  if (context === undefined) {
    throw new Error("usePersonnelData must be used within a PersonnelDataProvider");
  }
  return context;
}

export function PersonnelDataProvider({ children }: { children: ReactNode }) {
  // Define your state and functions here

  const value = {
    // Provide your state and functions here
  };

  return <PersonnelDataContext.Provider value={value as PersonnelDataContextType}>{children}</PersonnelDataContext.Provider>;
}
