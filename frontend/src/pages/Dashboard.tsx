import React, { useState, useRef } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { KanbanBoard } from '../components/KanbanBoard';
import { Modal } from '../components/ui/Modal';
import { CreateTaskForm } from '../components/Tasks/CreateTaskForm';

export const Dashboard: React.FC = () => {
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const kanbanRef = useRef<{ refresh: () => void }>(null);

  const handleCreateTask = async (taskData: any) => {
    console.log('Task created:', taskData);
    // Refresh the kanban board to show the new task
    if (kanbanRef.current) {
      kanbanRef.current.refresh();
    }
    setShowCreateTaskModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-6 px-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Board
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Manage your tasks and projects
            </p>
          </div>
          
          {/* Add Task Button */}
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="flex items-center px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* Kanban Board */}
        <KanbanBoard ref={kanbanRef} />
      </div>

      {/* Create Task Modal */}
      <Modal 
        isOpen={showCreateTaskModal} 
        onClose={() => setShowCreateTaskModal(false)}
        className="max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full"
      >
        <CreateTaskForm 
          onClose={() => setShowCreateTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      </Modal>
    </div>
  );
};