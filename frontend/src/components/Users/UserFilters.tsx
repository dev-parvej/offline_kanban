import React from 'react';
import { 
  XMarkIcon, 
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { UserFilters as FilterType } from '../../types';

interface UserFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClose: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  // Role filter options
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'root', label: 'Root Users' },
    { value: 'normal', label: 'Normal Users' }
  ];

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'name', label: 'Name' },
    { value: 'username', label: 'Username' }
  ];

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      searchText: '',
      roleFilter: 'all',
      statusFilter: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.roleFilter && filters.roleFilter !== 'all',
    filters.statusFilter && filters.statusFilter !== 'all'
  ].filter(Boolean).length;

  // Quick filter options
  const quickFilters = [
    {
      id: 'active-root',
      label: 'Active Root Users',
      icon: ShieldCheckIcon,
      description: 'Root users who are currently active',
      onClick: () => onFiltersChange({
        ...filters,
        roleFilter: 'root',
        statusFilter: 'active'
      })
    },
    {
      id: 'active-normal',
      label: 'Active Normal Users',
      icon: UserIcon,
      description: 'Normal users who are currently active',
      onClick: () => onFiltersChange({
        ...filters,
        roleFilter: 'normal',
        statusFilter: 'active'
      })
    },
    {
      id: 'inactive-users',
      label: 'Inactive Users',
      icon: XCircleIcon,
      description: 'All users who are currently inactive',
      onClick: () => onFiltersChange({
        ...filters,
        statusFilter: 'inactive'
      })
    },
    {
      id: 'recently-created',
      label: 'Recently Created',
      icon: CheckCircleIcon,
      description: 'Users created in the last 30 days',
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
          <h3 className="font-medium text-gray-900">User Filters</h3>
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
        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ShieldCheckIcon className="inline h-4 w-4 mr-1" />
            Role
          </label>
          <Select
            value={filters.roleFilter || 'all'}
            onChange={(value) => onFiltersChange({
              ...filters,
              roleFilter: value as any
            })}
            options={roleOptions}
            placeholder="Select role"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CheckCircleIcon className="inline h-4 w-4 mr-1" />
            Status
          </label>
          <Select
            value={filters.statusFilter || 'all'}
            onChange={(value) => onFiltersChange({
              ...filters,
              statusFilter: value as any
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

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied:
              </span>
              <div className="flex items-center space-x-2">
                {filters.roleFilter && filters.roleFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    Role: {filters.roleFilter}
                  </Badge>
                )}
                {filters.statusFilter && filters.statusFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    Status: {filters.statusFilter}
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

export default UserFilters;