import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useBoard } from '../hooks/useBoard';
import { useAuth } from '../hooks/useAuth';
import { BoardColumn } from '../components/Board/BoardColumn';
import { TaskCard } from '../components/Board/TaskCard';
import { BoardFilters } from '../components/Board/BoardFilters';
import { CreateTaskModal } from '../components/Modals/CreateTaskModal';
import { TaskModal } from '../components/Modals/TaskModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Task, Column } from '../types';

export const BoardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    columns,
    tasks,
    filters,
    loading,
    moveTask,
    createTask,
    updateFilters,
    refreshBoard
  } = useBoard();

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.searchText || '');

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as number;
    const task = Object.values(tasks)
      .flat()
      .find(t => t.id === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as number;
    const newColumnId = over.id as number;
    
    // Find the task being moved
    const task = Object.values(tasks)
      .flat()
      .find(t => t.id === taskId);

    if (task && task.column_id !== newColumnId) {
      moveTask(taskId, newColumnId);
    }
    
    setActiveTask(null);
  };

  // Search handler with debounce
  useEffect(() => {
    const delayedUpdate = setTimeout(() => {
      updateFilters({ ...filters, searchText: searchQuery });
    }, 300);

    return () => clearTimeout(delayedUpdate);
  }, [searchQuery]);

  // Get active filter count
  const activeFilterCount = [
    filters.assigneeFilter !== 'all',
    filters.creatorFilter !== 'all',
    filters.quickFilters.length > 0,
    filters.searchText?.length > 0
  ].filter(Boolean).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Project Board
            </h1>
            <Badge variant="secondary" className="text-sm">
              {Object.values(tasks).flat().length} tasks
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="primary"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Create Task */}
            <Button
              variant="primary"
              onClick={() => setShowCreateTask(true)}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <BoardFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full overflow-x-auto">
              <div className="flex space-x-6 p-6 min-w-max">
                {columns.map((column) => (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    tasks={tasks[column.id] || []}
                    onTaskClick={setSelectedTask}
                    onCreateTask={() => setShowCreateTask(true)}
                    canManage={user?.is_root || false}
                  />
                ))}

                {/* Add Column Button (Root Only) */}
                {user?.is_root && (
                  <div className="w-80 flex-shrink-0">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-gray-400 text-gray-600"
                      onClick={() => {/* Open Create Column Modal */}}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Column
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  onClick={() => {}}
                  canMove={true}
                  isDragging={true}
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onSuccess={(task) => {
            setShowCreateTask(false);
            refreshBoard();
          }}
          defaultColumn={null}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={refreshBoard}
          canEdit={user?.is_root || selectedTask.created_by === user?.id}
        />
      )}
    </div>
  );
};

export default BoardPage;