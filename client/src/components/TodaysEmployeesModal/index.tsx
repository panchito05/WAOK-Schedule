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
    // Close modal when clicking outside of it
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target instanceof Element && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col"
      >
        <div className="modal-header flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold">{title}</h2>
          
          {/* Navigation buttons */}
          {(onPreviousDay || onNextDay) && (
            <div className="navigation-buttons flex space-x-2">
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
            className="text-gray-500 hover:text-gray-700 focus:outline-none close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body p-4 overflow-y-auto">
          {children}
        </div>
        
        <div className="modal-footer border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodaysEmployeesModal;