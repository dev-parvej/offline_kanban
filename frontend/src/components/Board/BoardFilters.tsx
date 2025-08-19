import React from 'react';
import { XMarkIcon, UserIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useUsers } from '../../hooks/useUsers';
import { BoardFilter } from '../../types';

interface BoardFiltersProps {
  filters: BoardFilter;
  onFiltersChange: (filters: BoardFilter) => void;
  onClose: () => void;
}

export const BoardFilters: React.FC<BoardFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const { users } = useUsers();

  // Quick filter options
  const quickFilterOptions = [
    { id: 'my-tasks', label: 'My Tasks', description: 'Tasks assigned to me' },
    { id: 'unassigned', label: 'Unassigned', description: 'Tasks without assignee' },
    { id: 'high-priority', label: 'High Priority', description: 'High and urgent tasks' },
    { id: 'overdue', label: 'Overdue', description: 'Tasks past due date' },
    { id: 'due-soon', label: 'Due Soon', description: 'Due in next 7 days' }
  ];

  // Assignee options
  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    { value: 'me', label: 'Assigned to me' },
    ...users.map(user => ({
      value: `user:${user.id}`,
      label: user.name
    }))
  ];

  // Creator options
  const creatorOptions = [
    { value: 'all', label: 'All Creators' },
    { value: 'me', label: 'Created by me' },
    ...users.map(user => ({
      value: `user:${user.id}`,
      label: user.name
    }))
  ];

  // Handle quick filter toggle
  const toggleQuickFilter = (filterId: string) => {
    const newQuickFilters = filters.quickFilters.includes(filterId)
      ? filters.quickFilters.filter(id => id !== filterId)
      : [...filters.quickFilters, filterId];
    
    onFiltersChange({
      ...filters,
      quickFilters: newQuickFilters
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      searchText: '',
      assigneeFilter: 'all',
      creatorFilter: 'all',
      quickFilters: []
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.assigneeFilter !== 'all',
    filters.creatorFilter !== 'all',
    filters.quickFilters.length > 0
  ].filter(Boolean).length;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Filters</h3>
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
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear all
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Assignee Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="inline h-4 w-4 mr-1" />
            Assignee
          </label>
          <Select
            value={filters.assigneeFilter}
            onChange={(value) => onFiltersChange({
              ...filters,
              assigneeFilter: value as any
            })}
            options={assigneeOptions}
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
            value={filters.creatorFilter}
            onChange={(value) => onFiltersChange({
              ...filters,
              creatorFilter: value as any
            })}
            options={creatorOptions}
            placeholder="Select creator"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <Select
            value={filters.priorityFilter || 'all'}
            onChange={(value) => onFiltersChange({
              ...filters,
              priorityFilter: value === 'all' ? undefined : value as any
            })}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
            placeholder="Select priority"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {quickFilterOptions.map((option) => {
            const isActive = filters.quickFilters.includes(option.id);
            return (
              <Button
                key={option.id}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleQuickFilter(option.id)}
                className="text-sm"
                title={option.description}
              >
                {option.label}
                {isActive && (
                  <XMarkIcon className="h-3 w-3 ml-1" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
            </span>
            <Button
              variant="ghost"
              size="sm"
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

export default BoardFilters;