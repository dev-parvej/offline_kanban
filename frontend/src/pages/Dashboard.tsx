import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { KanbanBoard } from '../components/KanbanBoard';
import { Modal } from '../components/ui/Modal';
import { CreateTaskForm } from '../components/Tasks/CreateTaskForm';

interface DashboardProps {
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const handleCreateTask = async (taskData: any) => {
    // TODO: Implement task creation logic
    console.log('Creating task:', taskData);
    // This will be connected to the backend later
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="pt-6 px-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Board
            </h1>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your tasks and projects
            </p>
          </div>
          
          {/* Add Task Button */}
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* Kanban Board */}
        <KanbanBoard isDarkMode={isDarkMode} />
      </div>

      {/* Create Task Modal */}
      <Modal 
        isOpen={showCreateTaskModal} 
        onClose={() => setShowCreateTaskModal(false)}
        className="max-w-2xl"
        isDarkMode={isDarkMode}
      >
        <CreateTaskForm 
          isDarkMode={isDarkMode}
          onClose={() => setShowCreateTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      </Modal>
    </div>
  );
};