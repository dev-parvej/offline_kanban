import React from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  UserCircleIcon,
  RectangleStackIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { DateRangePicker } from '../ui/DateRangePicker';
import { Checkbox } from '../ui/Checkbox';
import { Badge } from '../ui/Badge';
import { useUsers } from '../../hooks/useUsers';
import { useColumns } from '../../hooks/useColumns';
import { TaskListFilters as FilterType } from '../../types';

interface TaskListFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClose: () => void;
}

export const TaskListFilters: React.FC<TaskListFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const { users } = useUsers();
  const { columns } = useColumns();

  // User options
  const userOptions = [
    { value: '', label: 'All Users' },
    ...users.map(user => ({
      value: user.id.toString(),
      label: user.name
    }))
  ];

  // Column options
  const columnOptions = [
    { value: '', label: 'All Columns' },
    ...columns.filter(col => !col.is_archived).map(column => ({
      value: column.id.toString(),
      label: column.title
    }))
  ];

  // Priority options
  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'assigned_user_name', label: 'Assignee' },
    { value: 'column_title', label: 'Column' }
  ];

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      searchText: '',
      assigneeId: undefined,
      creatorId: undefined,
      columnId: undefined,
      priority: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      includeArchived: false,
      sortBy: 'updated_at',
      sortOrder: 'desc',
      limit: 50,
      offset: 0
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.assigneeId !== undefined,
    filters.creatorId !== undefined,
    filters.columnId !== undefined,
    filters.priority !== undefined,
    filters.status !== undefined,
    filters.dateFrom !== undefined,
    filters.dateTo !== undefined,
    filters.includeArchived
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
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
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assignee Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="inline h-4 w-4 mr-1" />
            Assignee
          </label>
          <Select
            value={filters.assigneeId?.toString() || ''}
            onChange={(value) => onFiltersChange({
              ...filters,
              assigneeId: value ? Number(value) : undefined,
              offset: 0
            })}
            options={userOptions}
            placeholder="Select assignee"
          />
        </div>

        {/* Creator Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCircleIcon className="inline h-4 w-4 mr-1" />
            Creator
          </label>
          <Select
            value={filters.creatorId?.toString() || ''}
            onChange={(value) => onFiltersChange({
              ...filters,
              creatorId: value ? Number(value) : undefined,
              offset: 0
            })}
            options={userOptions}
            placeholder="Select creator"
          />
        </div>

        {/* Column Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <RectangleStackIcon className="inline h-4 w-4 mr-1" />
            Column
          </label>
          <Select
            value={filters.columnId?.toString() || ''}
            onChange={(value) => onFiltersChange({
              ...filters,
              columnId: value ? Number(value) : undefined,
              offset: 0
            })}
            options={columnOptions}
            placeholder="Select column"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ExclamationTriangleIcon className="inline h-4 w-4 mr-1" />
            Priority
          </label>
          <Select
            value={filters.priority || ''}
            onChange={(value) => onFiltersChange({
              ...filters,
              priority: value || undefined,
              offset: 0
            })}
            options={priorityOptions}
            placeholder="Select priority"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            value={filters.status || ''}
            onChange={(value) => onFiltersChange({
              ...filters,
              status: value || undefined,
              offset: 0
            })}
            options={statusOptions}
            placeholder="Select status"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <div className="flex space-x-2">
            <Select
              value={filters.sortBy}
              onChange={(value) => onFiltersChange({
                ...filters,
                sortBy: value as string
              })}
              options={sortOptions}
              className="flex-1"
            />
            <Select
              value={filters.sortOrder}
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

      {/* Date Range Filter */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CalendarDaysIcon className="inline h-4 w-4 mr-1" />
          Date Range
        </label>
        <DateRangePicker
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={(dateFrom, dateTo) => onFiltersChange({
            ...filters,
            dateFrom,
            dateTo,
            offset: 0
          })}
          placeholder="Select date range"
        />
      </div>

      {/* Additional Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center">
            <Checkbox
              id="includeArchived"
              checked={filters.includeArchived}
              onChange={(e) => onFiltersChange({
                ...filters,
                includeArchived: e.target.checked,
                offset: 0
              })}
            />
            <label htmlFor="includeArchived" className="ml-2 text-sm text-gray-700">
              Include archived tasks
            </label>
          </div>
        </div>
      </div>

      {/* Results per page */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Results per page
        </label>
        <Select
          value={filters.limit?.toString() || '50'}
          onChange={(value) => onFiltersChange({
            ...filters,
            limit: Number(value),
            offset: 0
          })}
          options={[
            { value: '25', label: '25' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
            { value: '200', label: '200' }
          ]}
          className="w-24"
        />
      </div>

      {/* Apply Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
          </div>
          <Button
            variant="primary"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskListFilters;