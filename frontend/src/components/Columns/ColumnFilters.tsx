import React from 'react';
import { 
  XMarkIcon, 
  RectangleStackIcon,
  SwatchIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { ColumnFilters as FilterType } from '../../types';

interface ColumnFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClose: () => void;
}

export const ColumnFilters: React.FC<ColumnFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  // Task filter options
  const taskFilterOptions = [
    { value: 'all', label: 'All Columns' },
    { value: 'with-tasks', label: 'Columns with Tasks' },
    { value: 'empty', label: 'Empty Columns' },
    { value: 'over-wip', label: 'Over WIP Limit' }
  ];

  // Color filter options (common colors)
  const colorOptions = [
    { value: '', label: 'All Colors' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Yellow' },
    { value: '#EF4444', label: 'Red' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#F97316', label: 'Orange' },
    { value: '#06B6D4', label: 'Cyan' },
    { value: '#84CC16', label: 'Lime' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'title', label: 'Title' },
    { value: 'task_count', label: 'Task Count' },
    { value: 'position', label: 'Position' }
  ];

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      searchText: '',
      hasTasksFilter: 'all',
      colorFilter: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.hasTasksFilter && filters.hasTasksFilter !== 'all',
    filters.colorFilter && filters.colorFilter.length > 0
  ].filter(Boolean).length;

  // Quick filter options
  const quickFilters = [
    {
      id: 'empty-columns',
      label: 'Empty Columns',
      icon: RectangleStackIcon,
      description: 'Columns with no tasks',
      onClick: () => onFiltersChange({
        ...filters,
        hasTasksFilter: 'empty'
      })
    },
    {
      id: 'active-columns',
      label: 'Active with Tasks',
      icon: CheckCircleIcon,
      description: 'Non-archived columns that have tasks',
      onClick: () => onFiltersChange({
        ...filters,
        hasTasksFilter: 'with-tasks'
      })
    },
    {
      id: 'over-wip',
      label: 'Over WIP Limit',
      icon: ExclamationTriangleIcon,
      description: 'Columns exceeding their WIP limits',
      onClick: () => onFiltersChange({
        ...filters,
        hasTasksFilter: 'over-wip'
      })
    },
    {
      id: 'recently-created',
      label: 'Recently Created',
      icon: SwatchIcon,
      description: 'Columns created in the last 30 days',
      onClick: () => onFiltersChange({
        ...filters,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Column Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="primary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear all
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Task Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <RectangleStackIcon className="inline h-4 w-4 mr-1" />
            Tasks
          </label>
          <Select
            value={filters.hasTasksFilter || 'all'}
            onChange={(value) => onFiltersChange({
              ...filters,
              hasTasksFilter: value as any
            })}
            options={taskFilterOptions}
            placeholder="Filter by tasks"
          />
        </div>

        {/* Color Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SwatchIcon className="inline h-4 w-4 mr-1" />
            Color
          </label>
          <Select
            value={filters.colorFilter || ''}
            onChange={(value) => onFiltersChange({
              ...filters,
              colorFilter: value as string
            })}
            options={colorOptions.map(option => ({
              ...option,
              label: option.value ? (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: option.value }}
                  />
                  <span>{option.label}</span>
                </div>
              ) : option.label
            }))}
            placeholder="Filter by color"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <div className="flex space-x-2">
            <Select
              value={filters.sortBy || 'created_at'}
              onChange={(value) => onFiltersChange({
                ...filters,
                sortBy: value as string
              })}
              options={sortOptions}
              className="flex-1"
            />
            <Select
              value={filters.sortOrder || 'desc'}
              onChange={(value) => onFiltersChange({
                ...filters,
                sortOrder: value as string
              })}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' }
              ]}
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Filters
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickFilters.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              onClick={filter.onClick}
              className="justify-start h-auto p-3 text-left hover:bg-gray-50"
              title={filter.description}
            >
              <div className="flex items-center space-x-3">
                <filter.icon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {filter.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {filter.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Color Palette Quick Select */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Filter by Color
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFiltersChange({ ...filters, colorFilter: '' })}
            className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium
              ${!filters.colorFilter 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
              }
            `}
            title="All Colors"
          >
            All
          </button>
          {colorOptions.slice(1).map((color) => (
            <button
              key={color.value}
              onClick={() => onFiltersChange({ ...filters, colorFilter: color.value })}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${filters.colorFilter === color.value 
                  ? 'border-gray-800 scale-110 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied:
              </span>
              <div className="flex items-center space-x-2">
                {filters.hasTasksFilter && filters.hasTasksFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    Tasks: {filters.hasTasksFilter}
                  </Badge>
                )}
                {filters.colorFilter && (
                  <Badge variant="outline" className="text-xs flex items-center space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: filters.colorFilter }}
                    />
                    <span>Color</span>
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800"
            >
              Apply & Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnFilters;