import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const currentYear = new Date().getFullYear();
  const [view, setView] = useState<'year' | 'month' | 'day'>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [yearStart, setYearStart] = useState(currentYear - 11);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setView('month');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setView('day');
  };

  const handleDaySelect = (day: number) => {
    if (selectedYear && selectedMonth !== null) {
      const date = new Date(selectedYear, selectedMonth, day);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      onSelect(formattedDate);
      onClose();
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateYears = (direction: 'prev' | 'next') => {
    setYearStart(prev => prev + (direction === 'prev' ? 12 : -12));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold">
            {view === 'year' && 'Select Year'}
            {view === 'month' && `Select Month (${selectedYear})`}
            {view === 'day' && `Select Day (${months[selectedMonth!]} ${selectedYear})`}
          </h2>
        </div>

        {view === 'year' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateYears('prev')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span>{yearStart} - {yearStart + 11}</span>
              <button
                onClick={() => navigateYears('next')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => yearStart + 11 - i).map(year => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className="p-2 text-center hover:bg-green-100 rounded"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'month' && (
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className="p-2 text-center hover:bg-green-100 rounded"
              >
                {month}
              </button>
            ))}
          </div>
        )}

        {view === 'day' && selectedYear && selectedMonth !== null && (
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getFirstDayOfMonth(selectedYear, selectedMonth) }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleDaySelect(i + 1)}
                  className="p-2 text-center hover:bg-green-100 rounded"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {view !== 'year' && (
          <button
            onClick={() => setView(view === 'day' ? 'month' : 'year')}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default DatePickerModal;