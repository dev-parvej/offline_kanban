import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  ChatBubbleLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  canMove: boolean;
  isDragging?: boolean;
  isCompleted?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  canMove,
  isDragging = false,
  isCompleted = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDragActive,
  } = useDraggable({
    id: task.id,
    disabled: !canMove,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  // Check if task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`
        bg-white rounded-lg border border-gray-200 p-3 cursor-pointer
        transition-all duration-200 hover:shadow-md group
        ${isDragActive || isDragging ? 'shadow-lg rotate-2 z-50' : ''}
        ${!canMove ? 'cursor-default' : 'hover:-translate-y-0.5'}
        ${isCompleted ? 'opacity-75' : ''}
        ${isOverdue ? 'border-red-200 bg-red-50' : ''}
      `}
    >
      {/* Priority Indicator */}
      <div className="flex items-start justify-between mb-2">
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
        
        {/* Status Icons */}
        <div className="flex items-center space-x-1">
          {isCompleted && (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          )}
          {isOverdue && (
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className={`
        font-medium text-sm text-gray-900 mb-2 leading-tight
        ${isCompleted ? 'line-through text-gray-600' : ''}
      `}>
        {task.title}
      </h4>

      {/* Task Content Preview */}
      {task.content && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {task.content}
        </p>
      )}

      {/* Task Labels/Tags */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 2).map((label, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
          {task.labels.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{task.labels.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.due_date && (
        <div className={`
          flex items-center space-x-1 mb-2 text-xs
          ${isOverdue ? 'text-red-600' : 'text-gray-500'}
        `}>
          <CalendarDaysIcon className="h-3 w-3" />
          <span>
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Time Tracking */}
      {task.time_logged && task.time_logged > 0 && (
        <div className="flex items-center space-x-1 mb-2 text-xs text-gray-500">
          <ClockIcon className="h-3 w-3" />
          <span>{Math.round(task.time_logged / 60)}h logged</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center">
          {task.assigned_user ? (
            <Avatar
              src={task.assigned_user.avatar_url}
              name={task.assigned_user.name}
              size="sm"
              className="mr-2"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 mr-2 flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
        </div>

        {/* Comments Count */}
        <div className="flex items-center space-x-2">
          {task.comment_count > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <ChatBubbleLeftIcon className="h-3 w-3" />
              <span>{task.comment_count}</span>
            </div>
          )}

          {/* Priority Badge for Mobile */}
          <Badge 
            variant="secondary" 
            className="text-xs capitalize sm:hidden"
          >
            {task.priority}
          </Badge>
        </div>
      </div>

      {/* Drag Handle Indicator */}
      {canMove && !isDragActive && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      )}

      {/* Loading State Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg"></div>
      )}
    </div>
  );
};

export default TaskCard;