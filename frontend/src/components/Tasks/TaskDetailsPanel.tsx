import React, { useState, useEffect } from 'react';
import { ArrowUpIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { Column } from '../../api/columnService';
import { SearchSelect, Option } from '../ui/Input';
import { updateTask } from '../../api/taskService';
import { getUserInitials } from '../../util/user';
import { searchUsers, getInitialUsers, UserSearchResult } from '../../api/userService';

interface TaskDetailsPanelProps {
  task: {
    id: string | number;
    title: string;
    content?: {
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      databaseId: number,
      column_id: number,
      full: { [p: string]: any }
    };
    parentId: string;
  };
  columns?: Column[];
  column?: Column;
  onTaskUpdate?: (taskId: number, updates: any) => void;
}

export const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({ 
  task, 
  columns, 
  column,
  onTaskUpdate
}) => {
  const { isDarkMode } = useTheme();
  const [statusEditableMode, setStatusEditableMode] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | undefined>(column);
  const [assigneeEditMode, setAssigneeEditMode] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<UserSearchResult | undefined>(
    task.content?.full?.assigned_user
  );

  const getUserName = () => {
    return task.content?.full?.assigned_user?.name || task.content?.full?.assigned_user?.root;
  };

  const getColumnName = (columnId: number) => {
    const column = columns?.find(col => col.id === columnId);
    return column?.title;
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <ArrowUpIcon className="w-4 h-4 text-red-500" />;
      case 'high':
        return <ArrowUpIcon className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <MinusIcon className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <ArrowUpIcon className="w-4 h-4 text-green-500 rotate-180" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'Highest';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'None';
    }
  };

  const saveStatus = async (col: Column) => {
    try {
      await updateTask(task.content?.databaseId as number, { 
        column_id: col?.id as number 
      });
      
      // Notify parent component of the update
      onTaskUpdate?.(task.content?.databaseId as number, { column_id: col?.id });
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Reset to previous column on error
      setSelectedColumn(column);
      // TODO: Show error message to user
    }
  };

  const handleUserSearch = async (query: string): Promise<Option[]> => {
    if (query.trim() === '') {
      const initialUsers = await getInitialUsers();
      return initialUsers.map(user => ({
        value: user.id.toString(),
        label: user.name || user.username
      }));
    }
    
    const users = await searchUsers(query);
    return users.map(user => ({
      value: user.id.toString(),
      label: user.name || user.username
    }));
  };

  const handleAssigneeChange = async (option: Option) => {
    try {
      await updateTask(task.content?.databaseId as number, { 
        assigned_to: parseInt(option.value)
      });
      
      // Update local state
      const newAssignee: UserSearchResult = {
        id: parseInt(option.value),
        username: option.label,
        name: option.label
      };
      setSelectedAssignee(newAssignee);
      setAssigneeEditMode(false);
      
      // Notify parent component of the update
      onTaskUpdate?.(task.content?.databaseId as number, { 
        assigned_to: parseInt(option.value),
        assigned_user: newAssignee
      });
    } catch (error) {
      console.error('Failed to update task assignee:', error);
      // TODO: Show error message to user
      setAssigneeEditMode(false);
    }
  };

  return (
    <div className={`w-80 border-l overflow-y-auto ${
      isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="p-6 space-y-6">
        
        {/* Status */}
        <div>
          <label className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Status
          </label>
          {!statusEditableMode ? (
            <div className={`px-3 py-2 rounded cursor-pointer border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`} onClick={() => setStatusEditableMode(true)}>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getColumnName(selectedColumn?.id as number || task.content?.column_id as number)}
              </span>
            </div>
          ) : (
            <SearchSelect 
              value={{ label: selectedColumn?.title as string, value: String(selectedColumn?.id) }} 
              options={columns?.map(col => ({ label: col.title, value: String(col.id) })) || []} 
              open={statusEditableMode}
              onChange={({value}) => {
                const col = columns?.find(col => String(col.id) === value);
                setSelectedColumn(col);
                setStatusEditableMode(false);
                saveStatus(col as Column);
              }} 
            />
          )}
        </div>

        {/* Assignee */}
        <div>
          <label className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Assignee
          </label>
          {!assigneeEditMode ? (
            <div 
              className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setAssigneeEditMode(true)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {task.content?.full?.assigned_to ? getUserInitials(getUserName()) : '?'}
              </div>
              <span className={`text-sm ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getUserName() ?? 'Unassigned'}
              </span>
            </div>
          ) : (
            <SearchSelect
              value={selectedAssignee ? {
                value: selectedAssignee.id.toString(),
                label: selectedAssignee.name || selectedAssignee.username
              } : null}
              options={[]}
              open={assigneeEditMode}
              onOpenChange={(isOpen) => {
                if (!isOpen) setAssigneeEditMode(false);
              }}
              onChange={handleAssigneeChange}
              onSearch={handleUserSearch}
              placeholder="Search users..."
            />
          )}
        </div>

        {/* Priority */}
        <div>
          <label className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Priority
          </label>
          <div className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}>
            {getPriorityIcon(task.content?.priority)}
            <span className={`text-sm ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getPriorityText(task.content?.priority)}
            </span>
          </div>
        </div>

        {/* Reporter */}
        <div>
          <label className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Reporter
          </label>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
            }`}>
              JS
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Jane Smith
            </span>
          </div>
        </div>

        {/* Created */}
        <div>
          <label className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Created
          </label>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            3 days ago
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Monday at 9:00 AM
          </div>
        </div>

        {/* Updated */}
        <div>
          <label className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Updated
          </label>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            2 hours ago
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Today at 2:30 PM
          </div>
        </div>

      </div>
    </div>
  );
};