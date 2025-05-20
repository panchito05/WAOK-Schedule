import React, { useEffect, useRef } from 'react';

interface TodaysEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
}

const TodaysEmployeesModal: React.FC<TodaysEmployeesModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onPreviousDay,
  onNextDay
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Agregar event listener para cerrar el modal al hacer clic fuera de él
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Agregar event listener para cerrar el modal con la tecla Escape
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="relative w-11/12 max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-lg flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          
          {(onPreviousDay || onNextDay) && (
            <div className="flex space-x-2">
              {onPreviousDay && (
                <button
                  onClick={onPreviousDay}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  ← Previous Day
                </button>
              )}
              {onNextDay && (
                <button
                  onClick={onNextDay}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  Next Day →
                </button>
              )}
            </div>
          )}
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodaysEmployeesModal;