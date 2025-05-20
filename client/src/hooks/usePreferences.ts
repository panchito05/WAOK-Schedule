import { useState } from 'react';

export interface PreferenceState {
  preferences: (number | null)[];
  usedPreferences: number[];
}

export const usePreferences = (initialPreferences: (number | null)[]) => {
  const [state, setState] = useState<PreferenceState>({
    preferences: initialPreferences || [],
    usedPreferences: (initialPreferences || []).filter((p): p is number => p !== null)
  });

  const isPreferenceUsed = (value: number) => {
    return state.usedPreferences.includes(value);
  };

  const updatePreference = (index: number, newValue: number | null) => {
    setState(current => {
      const newPreferences = [...current.preferences];
      const oldValue = newPreferences[index];

      // Remove old value from used preferences if it exists
      const newUsedPreferences = oldValue !== null 
        ? current.usedPreferences.filter(p => p !== oldValue)
        : [...current.usedPreferences];

      // Add new value to used preferences if it's not null
      if (newValue !== null) {
        newUsedPreferences.push(newValue);
      }

      newPreferences[index] = newValue;

      return {
        preferences: newPreferences,
        usedPreferences: newUsedPreferences
      };
    });

    return state.preferences;
  };

  return {
    preferences: state.preferences,
    isPreferenceUsed,
    updatePreference
  };
};