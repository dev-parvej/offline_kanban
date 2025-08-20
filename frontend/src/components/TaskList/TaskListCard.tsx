import React from 'react';
import { 
  ChatBubbleLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Checkbox } from '../ui/Checkbox';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Task } from '../../types';

interface TaskListCardProps {
  task: Task;
  isSelected: boolean;
  canManage: boolean;
  onTaskClick: (task: Task) => void;
  onSelect: (checked: boolean) => void;
  onMoveTask?: (taskId: number, columnId: number) => void;
  onAssignTask?: (taskId: number, assigneeId: number | null) => void;
}

export const TaskListCard: React.FC<TaskListCardProps> = ({
  task,
  isSelected,
  canManage,
  onTaskClick,
  onSelect,
  onMoveTask,
  onAssignTask
}) => {
  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  // Status color mapping
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Check if task is overdue
  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'completed';

  return (
    <div className={`
      bg-white rounded-lg border-2 p-4 transition-all duration-200
      ${isSelected ? 'border-blue-500 shadow-md' : getPriorityColor(task.priority)}
      ${isOverdue ? 'ring-2 ring-red-200' : ''}
      hover:shadow-lg group
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />
          
          {/* Priority Dot */}
          <div className={`
            w-3 h-3 rounded-full
            ${task.priority === 'urgent' ? 'bg-red-500' :
              task.priority === 'high' ? 'bg-orange-500' :
              task.priority === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'}
          `} />
        </div>

        {/* Actions Menu */}
        {canManage && (
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 p-1"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: 'View Details',
                icon: EyeIcon,
                onClick: () => onTaskClick(task)
              }
            ]}
            align="right"
          />
        )}
      </div>

      {/* Task Title */}
      <h3 
        className="font-medium text-gray-900 mb-2 cursor-pointer hover:text-blue-600 leading-tight"
        onClick={() => onTaskClick(task)}
      >
        {task.title}
      </h3>

      {/* Task Content Preview */}
      {task.content && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {task.content}
        </p>
      )}

      {/* Column Badge */}
      <div className="mb-3">
        <Badge variant="outline" className="text-xs">
          {task.column?.title}
        </Badge>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
          {task.labels.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{task.labels.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Due Date & Time Logged */}
      <div className="space-y-2 mb-3">
        {/* Due Date */}
        {task.due_date && (
          <div className={`
            flex items-center space-x-1 text-xs
            ${isOverdue ? 'text-red-600' : 'text-gray-500'}
          `}>
            <CalendarDaysIcon className="h-3 w-3" />
            <span>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {new Date(task.due_date).toLocaleDateString()}
            </span>
            {isOverdue && (
              <Badge variant="danger" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        )}

        {/* Time Logged */}
        {task.time_logged && task.time_logged > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <ClockIcon className="h-3 w-3" />
            <span>{Math.round(task.time_logged / 60)}h logged</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Assignee */}
        <div className="flex items-center">
          {task.assigned_user ? (
            <div className="flex items-center space-x-2">
              <Avatar
                src={task.assigned_user.avatar_url}
                name={task.assigned_user.name}
                size="sm"
              />
              <span className="text-xs text-gray-600">
                {task.assigned_user.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-400">?</span>
              </div>
              <span className="text-xs text-gray-400">Unassigned</span>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          <Badge className={`text-xs capitalize ${getStatusBadgeColor(task.status)}`}>
            {task.status}
          </Badge>

          {/* Comments Count */}
          {task.comment_count > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <ChatBubbleLeftIcon className="h-3 w-3" />
              <span>{task.comment_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Created By (Bottom) */}
      <div className="mt-2 pt-2 border-t border-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <span>By</span>
            <Avatar
              src={task.created_by_user?.avatar_url}
              name={task.created_by_user?.name || 'Unknown'}
              size="xs"
            />
            <span>{task.created_by_user?.name || 'Unknown'}</span>
          </div>
          <span>{new Date(task.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskListCard;