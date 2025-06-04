import React, { useState, useEffect } from 'react';

interface BlockShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  shiftTime: string;
  currentBlockedDays: string[];
  onSave: (blockedDays: string[]) => void;
}

const BlockShiftModal: React.FC<BlockShiftModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  shiftTime,
  currentBlockedDays,
  onSave
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(currentBlockedDays);
  const [selectAllDays, setSelectAllDays] = useState(false);

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  // Actualizar estado cuando cambian los días bloqueados actuales
  useEffect(() => {
    setSelectedDays(currentBlockedDays);
    // Verificar si todos los días están seleccionados
    const allDaysSelected = currentBlockedDays.includes('all') || 
      (currentBlockedDays.length === 7 && daysOfWeek.every(day => currentBlockedDays.includes(day.key)));
    setSelectAllDays(allDaysSelected);
  }, [currentBlockedDays]);

  const handleDayToggle = (dayKey: string) => {
    if (selectAllDays) {
      // Si "Todos los Días" está seleccionado, deseleccionarlo y seleccionar solo el día clickeado
      setSelectAllDays(false);
      setSelectedDays([dayKey]);
    } else {
      setSelectedDays(prev => {
        if (prev.includes(dayKey)) {
          return prev.filter(d => d !== dayKey);
        } else {
          const newSelection = [...prev, dayKey];
          // Si se seleccionan todos los días individuales, activar "Todos los Días"
          if (newSelection.length === 7) {
            setSelectAllDays(true);
            return ['all'];
          }
          return newSelection;
        }
      });
    }
  };

  const handleSelectAllToggle = () => {
    if (selectAllDays) {
      // Deseleccionar todos
      setSelectAllDays(false);
      setSelectedDays([]);
    } else {
      // Seleccionar todos
      setSelectAllDays(true);
      setSelectedDays(['all']);
    }
  };

  const handleSave = () => {
    // Validación: al menos un día debe estar seleccionado o ninguno para desbloquear
    onSave(selectedDays);
  };

  const handleCancel = () => {
    // Restaurar estado original
    setSelectedDays(currentBlockedDays);
    const allDaysSelected = currentBlockedDays.includes('all') || 
      (currentBlockedDays.length === 7 && daysOfWeek.every(day => currentBlockedDays.includes(day.key)));
    setSelectAllDays(allDaysSelected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Bloquear Turno</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Employee and Shift Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Empleado:</span> {employeeName}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Turno:</span> {shiftTime}
          </p>
        </div>

        {/* Select All Days Option */}
        <div className="mb-4">
          <label className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={selectAllDays}
              onChange={handleSelectAllToggle}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-semibold text-gray-800">Todos los Días</span>
          </label>
        </div>

        {/* Individual Days */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Días específicos:</h3>
          <div className="grid grid-cols-2 gap-2">
            {daysOfWeek.map((day) => {
              const isSelected = selectAllDays || selectedDays.includes(day.key);
              const isDisabled = selectAllDays;
              
              return (
                <label
                  key={day.key}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                    isDisabled 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleDayToggle(day.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Current Selection Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Selección actual:</span>
            {selectedDays.length === 0 && ' Ningún día (turno desbloqueado)'}
            {selectAllDays && ' Todos los días de la semana'}
            {!selectAllDays && selectedDays.length > 0 && ` ${selectedDays.length} día${selectedDays.length > 1 ? 's' : ''} seleccionado${selectedDays.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockShiftModal;