import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useRules } from '../../context/RulesContext';

interface ShiftRulesFormData {
  startDate: string;
  endDate: string;
  maxConsecutiveShifts: string;
  minDaysOffAfterMax: string;
  minWeekendsOffPerMonth: string;
  minRestHoursBetweenShifts: string;
  writtenRule1: string;
  writtenRule2: string;
  minHoursPerWeek: string;
  minHoursPerTwoWeeks: string;
}

const ShiftRules: React.FC = () => {
  const { rules, updateRules } = useRules();

  const handleNumberChange = (field: keyof ShiftRulesFormData, value: string, min: number, max: number) => {
    const numValue = parseInt(value);
    if (value === '') {
      updateRules({ [field]: min.toString() });
    } else if (!isNaN(numValue)) {
      updateRules({ [field]: Math.min(Math.max(numValue, min), max).toString() });
    }
  };

  return (
    <div className="w-[800px] bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Shift Rules For All Employees</h2>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center bg-gray-50 p-3 rounded">
            <span className="w-32 text-gray-700">Start Date:</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={rules.startDate}
                onChange={(e) => updateRules({ startDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center bg-gray-50 p-3 rounded">
            <span className="w-32 text-gray-700">End Date:</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={rules.endDate}
                onChange={(e) => updateRules({ endDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="space-y-2 border-b border-gray-200 pb-4">
          <div className="flex items-center bg-gray-50 p-3 rounded">
            <span className="flex-1 text-gray-700">Maximum consecutive shifts (For All Employees):</span>
            <div className="w-32">
              <input
                type="number"
                min="1"
                max="7"
                step="1"
                value={rules.maxConsecutiveShifts}
                onChange={(e) => handleNumberChange('maxConsecutiveShifts', e.target.value, 1, 7)}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    updateRules({ maxConsecutiveShifts: '1' });
                  }
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center bg-white p-3 rounded">
            <span className="flex-1 text-gray-700">Minimum days off after max consecutive shifts:</span>
            <div className="w-32">
              <input
                type="number"
                min="1"
                max="5"
                step="1"
                value={rules.minDaysOffAfterMax}
                onChange={(e) => handleNumberChange('minDaysOffAfterMax', e.target.value, 1, 5)}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    updateRules({ minDaysOffAfterMax: '1' });
                  }
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center bg-gray-50 p-3 rounded">
            <span className="flex-1 text-gray-700">Minimum weekends off per month:</span>
            <div className="w-32">
              <input
                type="number"
                min="1"
                max="4"
                step="1"
                value={rules.minWeekendsOffPerMonth}
                onChange={(e) => handleNumberChange('minWeekendsOffPerMonth', e.target.value, 1, 4)}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    updateRules({ minWeekendsOffPerMonth: '1' });
                  }
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center bg-white p-3 rounded">
            <span className="flex-1 text-gray-700">Minimum rest hours between shifts:</span>
            <div className="w-32">
              <input
                type="number"
                min="8"
                max="24"
                step="1"
                value={rules.minRestHoursBetweenShifts}
                onChange={(e) => handleNumberChange('minRestHoursBetweenShifts', e.target.value, 8, 24)}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    updateRules({ minRestHoursBetweenShifts: '8' });
                  }
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 border-b border-gray-200 pb-4">
          <div className="flex items-center bg-gray-50 p-3 rounded">
            <span className="w-48 text-gray-700">Written Rule 1:</span>
            <input
              type="text"
              value={rules.writtenRule1}
              onChange={(e) => updateRules({ writtenRule1: e.target.value })}
              placeholder="Enter rule 1"
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
            />
          </div>

          <div className="flex items-center bg-white p-3 rounded">
            <span className="w-48 text-gray-700">Written Rule 2:</span>
            <input
              type="text"
              value={rules.writtenRule2}
              onChange={(e) => updateRules({ writtenRule2: e.target.value })}
              placeholder="Enter rule 2"
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center bg-gray-50 p-3 rounded">
            <span className="flex-1 text-gray-700">Minimum hours per week:</span>
            <input
              type="number"
              min="0"
              value={rules.minHoursPerWeek}
              onChange={(e) => handleNumberChange('minHoursPerWeek', e.target.value, 0, 168)}
              onBlur={(e) => {
                if (e.target.value === '') {
                  updateRules({ minHoursPerWeek: '0' });
                }
              }}
              className="w-32 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
            />
          </div>

          <div className="flex items-center bg-white p-3 rounded">
            <span className="flex-1 text-gray-700">Minimum hours per two weeks:</span>
            <input
              type="number"
              min="0"
              value={rules.minHoursPerTwoWeeks}
              onChange={(e) => handleNumberChange('minHoursPerTwoWeeks', e.target.value, 0, 336)}
              onBlur={(e) => {
                if (e.target.value === '') {
                  updateRules({ minHoursPerTwoWeeks: '0' });
                }
              }}
              className="w-32 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#19b08d] focus:border-[#19b08d] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftRules;
