import React, { useState } from 'react';
import { 
  ChevronUpIcon,
  ChevronDownIcon,
  ChatBubbleLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { Checkbox } from '../ui/Checkbox';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { DropdownMenu } from '../ui/DropdownMenu';
import { useUsers } from '../../hooks/useUsers';
import { useColumns } from '../../hooks/useColumns';
import { Task } from '../../types';

interface TaskListTableProps {
  tasks: Task[];
  selectedTasks: number[];
  sortBy: string;
  sortOrder: string;
  canManage: boolean;
  onTaskClick: (task: Task) => void;
  onSelectTask: (taskId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onSort: (field: string) => void;
  onMoveTask?: (taskId: number, columnId: number) => void;
  onAssignTask?: (taskId: number, assigneeId: number | null) => void;
  onArchiveTask?: (taskId: number) => void;
}

export const TaskListTable: React.FC<TaskListTableProps> = ({
  tasks,
  selectedTasks,
  sortBy,
  sortOrder,
  canManage,
  onTaskClick,
  onSelectTask,
  onSelectAll,
  onSort,
  onMoveTask,
  onAssignTask,
  onArchiveTask
}) => {
  const { users } = useUsers();
  const { columns } = useColumns();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const someSelected = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Sort header component
  const SortHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === field && (
          sortOrder === 'asc' ? 
            <ChevronUpIcon className="h-3 w-3" /> : 
            <ChevronDownIcon className="h-3 w-3" />
        )}
      </div>
    </th>
  );

  // Toggle row expansion
  const toggleRowExpansion = (taskId: number) => {
    setExpandedRows(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Assignee options
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map(user => ({ value: user.id.toString(), label: user.name }))
  ];

  // Column options
  const columnOptions = columns.map(column => ({
    value: column.id.toString(),
    label: column.title
  }));

  return (
    <div className="bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Select All Checkbox */}
              <th className="px-6 py-3 w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>

              {/* Expand Column */}
              <th className="px-2 py-3 w-8"></th>

              {/* Task Details */}
              <SortHeader field="title">Task</SortHeader>
              <SortHeader field="column_title">Column</SortHeader>
              <SortHeader field="assigned_user_name">Assignee</SortHeader>
              <SortHeader field="created_by_user_name">Creator</SortHeader>
              <SortHeader field="priority">Priority</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comments
              </th>
              <SortHeader field="due_date">Due Date</SortHeader>
              <SortHeader field="created_at">Created</SortHeader>
              <SortHeader field="updated_at">Updated</SortHeader>
              
              {/* Actions */}
              {canManage && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => {
              const isExpanded = expandedRows.includes(task.id);
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              
              return (
                <React.Fragment key={task.id}>
                  {/* Main Row */}
                  <tr className={`
                    hover:bg-gray-50 transition-colors
                    ${selectedTasks.includes(task.id) ? 'bg-blue-50' : ''}
                    ${isOverdue ? 'border-l-4 border-red-400' : ''}
                  `}>
                    {/* Select Checkbox */}
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onChange={(e) => onSelectTask(task.id, e.target.checked)}
                      />
                    </td>

                    {/* Expand Button */}
                    <td className="px-2 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(task.id)}
                        className="p-1"
                      >
                        {isExpanded ? 
                          <ChevronDownIcon className="h-3 w-3" /> : 
                          <ChevronUpIcon className="h-3 w-3" />
                        }
                      </Button>
                    </td>

                    {/* Task Title & Content */}
                    <td className="px-6 py-4 max-w-xs">
                      <div 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => onTaskClick(task)}
                      >
                        <div className="font-medium text-gray-900 truncate">
                          {task.title}
                        </div>
                        {task.content && (
                          <div className="text-sm text-gray-500 truncate mt-1">
                            {task.content}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canManage && onMoveTask ? (
                        <Select
                          value={task.column_id.toString()}
                          onChange={(value) => onMoveTask(task.id, Number(value))}
                          options={columnOptions}
                          className="min-w-[120px]"
                        />
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {task.column?.title}
                        </Badge>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canManage && onAssignTask ? (
                        <Select
                          value={task.assigned_to?.toString() || ''}
                          onChange={(value) => onAssignTask(
                            task.id, 
                            value ? Number(value) : null
                          )}
                          options={assigneeOptions}
                          className="min-w-[120px]"
                        />
                      ) : task.assigned_user ? (
                        <div className="flex items-center">
                          <Avatar
                            src={task.assigned_user.avatar_url}
                            name={task.assigned_user.name}
                            size="sm"
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-900">
                            {task.assigned_user.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>

                    {/* Creator */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={task.created_by_user?.avatar_url}
                          name={task.created_by_user?.name || 'Unknown'}
                          size="sm"
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900">
                          {task.created_by_user?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`text-xs capitalize ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`text-xs capitalize ${getStatusColor(task.status)}`}>
                        {task.status}
                      </Badge>
                    </td>

                    {/* Comments */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.comment_count > 0 ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                          {task.comment_count}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.due_date ? (
                        <div className={`flex items-center text-sm ${
                          isOverdue ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {new Date(task.due_date).toLocaleDateString()}
                          {isOverdue && (
                            <Badge variant="danger" className="ml-2 text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>

                    {/* Updated Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.updated_at).toLocaleDateString()}
                    </td>

                    {/* Actions (Root Only) */}
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="sm" className="p-1">
                              <EllipsisHorizontalIcon className="h-4 w-4" />
                            </Button>
                          }
                          items={[
                            {
                              label: 'View Details',
                              icon: EyeIcon,
                              onClick: () => onTaskClick(task)
                            },
                            ...(onArchiveTask && task.status !== 'archived' ? [{
                              label: 'Archive Task',
                              onClick: () => onArchiveTask(task.id),
                              variant: 'danger' as const
                            }] : [])
                          ]}
                          align="right"
                        />
                      </td>
                    )}
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={canManage ? 13 : 12} className="px-6 py-4">
                        <div className="space-y-3">
                          {/* Full Content */}
                          {task.content && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                Description
                              </h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {task.content}
                              </p>
                            </div>
                          )}

                          {/* Time Tracking */}
                          {task.time_logged && task.time_logged > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                Time Logged
                              </h4>
                              <div className="flex items-center text-sm text-gray-600">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {Math.round(task.time_logged / 60)}h {task.time_logged % 60}m
                              </div>
                            </div>
                          )}

                          {/* Labels */}
                          {task.labels && task.labels.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                Labels
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {task.labels.map((label, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dates */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                            <div>
                              <span className="font-medium">Created:</span><br />
                              {new Date(task.created_at).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Updated:</span><br />
                              {new Date(task.updated_at).toLocaleString()}
                            </div>
                            {task.completed_at && (
                              <div>
                                <span className="font-medium">Completed:</span><br />
                                {new Date(task.completed_at).toLocaleString()}
                              </div>
                            )}
                            {task.archived_at && (
                              <div>
                                <span className="font-medium">Archived:</span><br />
                                {new Date(task.archived_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskListTable;