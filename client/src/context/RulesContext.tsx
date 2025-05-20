import React, { createContext, useContext, useState, ReactNode } from "react";

type RulesContextType = {
  // Define your context state and functions here
};

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export function useRules() {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error("useRules must be used within a RulesProvider");
  }
  return context;
}

export function RulesProvider({ children }: { children: ReactNode }) {
  // Define your state and functions here

  const value = {
    // Provide your state and functions here
  };

  return <RulesContext.Provider value={value as RulesContextType}>{children}</RulesContext.Provider>;
}
