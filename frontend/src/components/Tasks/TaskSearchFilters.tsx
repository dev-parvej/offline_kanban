import React, { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import FormGroup from '../ui/FormGroup';

interface TaskSearchFiltersProps {
  onFiltersChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
}

export interface TaskFilters {
  searchQuery: string;
  status: string; // 'all' | 'active' | 'archived'
  priority: string; // 'all' | 'low' | 'medium' | 'high' | 'urgent'
  column: string;
  assignee: string;
  dateFrom: string;
  dateTo: string;
  createdDateFrom: string;
  createdDateTo: string;
}

export const TaskSearchFilters: React.FC<TaskSearchFiltersProps> = ({
  onFiltersChange,
  onClearFilters
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<TaskFilters>({
    defaultValues: {
      searchQuery: '',
      status: 'all',
      priority: 'all',
      column: 'all',
      assignee: 'all',
      dateFrom: '',
      dateTo: '',
      createdDateFrom: '',
      createdDateTo: ''
    }
  });

  const watchedValues = watch();

  // Mock data - will be replaced with API calls
  const columns = [
    { id: 'col-1', name: 'To Do' },
    { id: 'col-2', name: 'In Progress' },
    { id: 'col-3', name: 'Done' }
  ];

  const users = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Emily Davis' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const handleSearch = (data: TaskFilters) => {
    onFiltersChange(data);
  };

  const handleClearAll = () => {
    reset();
    onClearFilters();
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = () => {
    return (
      watchedValues.searchQuery ||
      watchedValues.status !== 'all' ||
      watchedValues.priority !== 'all' ||
      watchedValues.column !== 'all' ||
      watchedValues.assignee !== 'all' ||
      watchedValues.dateFrom ||
      watchedValues.dateTo ||
      watchedValues.createdDateFrom ||
      watchedValues.createdDateTo
    );
  };

  // Auto-submit on form changes
  React.useEffect(() => {
    handleSubmit(handleSearch)();
  }, [watchedValues]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Search & Filter Tasks
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Advanced Filters
            <ChevronDownIcon 
              className={`h-4 w-4 ml-1 transition-transform ${
                showAdvancedFilters ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {hasActiveFilters() && (
            <Button
              type="button"
              onClick={handleClearAll}
              variant="secondary"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <form className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search Query */}
          <FormGroup label="Search in title and content">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                {...register('searchQuery')}
              />
            </div>
          </FormGroup>

          {/* Status Filter */}
          <FormGroup label="Status">
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              {...register('status')}
            >
              <option value="all">All Tasks</option>
              <option value="active">Active Tasks</option>
              <option value="archived">Archived Tasks</option>
            </select>
          </FormGroup>

          {/* Priority Filter */}
          <FormGroup label="Priority">
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              {...register('priority')}
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </FormGroup>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <FunnelIcon className="h-4 w-4 mr-2 text-gray-500" />
              Advanced Filters
            </h4>

            {/* Column and Assignee */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormGroup label="Column">
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  {...register('column')}
                >
                  <option value="all">All Columns</option>
                  {columns.map(column => (
                    <option key={column.id} value={column.id}>
                      {column.name}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup label="Assignee">
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  {...register('assignee')}
                >
                  <option value="all">All Users</option>
                  <option value="unassigned">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </FormGroup>
            </div>

            {/* Date Filters */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                Due Date Range
              </h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormGroup label="From Date">
                  <Input
                    type="date"
                    {...register('dateFrom')}
                  />
                </FormGroup>
                <FormGroup label="To Date">
                  <Input
                    type="date"
                    {...register('dateTo')}
                  />
                </FormGroup>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                Created Date Range
              </h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormGroup label="Created From">
                  <Input
                    type="date"
                    {...register('createdDateFrom')}
                  />
                </FormGroup>
                <FormGroup label="Created To">
                  <Input
                    type="date"
                    {...register('createdDateTo')}
                  />
                </FormGroup>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Active Filters:
            </h4>
            <div className="flex flex-wrap gap-2">
              {watchedValues.searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Search: "{watchedValues.searchQuery}"
                </span>
              )}
              {watchedValues.status !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Status: {watchedValues.status}
                </span>
              )}
              {watchedValues.priority !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Priority: {watchedValues.priority}
                </span>
              )}
              {watchedValues.column !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Column: {columns.find(c => c.id === watchedValues.column)?.name}
                </span>
              )}
              {watchedValues.assignee !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  Assignee: {watchedValues.assignee === 'unassigned' ? 'Unassigned' : users.find(u => u.id === watchedValues.assignee)?.name}
                </span>
              )}
              {(watchedValues.dateFrom || watchedValues.dateTo) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Due: {watchedValues.dateFrom || 'Any'} - {watchedValues.dateTo || 'Any'}
                </span>
              )}
              {(watchedValues.createdDateFrom || watchedValues.createdDateTo) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Created: {watchedValues.createdDateFrom || 'Any'} - {watchedValues.createdDateTo || 'Any'}
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};