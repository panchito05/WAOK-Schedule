import React from 'react';
import { X, AlertCircle, Info, Calendar } from 'lucide-react';
import { useShiftContext } from '../../context/ShiftContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { useRules } from '../../context/RulesContext';
import { usePersonnelData } from '../../context/PersonnelDataContext';

// Define daysOfWeek since it's not defined
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: {
    startTime: string;
    endTime: string;
    index?: number;
  };
}

const OvertimeModal: React.FC<OvertimeModalProps> = ({ isOpen, onClose, shift }) => {
  const { toggleGlobalOvertime, toggleShiftOvertime, shifts, isGlobalOvertimeActive, setShiftOvertimeForDate } = useShiftContext();
  const { rules } = useRules();
  const { getCurrentList, refreshTrigger } = useEmployeeLists();
  const { shiftData } = usePersonnelData();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showShiftConfirm, setShowShiftConfirm] = React.useState(false);
  const [currentShiftInfo, setCurrentShiftInfo] = React.useState({
    currentStaff: 0,
    idealStaff: 0,
    availablePositions: 0
  });
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showDateOvertime, setShowDateOvertime] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(rules.startDate);
  const [overtimeQuantity, setOvertimeQuantity] = React.useState(1);
  const [isOvertimeActive, setIsOvertimeActive] = React.useState(true);

  // Update current staff info when date changes
  React.useEffect(() => {
    if (typeof shift.index === 'number' && selectedDate) {
      const currentList = getCurrentList();
      const employees = currentList?.employees || [];
      const currentShift = shifts[shift.index];

      const date = new Date(selectedDate + 'T00:00:00Z');
      const dayOfWeek = daysOfWeek[date.getUTCDay()];

      // Count scheduled employees
      let count = 0;
      employees.forEach(employee => {
        const isOnLeave = employee.leave?.some(l => {
          const leaveStart = new Date(l.startDate + 'T00:00:00Z');
          const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
          const current = new Date(selectedDate + 'T00:00:00Z');
          return current >= leaveStart && current <= leaveEnd;
        });

        if (!isOnLeave) {
          const manualShift = employee.manualShifts?.[selectedDate];
          const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
          const shiftId = `uid_${Math.random().toString(36).substr(2, 15)}`;

          if (manualShift === shiftId || (!manualShift && fixedShift === shiftId)) {
            count++;
          }
        }
      });

      const idealStaff = shiftData && shiftData[shift.index] ? shiftData[shift.index].counts[date.getUTCDay()] || 0 : 0;

      setCurrentShiftInfo({
        currentStaff: count,
        idealStaff,
        availablePositions: Math.max(0, idealStaff - count)
      });
    }
  }, [shift.index, selectedDate, shifts, getCurrentList, shiftData]);

  // Update selectedDate when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDate(rules.startDate);
    }
  }, [isOpen, rules.startDate]);

  const handleGlobalOvertime = () => {
    setShowConfirm(true);
  };

  const handleShiftOvertime = () => {
    setShowShiftConfirm(true);
  };

  const confirmGlobalOvertime = () => {
    toggleGlobalOvertime(true);
    setShowConfirm(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const confirmShiftOvertime = () => {
    if (typeof shift.index === 'number') {
      toggleShiftOvertime(shift.index, !shifts[shift.index]?.isOvertimeActive);
      setShowShiftConfirm(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-6">Add or Edit Overtime Options</h2>
        <p className="text-gray-600 mb-6">Shift: {shift.startTime} - {shift.endTime}</p>

        <div className="space-y-4">
          <button 
            onClick={handleGlobalOvertime}
            className={`w-full px-4 py-3 rounded transition-colors text-left flex items-center gap-2 ${
              isGlobalOvertimeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            1. {isGlobalOvertimeActive ? 'Remove' : 'Add'} Overtime for the entire work schedule in all shifts where employees are missing to complete the Ideal Staff For This Shift.
          </button>

          <button 
            onClick={handleShiftOvertime}
            className={`w-full px-4 py-3 rounded transition-colors text-left flex items-center gap-2 ${
              typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            2. Add all missing overtime, but only for this specific shift
            {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive && (
              <span className="text-sm">(Currently Active)</span>
            )}
          </button>

          <button 
            onClick={() => setShowDateOvertime(true)}
            className="w-full bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 transition-colors text-left"
          >
            3. Add or Edit Overtime for this shift on a specific day.
          </button>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] relative">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {isGlobalOvertimeActive ? 'Disable' : 'Enable'} Global Overtime
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isGlobalOvertimeActive
                      ? 'This will remove overtime from all shifts. Are you sure you want to continue?'
                      : 'This will enable overtime for all shifts where the number of scheduled employees is less than the ideal staff count. Are you sure you want to continue?'
                    }
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmGlobalOvertime}
                      className={`px-4 py-2 text-white rounded ${
                        isGlobalOvertimeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {isGlobalOvertimeActive ? 'Disable' : 'Enable'} Global Overtime
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showShiftConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] relative">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                      ? 'Disable Shift Overtime'
                      : 'Enable Shift Overtime'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                      ? 'This will disable overtime for this specific shift. Are you sure you want to continue?'
                      : 'This will enable overtime only for this specific shift where the number of scheduled employees is less than the ideal staff count. Are you sure you want to continue?'}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowShiftConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmShiftOvertime}
                      className={`px-4 py-2 text-white rounded ${
                        typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {typeof shift.index === 'number' && shifts[shift.index]?.isOvertimeActive
                        ? 'Disable Shift Overtime'
                        : 'Enable Shift Overtime'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDateOvertime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] relative">
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Add Overtime for Specific Date</h3>

                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Shift Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm">Time: {shift.startTime} - {shift.endTime}</p>
                    <p className="text-sm">Current Staff: {currentShiftInfo.currentStaff}</p>
                    <p className="text-sm">Ideal Staff: {currentShiftInfo.idealStaff}</p>
                    <p className="text-sm">Available Positions: {currentShiftInfo.availablePositions}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Overtime Shifts Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={overtimeQuantity}
                    onChange={(e) => setOvertimeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isOvertimeActive}
                    onChange={(e) => setIsOvertimeActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label className="text-sm text-gray-700">
                    Enable overtime for this date
                  </label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowDateOvertime(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (typeof shift.index === 'number' && selectedDate) {
                        setShiftOvertimeForDate(shift.index, selectedDate, overtimeQuantity, isOvertimeActive);
                        setShowDateOvertime(false);
                        setShowSuccess(true);
                        setTimeout(() => {
                          setShowSuccess(false);
                          onClose();
                        }, 2000);
                      }
                    }}
                    disabled={!selectedDate}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Overtime
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px] relative">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Success!</h3>
                  <p className="text-gray-600">
                    Global overtime has been enabled. Available shifts will now be shown where needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OvertimeModal;