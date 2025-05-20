import React, { useState } from 'react';
import ViewTodaysEmployeesModal from '../ViewTodaysEmployeesModal';

interface ViewTodaysEmployeesButtonProps {
  date: Date;
  className?: string;
}

const ViewTodaysEmployeesButton: React.FC<ViewTodaysEmployeesButtonProps> = ({ date, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors ${className}`}
      >
        View Today's Employees
      </button>
      
      <ViewTodaysEmployeesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialDate={date}
      />
    </>
  );
};

export default ViewTodaysEmployeesButton;