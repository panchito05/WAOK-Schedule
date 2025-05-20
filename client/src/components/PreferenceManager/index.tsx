import React from 'react';
import { ChevronDown } from 'lucide-react';
import { usePreferences } from '../../hooks/usePreferences';
import { ShiftRow } from '../../context/ShiftContext';

interface PreferenceManagerProps {
  shifts: ShiftRow[];
  initialPreferences: (number | null)[];
  onChange: (preferences: (number | null)[]) => void;
}

const PreferenceManager: React.FC<PreferenceManagerProps> = ({
  shifts,
  initialPreferences,
  onChange
}) => {
  const { preferences, isPreferenceUsed, updatePreference } = usePreferences(initialPreferences);

  const handlePreferenceChange = (index: number, value: string) => {
    const newValue = value === 'null' ? null : parseInt(value);
    const newPreferences = updatePreference(index, newValue);
    onChange(newPreferences);
  };

  return (
    <div className="w-full space-y-2">
      {shifts.map((shift, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded border border-gray-200">
          <div className="relative">
            <select
              value={preferences[index] === null ? 'null' : preferences[index]}
              onChange={(e) => handlePreferenceChange(index, e.target.value)}
              className="w-32 appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8"
            >
              <option value="null">No preference</option>
              {[1, 2, 3].map((num) => (
                <option
                  key={num}
                  value={num}
                  disabled={isPreferenceUsed(num) && preferences[index] !== num}
                >
                  Pref #{num}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          <span className="text-sm text-gray-600 flex-1">
            {shift.startTime} - {shift.endTime}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PreferenceManager