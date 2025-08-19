import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  PlusIcon, 
  EllipsisHorizontalIcon,
  ArchiveBoxIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { TaskCard } from './TaskCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Column, Task } from '../../types';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (columnId: number) => void;
  canManage: boolean;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  tasks,
  onTaskClick,
  onCreateTask,
  canManage
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Count tasks by status
  const activeTasks = tasks.filter(task => task.status === 'active');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Column menu items (root only)
  const menuItems = canManage ? [
    {
      label: 'Edit Column',
      icon: PencilIcon,
      onClick: () => {/* Open Edit Column Modal */}
    },
    {
      label: 'Archive Column',
      icon: ArchiveBoxIcon,
      onClick: () => {/* Open Archive Confirmation */},
      variant: 'danger' as const
    }
  ] : [];

  return (
    <div className="w-80 flex-shrink-0">
      <div 
        ref={setNodeRef}
        className={`
          bg-white rounded-lg border border-gray-200 h-full flex flex-col
          ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''}
        `}
      >
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Column Color Indicator */}
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm">
                {column.title}
              </h3>
              {column.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {column.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Task Count Badge */}
            <Badge variant="secondary" className="text-xs">
              {activeTasks.length}
              {completedTasks.length > 0 && (
                <span className="text-green-600">
                  +{completedTasks.length}
                </span>
              )}
            </Badge>

            {/* Column Menu (Root Only) */}
            {canManage && (
              <DropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </Button>
                }
                items={menuItems}
                align="right"
              />
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {activeTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-3">
                No tasks in this column
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateTask(column.id)}
                className="text-blue-600"
              >
                Create your first task
              </Button>
            </div>
          ) : (
            <>
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  canMove={canManage || task.assigned_to === null} // Simplified for now
                />
              ))}
              
              {/* Completed Tasks (Collapsed) */}
              {completedTasks.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                      <span className="group-open:rotate-90 transition-transform">
                        ▶
                      </span>
                      <span>Completed ({completedTasks.length})</span>
                    </summary>
                    <div className="mt-3 space-y-2">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={onTaskClick}
                          canMove={false}
                          isCompleted={true}
                        />
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Task Button */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={() => onCreateTask(column.id)}
            className="w-full justify-start text-gray-600 hover:text-gray-800"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoardColumn;