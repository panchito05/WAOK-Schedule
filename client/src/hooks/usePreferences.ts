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
    const newPreferences = [...state.preferences];
    const oldValue = newPreferences[index];

    // Remove old value from used preferences if it exists
    const newUsedPreferences = oldValue !== null 
      ? state.usedPreferences.filter(p => p !== oldValue)
      : [...state.usedPreferences];

    // Add new value to used preferences if it's not null
    if (newValue !== null) {
      newUsedPreferences.push(newValue);
    }

    newPreferences[index] = newValue;

    setState({
      preferences: newPreferences,
      usedPreferences: newUsedPreferences
    });

    return newPreferences;
  };

  return {
    preferences: state.preferences,
    isPreferenceUsed,
    updatePreference
  };
};