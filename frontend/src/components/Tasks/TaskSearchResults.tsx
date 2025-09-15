import React from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  ArchiveBoxIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';


interface TaskSearchResultsProps {
  tasks: any[];
  loading: boolean;
  onViewTask: (task: any) => void;
  onEditTask: (task: any) => void;
  onArchiveTask: (task: any) => void;
}

export const TaskSearchResults: React.FC<TaskSearchResultsProps> = ({
  tasks,
  loading,
  onViewTask,
  onEditTask,
  onArchiveTask
}) => {
  const { isDarkMode } = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getUserInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Searching tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-12 text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or filters to find more tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Search Results
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found
          </span>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Column
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {/* Task Column */}
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {task.title}
                    </div>
                    {task.content && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {truncateContent(task.content)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status === 'active' ? 'Active' : 'Archived'}
                  </span>
                </td>

                {/* Priority Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </td>

                {/* Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-gray-300">
                    <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {task.columnName}
                  </div>
                </td>

                {/* Assignee Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.assigneeName ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                            {getUserInitials(task.assigneeName)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {task.assigneeName}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Unassigned
                    </div>
                  )}
                </td>

                {/* Dates Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300 space-y-1">
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs">Created: {formatDate(task.createdAt)}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs">Due: {formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Updated: {formatDate(task.updatedAt)}
                    </div>
                  </div>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {/* View Button */}
                    <button
                      onClick={() => onViewTask(task)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View Task"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    {/* Archive Button */}
                    <button
                      onClick={() => onArchiveTask(task)}
                      className={`p-2 rounded-lg transition-colors ${
                        task.status === 'active'
                          ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={task.status === 'active' ? 'Archive Task' : 'Unarchive Task'}
                    >
                      <ArchiveBoxIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      {tasks.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{tasks.length}</span> of{' '}
              <span className="font-medium">{tasks.length}</span> results
            </div>
            {/* Pagination controls would go here */}
          </div>
        </div>
      )}
    </div>
  );
};