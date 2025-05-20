import React, { useState } from 'react';
import { ChevronDown, Plus, X, AlertCircle, Edit2, Trash2, Calendar, Users, Sliders, FileText, Download, Upload, Settings } from 'lucide-react';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import { ActiveView } from '../../App';

// NavigationButton Component
interface NavigationButtonProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  children,
  icon,
  className = '',
  onClick,
  active = false
}) => {
  return (
    <button
      onClick={onClick}
      className={`${active
        ? 'bg-[#1a1c19] text-white border-b-2 border-[#19b08d]'
        : 'text-gray-300 hover:text-white'}
      px-4 py-2 transition-all duration-300 flex items-center gap-2 text-sm font-medium whitespace-nowrap ${className}`}
    >
      {icon}
      <span className="font-['Viata']">{children}</span>
    </button>
  );
};

// SecondaryButton Component
interface SecondaryButtonProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'white' | 'transparent' | 'gradient';
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  className = '',
  onClick,
  variant = 'default'
}) => {
  const baseClasses = "px-4 py-2 rounded transition-all duration-300 flex items-center gap-2 text-sm font-medium font-['Viata']";

  let variantClasses = "";
  if (variant === 'white') {
    variantClasses = "bg-white text-gray-800 hover:bg-gray-50";
  } else if (variant === 'transparent') {
    variantClasses = "bg-transparent text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 border border-blue-500";
  } else if (variant === 'gradient') {
    variantClasses = "bg-gradient-to-r from-[#19b08d] to-[#117cee] text-white hover:opacity-90";
  } else {
    variantClasses = "bg-blue-500 text-white hover:bg-blue-600";
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

// Dropdown Component
interface DropdownProps {
  options: string[];
  value: string;
  onChange?: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-gray-800 px-4 py-2 rounded flex items-center shadow-sm border border-gray-200 font-['Viata'] text-sm"
      >
        {value}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute z-10 bg-white border border-gray-200 rounded mt-1 w-full shadow-lg overflow-hidden">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer font-['Viata'] text-sm"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// MainNavigation Component
interface MainNavigationProps {
  onViewChange: (view: ActiveView) => void;
  activeView: ActiveView;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ onViewChange, activeView }) => {
  return (
    <div className="flex justify-start items-center overflow-x-auto">
      <NavigationButton
        onClick={() => onViewChange('all')}
        active={activeView === 'all'}
        icon={<Calendar className="h-4 w-4" />}
      >
        All Schedule Software
      </NavigationButton>
      <NavigationButton
        onClick={() => onViewChange('employees')}
        active={activeView === 'employees'}
        icon={<Users className="h-4 w-4" />}
      >
        Add Employees
      </NavigationButton>
      <NavigationButton
        onClick={() => onViewChange('personnel')}
        active={activeView === 'personnel'}
        icon={<Users className="h-4 w-4" />}
      >
        Personnel per Shift
      </NavigationButton>
      <NavigationButton
        onClick={() => onViewChange('rules')}
        active={activeView === 'rules'}
        icon={<Sliders className="h-4 w-4" />}
      >
        Schedule Rules
      </NavigationButton>
      <NavigationButton
        onClick={() => onViewChange('schedule')}
        active={activeView === 'schedule'}
        icon={<Calendar className="h-4 w-4" />}
      >
        Employee Schedule
      </NavigationButton>
      <NavigationButton
        onClick={() => onViewChange('all')}
        active={false}
        icon={<Download className="h-4 w-4" />}
      >
        Export Data
      </NavigationButton>
      <NavigationButton
        onClick={() => onViewChange('all')}
        active={false}
        icon={<Upload className="h-4 w-4" />}
      >
        Import Data
      </NavigationButton>
    </div>
  );
};

// EditListModal Component
interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  onSave: (newName: string) => void;
  onDelete: () => void;
}

const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onClose,
  listName,
  onSave,
  onDelete,
}) => {
  const [newName, setNewName] = useState(listName);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        {!showDeleteConfirm ? (
          <>
            <h3 className="text-xl font-bold mb-6 font-['Viata']">Edit List</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-['Viata']">
                  List Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 font-['Viata']"
                />
              </div>

              <div className="flex justify-between gap-2 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2 transition-colors font-['Viata']"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete List
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-['Viata']"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSave(newName)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-['Viata']"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2 font-['Viata']">Delete List</h3>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-6">
                  <p className="text-red-700 font-medium mb-1 font-['Viata']">Warning:</p>
                  <p className="text-red-600 font-['Viata']">
                    Are you sure you want to delete this list? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-['Viata']"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-['Viata']"
                  >
                    Delete List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// SecondaryNavigation Component
const SecondaryNavigation: React.FC = () => {
  // Wrap in try/catch to prevent application crashing if context is not available yet
  let lists: any[] = [];
  let currentListId: string | null = null;
  let addList: (name: string) => void = () => {};
  let setCurrentList: (id: string) => void = () => {};
  let updateList: (id: string, data: any) => void = () => {};
  let removeList: (id: string) => void = () => {};
  
  try {
    const employeeListsContext = useEmployeeLists();
    lists = employeeListsContext.lists;
    currentListId = employeeListsContext.currentListId;
    addList = employeeListsContext.addList;
    setCurrentList = employeeListsContext.setCurrentList;
    updateList = employeeListsContext.updateList;
    removeList = employeeListsContext.removeList;
  } catch (error) {
    console.warn("EmployeeListsContext not available yet, using default values");
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = () => {
    if (newListName.trim()) {
      addList(newListName.trim());
      setNewListName('');
      setIsModalOpen(false);
    }
  };

  const currentList = lists.find(list => list.id === currentListId);

  const handleEditList = () => {
    if (!currentList) return;
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (newName: string) => {
    if (!currentList || !newName.trim()) return;
    updateList(currentList.id, { name: newName.trim() });
    setIsEditModalOpen(false);
  };

  const handleDeleteList = () => {
    if (!currentList) return;
    removeList(currentList.id);
    setIsEditModalOpen(false);
  };

  return (
    <div className="bg-white p-3 border-t border-gray-200 flex flex-wrap items-center gap-3">
      <SecondaryButton
        onClick={() => setIsModalOpen(true)}
        icon={<Plus className="h-4 w-4" />}
        variant="default"
      >
        Add New List
      </SecondaryButton>
      <div className="mx-2">
        <Dropdown
          options={lists.map(list => list.name)}
          value={lists.find(list => list.id === currentListId)?.name || ''}
          onChange={(value) => {
            const list = lists.find(l => l.name === value);
            if (list) setCurrentList(list.id);
          }}
        />
      </div>
      <SecondaryButton
        onClick={handleEditList}
        variant="transparent"
        icon={<Edit2 className="h-4 w-4" />}
      >
        Edit List
      </SecondaryButton>
      <SecondaryButton
        variant="transparent"
        icon={<Settings className="h-4 w-4" />}
      >
        Supervisory Panel
      </SecondaryButton>

      {/* Create New List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] relative shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-bold mb-6 font-['Viata']">Create New Employee List</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-['Viata']">
                  List Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                  className="w-full border border-gray-300 rounded px-3 py-2 font-['Viata']"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-['Viata']"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateList}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-['Viata']"
                >
                  Create List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit List Modal */}
      {isEditModalOpen && currentList && (
        <EditListModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          listName={currentList.name}
          onSave={handleSaveEdit}
          onDelete={handleDeleteList}
        />
      )}
    </div>
  );
};

// Main Header Component
interface HeaderProps {
  onViewChange: (view: ActiveView) => void;
}

const Header: React.FC<HeaderProps> = ({ onViewChange }) => {
  const [activeView, setActiveView] = useState<ActiveView>('all');

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    onViewChange(view);
  };

  return (
    <header className="w-full shadow-md">
      <div className="bg-[#1a1c19]">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 py-2 pr-4 mr-4 border-r border-gray-700">
              <div className="flex items-center">
                <span className="text-[#117cee] font-bold text-2xl font-['Viata']">W</span>
                <span className="text-[#19b08d] font-bold text-2xl font-['Viata']">A</span>
                <span className="text-[#19b08d] font-bold text-2xl font-['Viata'] mr-1">O</span>
                <span className="text-[#117cee] font-bold text-2xl font-['Viata']">K</span>
              </div>
            </div>
            <MainNavigation onViewChange={handleViewChange} activeView={activeView} />
          </div>
        </div>
      </div>
      <SecondaryNavigation />
    </header>
  );
};

export default Header;