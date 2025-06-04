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

// Función para convertir de formato 12h a 24h
const convertTo24Hour = (time12h: string): string => {
  if (!time12h.includes('AM') && !time12h.includes('PM')) {
    return time12h; // Ya está en formato 24h
  }
  
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (period === 'PM' && hours !== '12') {
    hours = (parseInt(hours) + 12).toString();
  } else if (period === 'AM' && hours === '12') {
    hours = '00';
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Función para convertir de formato 24h a 12h
const convertTo12Hour = (time24h: string): string => {
  if (time24h.includes('AM') || time24h.includes('PM')) {
    return time24h; // Ya está en formato 12h
  }
  
  const [hours, minutes] = time24h.split(':');
  const hour24 = parseInt(hours);
  
  if (hour24 === 0) {
    return `12:${minutes} AM`;
  } else if (hour24 < 12) {
    return `${hour24}:${minutes} AM`;
  } else if (hour24 === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour24 - 12}:${minutes} PM`;
  }
};

// Función para mostrar el tiempo en el formato seleccionado
const displayTime = (time: string, is24Hour: boolean): string => {
  return is24Hour ? convertTo24Hour(time) : convertTo12Hour(time);
};

// Paleta de colores predefinida (15 colores)
const COLOR_PALETTE = [
    '#3B82F6', // Azul
    '#EF4444', // Rojo
    '#10B981', // Verde esmeralda
    '#F59E0B', // Amarillo
    '#8B5CF6', // Púrpura
    '#F97316', // Naranja
    '#06B6D4', // Cian
    '#EC4899', // Rosa
    '#6366F1', // Índigo
    '#14B8A6', // Teal
    '#F43F5E', // Rosa intenso
    '#A855F7', // Violeta
    '#22C55E', // Verde lima
    '#0EA5E9', // Azul cielo
    '#8B5A3C', // Marrón
    '#64748B', // Azul gris
    '#1F2937'  // Gris antracita
  ];

const ShiftConfiguration: React.FC = () => {
  const { shifts, addShift, updateShift, deleteShift } = useShiftContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null);
  const [isPrioritiesModalOpen, setIsPrioritiesModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; index: number }>({ show: false, index: -1 });
  const [is24HourFormat, setIs24HourFormat] = useState(false);
  const [newShift, setNewShift] = useState({
    startTime: '',
    endTime: '',
    lunchBreakDeduction: 0,
    name: '',
    color: ''
  });
  const [editingShift, setEditingShift] = useState({
    startTime: '',
    endTime: '',
    lunchBreakDeduction: 0,
    name: '',
    color: ''
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
      lunchBreakDeduction: shift.lunchBreakDeduction,
      name: shift.name || '',
      color: shift.color || ''
    });
    setEditingShiftIndex(index);
  };

  const handleSaveEdit = (index: number) => {
    const duration = calculateDuration(editingShift.startTime, editingShift.endTime, editingShift.lunchBreakDeduction);
    updateShift(index, {
      startTime: editingShift.startTime,
      endTime: editingShift.endTime,
      duration,
      lunchBreakDeduction: editingShift.lunchBreakDeduction,
      name: editingShift.name,
      color: editingShift.color,
      id: shifts[index].id || `uid_${Math.random().toString(36).substr(2, 15)}`,
      isOvertimeActive: shifts[index].isOvertimeActive,
      overtimeEntries: shifts[index].overtimeEntries
    });
    setEditingShiftIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingShiftIndex(null);
    setEditingShift({
      startTime: '',
      endTime: '',
      lunchBreakDeduction: 0,
      name: '',
      color: ''
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
      id: `uid_${Math.random().toString(36).substr(2, 15)}`,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      duration,
      lunchBreakDeduction: newShift.lunchBreakDeduction,
      isOvertimeActive: false,
      overtimeEntries: []
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

      <div className="flex justify-center gap-16 mb-3">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
        >
          Create Shift
        </button>
        <button 
          onClick={() => setIsPrioritiesModalOpen(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
        >
          Set Shift Priorities
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white">
            <tr>
              <th className="px-7 py-3 text-left">Start Time</th>
              <th className="px-4 py-3 text-left">End Time</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-9 py-3 text-left">Lunch Break</th>
              <th className="px-12 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(shifts) && shifts.map((shift, index) => (
              <React.Fragment key={index}>
                <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                <td className="px-4 py-3">
                  {editingShiftIndex === index ? (
                    <input
                      type="time"
                      value={convertTo24Hour(editingShift.startTime)}
                      onChange={(e) => {
                        const time24 = e.target.value;
                        const time12 = convertTo12Hour(time24);
                        setEditingShift(prev => ({
                          ...prev,
                          startTime: is24HourFormat ? time24 : time12
                        }));
                      }}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {displayTime(shift.startTime, is24HourFormat)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingShiftIndex === index ? (
                    <input
                      type="time"
                      value={convertTo24Hour(editingShift.endTime)}
                      onChange={(e) => {
                        const time24 = e.target.value;
                        const time12 = convertTo12Hour(time24);
                        setEditingShift(prev => ({
                          ...prev,
                          endTime: is24HourFormat ? time24 : time12
                        }));
                      }}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {displayTime(shift.endTime, is24HourFormat)}
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
                          onClick={() => setIs24HourFormat(!is24HourFormat)}
                          className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 transition-colors text-xs"
                          title={`Cambiar a formato ${is24HourFormat ? '12' : '24'} horas`}
                        >
                          {is24HourFormat ? '12h' : '24h'}
                        </button>
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
                {/* Fila adicional para campos de nombre y color cuando está en modo edición */}
                {editingShiftIndex === index && (
                  <tr className="bg-blue-50">
                  <td className="px-4 py-3" colSpan={2}>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Nombre del Turno:</label>
                      <input
                        type="text"
                        value={editingShift.name}
                        onChange={(e) => setEditingShift(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ej. TURNO DE DIA"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3" colSpan={3}>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Color del Turno:</label>
                      <div className="flex flex-wrap gap-2">
                        {/* Opción Sin Color */}
                        <button
                          onClick={() => setEditingShift(prev => ({ ...prev, color: '' }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                            editingShift.color === '' ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: '#f9fafb' }}
                          title="Sin Color"
                        >
                          <span className="text-xs text-gray-500">∅</span>
                        </button>
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditingShift(prev => ({ ...prev, color }))}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                              editingShift.color === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">Seleccionado:</span>
                        <div 
                          className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center"
                          style={{ backgroundColor: editingShift.color || '#f9fafb' }}
                        >
                          {!editingShift.color && <span className="text-xs text-gray-500">∅</span>}
                        </div>
                        <span className="text-sm font-mono text-gray-500">{editingShift.color || 'Sin Color'}</span>
                      </div>
                    </div>
                  </td>
                  </tr>
                 )}
               </React.Fragment>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Turno
                </label>
                <input
                  type="text"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ej. TURNO DE DÍA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color del Turno
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Opción Sin Color */}
                  <button
                    type="button"
                    onClick={() => setNewShift(prev => ({ ...prev, color: '' }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                      newShift.color === '' ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: '#f9fafb' }}
                    title="Sin Color"
                  >
                    <span className="text-xs text-gray-500">∅</span>
                  </button>
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewShift(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        newShift.color === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Seleccionado:</span>
                  <div 
                    className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center"
                    style={{ backgroundColor: newShift.color || '#f9fafb' }}
                  >
                    {!newShift.color && <span className="text-xs text-gray-500">∅</span>}
                  </div>
                  <span className="text-sm font-mono text-gray-500">{newShift.color || 'Sin Color'}</span>
                </div>
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