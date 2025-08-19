import React from 'react';
import { 
  EyeIcon,
  PencilIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  EllipsisHorizontalIcon,
  RectangleStackIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Column } from '../../types';

interface ColumnCardProps {
  column: Column;
  onEdit: (column: Column) => void;
  onView: (column: Column) => void;
  onArchive: (column: Column) => void;
  onUnarchive: (column: Column) => void;
  isArchived: boolean;
}

export const ColumnCard: React.FC<ColumnCardProps> = ({
  column,
  onEdit,
  onView,
  onArchive,
  onUnarchive,
  isArchived
}) => {
  // Get task statistics
  const totalTasks = column.task_count || 0;
  const completedTasks = column.completed_task_count || 0;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get card border color based on column color
  const getCardStyle = () => ({
    borderLeft: `4px solid ${column.color}`,
  });

  return (
    <div 
      className={`
        bg-white rounded-lg border-2 border-gray-200 p-4 transition-all duration-200 hover:shadow-lg group
        ${isArchived ? 'opacity-75 bg-gray-50' : ''}
      `}
      style={getCardStyle()}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Color Indicator */}
          <div 
            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          
          <div className="flex-1 min-w-0">
            <h3 
              className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={() => onView(column)}
            >
              {column.title}
            </h3>
            {column.description && (
              <p className="text-sm text-gray-500 truncate mt-1">
                {column.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 p-1 flex-shrink-0"
            >
              <EllipsisHorizontalIcon className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              label: 'View Details',
              icon: EyeIcon,
              onClick: () => onView(column)
            },
            {
              label: 'Edit Column',
              icon: PencilIcon,
              onClick: () => onEdit(column)
            },
            {
              label: isArchived ? 'Unarchive Column' : 'Archive Column',
              icon: isArchived ? ArchiveBoxXMarkIcon : ArchiveBoxIcon,
              onClick: () => isArchived ? onUnarchive(column) : onArchive(column),
              variant: isArchived ? 'default' as const : 'danger' as const
            }
          ]}
          align="right"
        />
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <Badge className={`text-xs ${
          isArchived 
            ? 'bg-red-100 text-red-800 border-red-200' 
            : 'bg-green-100 text-green-800 border-green-200'
        }`}>
          {isArchived ? (
            <>
              <ArchiveBoxIcon className="h-3 w-3 mr-1" />
              Archived
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Active
            </>
          )}
        </Badge>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {totalTasks}
          </div>
          <div className="text-xs text-gray-500">Total Tasks</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {completedTasks}
          </div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>

      {/* Completion Progress */}
      {totalTasks > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* WIP Limit (if enabled) */}
      {column.wip_enabled && column.wip_limit && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">WIP Limit</span>
            <Badge 
              variant={activeTasks > column.wip_limit ? "danger" : "secondary"}
              className="text-xs"
            >
              {activeTasks} / {column.wip_limit}
            </Badge>
          </div>
          {activeTasks > column.wip_limit && (
            <div className="text-xs text-red-600 mt-1">
              ⚠ Over limit by {activeTasks - column.wip_limit}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Indicator */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <ClockIcon className="h-3 w-3" />
          <span>Recent Activity</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-600 truncate">
              Task completed
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-xs text-gray-600 truncate">
              New task added
            </span>
          </div>
        </div>
      </div>

      {/* Created By */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-3 w-3" />
            <span>Created by</span>
            <Avatar
              src={column.created_by_user?.avatar_url}
              name={column.created_by_user?.name || 'Unknown'}
              size="xs"
            />
            <span className="truncate">
              {column.created_by_user?.name || 'Unknown'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{new Date(column.created_at).toLocaleDateString()}</span>
          {isArchived && column.archived_at && (
            <span className="text-red-600">
              Archived {new Date(column.archived_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(column)}
          className="flex-1 text-xs"
        >
          <EyeIcon className="h-3 w-3 mr-1" />
          View
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(column)}
          className="flex-1 text-xs"
        >
          <PencilIcon className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>

      {/* Archive/Unarchive Button */}
      <div className="mt-2">
        <Button
          variant={isArchived ? "primary" : "danger"}
          size="sm"
          onClick={() => isArchived ? onUnarchive(column) : onArchive(column)}
          className="w-full text-xs"
        >
          {isArchived ? (
            <>
              <ArchiveBoxXMarkIcon className="h-3 w-3 mr-1" />
              Unarchive Column
            </>
          ) : (
            <>
              <ArchiveBoxIcon className="h-3 w-3 mr-1" />
              Archive Column
            </>
          )}
        </Button>
      </div>

      {/* Task Warning */}
      {!isArchived && totalTasks > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <div className="flex items-start space-x-1">
            <span>⚠</span>
            <span>
              This column has {totalTasks} task{totalTasks !== 1 ? 's' : ''}. 
              Archiving will move them to the first column.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnCard;