import React, { useState, useEffect } from 'react';
import { Clock, X, AlertCircle } from 'lucide-react';
import { useShiftContext, ShiftRow } from '../../context/ShiftContext';
import ShiftPrioritiesModal from '../ShiftPrioritiesModal';

const calculateDuration = (startTime: string, endTime: string, lunchBreakDeduction: number = 0): string => {
  try {
    // Parse the time strings
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return { hours, minutes };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    // Calculate total minutes
    let startMinutes = start.hours * 60 + start.minutes;
    let endMinutes = end.hours * 60 + end.minutes;

    // If end time is before start time, add 24 hours
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    // Calculate duration and subtract lunch break
    const totalMinutes = endMinutes - startMinutes - lunchBreakDeduction;

    // Convert to hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '0h 0m';
  }
};

const formatTime = (time: string): string => {
  const date = new Date(`2000/01/01 ${time}`);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const ShiftConfiguration: React.FC = () => {
  const { shifts, addShift, updateShift, deleteShift } = useShiftContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null);
  const [isPrioritiesModalOpen, setIsPrioritiesModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; index: number }>({ show: false, index: -1 });
  const [newShift, setNewShift] = useState({
    startTime: '',
    endTime: '',
    lunchBreakDeduction: 0
  });
  const [editingShift, setEditingShift] = useState({
    startTime: '',
    endTime: '',
    lunchBreakDeduction: 0
  });

  useEffect(() => {
    // Log the shifts to verify they're being loaded correctly
    console.log('Current shifts:', shifts);
  }, [shifts]);

  const handleEditClick = (index: number) => {
    const shift = shifts[index];
    setEditingShift({
      startTime: shift.startTime,
      endTime: shift.endTime,
      lunchBreakDeduction: shift.lunchBreakDeduction
    });
    setEditingShiftIndex(index);
  };

  const handleSaveEdit = (index: number) => {
    const duration = calculateDuration(editingShift.startTime, editingShift.endTime, editingShift.lunchBreakDeduction);
    updateShift(index, {
      startTime: editingShift.startTime,
      endTime: editingShift.endTime,
      duration,
      lunchBreakDeduction: editingShift.lunchBreakDeduction
    });
    setEditingShiftIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingShiftIndex(null);
    setEditingShift({
      startTime: '',
      endTime: '',
      lunchBreakDeduction: 0
    });
  };

  const handleDeleteClick = (index: number) => {
    setDeleteConfirmation({ show: true, index });
  };

  const handleConfirmDelete = () => {
    deleteShift(deleteConfirmation.index);
    setDeleteConfirmation({ show: false, index: -1 });
  };

  const handleCreateShift = () => {
    if (!newShift.startTime || !newShift.endTime) {
      alert('Please fill in both start and end times');
      return;
    }

    const formattedStartTime = formatTime(newShift.startTime);
    const formattedEndTime = formatTime(newShift.endTime);
    const duration = calculateDuration(newShift.startTime, newShift.endTime, newShift.lunchBreakDeduction);

    const newShiftRow: ShiftRow = {
      id: `shift_${shifts.length + 1}`,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      duration,
      lunchBreakDeduction: newShift.lunchBreakDeduction
    };

    addShift(newShiftRow);
    setIsModalOpen(false);
    setNewShift({ startTime: '', endTime: '', lunchBreakDeduction: 0 });
  };

  return (
    <div className="relative w-[800px] bg-white rounded-lg shadow-lg p-6 mt-8 font-['Viata']">
      <div className="bg-gradient-to-r from-[#19b08d] to-[#117cee] p-4 rounded-t-lg mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Shift Configuration</h2>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white px-6 py-2 rounded hover:opacity-90 transition-colors font-semibold"
        >
          Create Shift
        </button>
        <button 
          onClick={() => setIsPrioritiesModalOpen(true)}
          className="bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white px-6 py-2 rounded hover:opacity-90 transition-colors font-semibold"
        >
          Set Shift Priorities
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Start Time</th>
              <th className="px-4 py-3 text-left">End Time</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Lunch Break<br/>Deduction (min)</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(shifts) && shifts.map((shift, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                <td className="px-4 py-3">
                  {editingShiftIndex === index ? (
                    <input
                      type="time"
                      value={editingShift.startTime.split(' ')[0]}
                      onChange={(e) => setEditingShift(prev => ({
                        ...prev,
                        startTime: `${e.target.value} ${editingShift.startTime.split(' ')[1] || 'AM'}`
                      }))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {shift.startTime}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingShiftIndex === index ? (
                    <input
                      type="time"
                      value={editingShift.endTime.split(' ')[0]}
                      onChange={(e) => setEditingShift(prev => ({
                        ...prev,
                        endTime: `${e.target.value} ${editingShift.endTime.split(' ')[1] || 'PM'}`
                      }))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {shift.endTime}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{shift.duration}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    value={editingShiftIndex === index ? editingShift.lunchBreakDeduction : shift.lunchBreakDeduction}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      if (editingShiftIndex === index) {
                        setEditingShift(prev => ({
                          ...prev,
                          lunchBreakDeduction: value
                        }));
                      } else {
                        updateShift(index, {
                          ...shift,
                          lunchBreakDeduction: value,
                          duration: calculateDuration(shift.startTime, shift.endTime, value)
                        });
                      }
                    }}
                    className="w-20 border border-gray-300 rounded px-2 py-1"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editingShiftIndex === index ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(index)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(index)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(index)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] relative">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Delete Shift</h3>
                <div className="space-y-4 mb-6">
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-red-700 font-medium mb-1">Warning:</p>
                    <ul className="list-disc list-inside space-y-2 text-red-600">
                      <li>Are you sure you want to delete this shift?</li>
                      <li>This shift will also be removed from any employees' preferred shifts.</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setDeleteConfirmation({ show: false, index: -1 })}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-bold mb-6">Create New Shift</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newShift.startTime}
                  onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={newShift.endTime}
                  onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lunch Break Deduction (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newShift.lunchBreakDeduction}
                  onChange={(e) => setNewShift({ ...newShift, lunchBreakDeduction: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShift}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Create Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ShiftPrioritiesModal 
        isOpen={isPrioritiesModalOpen}
        onClose={() => setIsPrioritiesModalOpen(false)}
      />
    </div>
  );
};

export default ShiftConfiguration;