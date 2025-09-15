import React, { useState, useEffect } from 'react';
import { useForm, FieldValues, Controller } from 'react-hook-form';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hook';
import RichTextEditor from '../ui/RichTextEditor';
import { useTheme } from '../../contexts/ThemeContext';
import { TaskChecklist } from './TaskChecklist';
import { createTask, CreateTaskRequest } from '../../api/taskService';
import { getColumns, Column } from '../../api/columnService';
import { getAllUsers, UserResponse } from '../../api/userService';

interface CreateTaskFormProps {
  onClose: () => void;
  onSubmit?: (taskData: any) => void; // Make optional since we'll handle API call internally
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ 
  onClose, 
  onSubmit 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const { showToast, ToastContainer } = useToast();
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const { isDarkMode } = useTheme();

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  // Fetch columns and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [columnsResponse, usersResponse] = await Promise.all([
          getColumns(),
          getAllUsers()
        ]);
        setColumns(columnsResponse.columns);
        setUsers(usersResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load form data. Please try again.', 'error');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const saveTask = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      // Convert due date to ISO format if provided
      let dueDate: string | undefined;
      if (data.due_date) {
        // Convert datetime-local to ISO format
        const date = new Date(data.due_date);
        dueDate = date.toISOString();
      }

      // Transform the form data to match backend DTO
      const taskData: CreateTaskRequest = {
        title: data.title,
        description: data.content || undefined,
        column_id: parseInt(data.column_id),
        assigned_to: data.assigned_to ? parseInt(data.assigned_to) : undefined,
        priority: data.priority || undefined,
        due_date: dueDate
      };
      
      // Call backend API
      const response = await createTask(taskData);
      
      // Call parent onSubmit if provided (for updating UI state)
      if (onSubmit) {
        await onSubmit(response.task);
      }
      
      showToast("Task created successfully!", "success");
      
      // Reset form and checklist
      setChecklistItems([]);
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      showToast("Failed to create task. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className="text-gray-900 dark:text-white">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading form data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Task
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Add a new task to your Kanban board
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(saveTask)} className="flex flex-col gap-4">
        
        {/* Title Field */}
        <FormGroup label="Title" errorMessage={errors.title?.message as string}>
          <Input 
            placeholder="Enter task title..."
            {...register("title", { 
              required: "Title is required", 
              minLength: {
                value: 3, 
                message: "Title must be at least 3 characters long"
              }, 
              maxLength: {
                value: 100, 
                message: "Title must not exceed 100 characters"
              } 
            })}
          />
        </FormGroup>

        {/* Content Field */}
        <FormGroup label="Description">
          <Controller
            name="content"
            control={control}
            defaultValue=""
            rules={{
              maxLength: {
                value: 10000,
                message: "Description must not exceed 1000 characters"
              }
            }}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter task description..."
                isDarkMode={isDarkMode}
              />
            )}
          />
          {errors.content && (
            <span className="text-sm text-red-500 dark:text-red-400">
              {errors.content.message as string}
            </span>
          )}
        </FormGroup>

        {/* Assignee Field */}
        <FormGroup label="Assignee">
          <select
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...register("assigned_to")}
            defaultValue=""
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name ? `${user.name} (${user.user_name})` : user.user_name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Assign this task to a team member. Leave empty for unassigned tasks.
          </p>
        </FormGroup>

        {/* Priority and Column Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Priority Field */}
          <FormGroup label="Priority">
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              {...register("priority", { required: "Priority is required" })}
              defaultValue="medium"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            {errors.priority && (
              <span className="text-sm text-red-500 dark:text-red-400">
                {errors.priority.message as string}
              </span>
            )}
          </FormGroup>

          {/* Column Field */}
          <FormGroup label="Column" errorMessage={errors.column_id?.message as string}>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              {...register("column_id", { required: "Please select a column" })}
              defaultValue={columns.length > 0 ? columns[0].id.toString() : ""}
            >
              {columns.map(column => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </FormGroup>
        </div>

        {/* Due Date Field */}
        <FormGroup label="Due Date" errorMessage={errors.due_date?.message as string}>
          <Input
            type="datetime-local"
            placeholder="Select due date and time"
            {...register("due_date")}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional due date and time for the task.
          </p>
        </FormGroup>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <Button type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>

        <ToastContainer />
      </form>
    </div>
  );
};