import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  EyeIcon,
  Bars3Icon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Column } from '../../types';

interface SortableColumnItemProps {
  column: Column;
  index: number;
  onView: (column: Column) => void;
}

export const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  index,
  onView
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const totalTasks = column.task_count || 0;
  const completedTasks = column.completed_task_count || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg border-2 p-4 transition-all duration-200
        ${isDragging ? 'shadow-lg border-blue-500 rotate-2 z-50' : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      <div className="flex items-center space-x-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <Bars3Icon className="h-5 w-5" />
        </div>

        {/* Position Number */}
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
          {index + 1}
        </div>

        {/* Column Color */}
        <div 
          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: column.color }}
        />

        {/* Column Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-gray-900 truncate">
              {column.title}
            </h3>
            
            {/* Task Count Badge */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                <RectangleStackIcon className="h-3 w-3" />
                <span>{totalTasks}</span>
              </Badge>
              
              {completedTasks > 0 && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  {completedTasks} done
                </Badge>
              )}
            </div>
          </div>
          
          {column.description && (
            <p className="text-sm text-gray-500 truncate mt-1">
              {column.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* WIP Limit Indicator */}
          {column.wip_enabled && column.wip_limit && (
            <Badge 
              variant={
                (totalTasks - completedTasks) > column.wip_limit 
                  ? "danger" 
                  : "outline"
              }
              className="text-xs"
            >
              WIP: {totalTasks - completedTasks}/{column.wip_limit}
            </Badge>
          )}

          {/* View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(column)}
            className="opacity-70 hover:opacity-100"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mt-3 ml-12">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default SortableColumnItem;