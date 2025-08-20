import React, { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hook';

interface CreateTaskFormProps {
  isDarkMode: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ 
  isDarkMode, 
  onClose, 
  onSubmit 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast, ToastContainer } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const columns = [
    { id: 'col-1', name: 'To Do' },
    { id: 'col-2', name: 'In Progress' },
    { id: 'col-3', name: 'Done' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const saveTask = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      // Transform the form data
      const taskData = {
        title: data.title,
        content: data.content || '',
        priority: data.priority,
        columnId: data.columnId,
        autoArchiveDays: data.autoArchiveDays ? parseInt(data.autoArchiveDays) : undefined
      };
      
      await onSubmit(taskData);
      showToast("Task created successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      showToast("Failed to create task. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Create New Task
        </h2>
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Add a new task to your Kanban board
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(saveTask)} className="flex flex-col gap-4">
        
        {/* Title Field */}
        <FormGroup label="Title" errorMessage={errors.title?.message as string} isDarkMode={isDarkMode}>
          <Input 
            placeholder="Enter task title..."
            isDarkMode={isDarkMode}
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
        <FormGroup label="Description" isDarkMode={isDarkMode}>
          <textarea
            placeholder="Enter task description..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            {...register("content", {
              maxLength: {
                value: 1000,
                message: "Description must not exceed 1000 characters"
              }
            })}
          />
          {errors.content && (
            <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
              {errors.content.message as string}
            </span>
          )}
        </FormGroup>

        {/* Priority and Column Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Priority Field */}
          <FormGroup label="Priority" isDarkMode={isDarkMode}>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
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
              <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                {errors.priority.message as string}
              </span>
            )}
          </FormGroup>

          {/* Column Field */}
          <FormGroup label="Column" errorMessage={errors.columnId?.message as string} isDarkMode={isDarkMode}>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              {...register("columnId", { required: "Please select a column" })}
              defaultValue="col-1"
            >
              {columns.map(column => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
          </FormGroup>
        </div>

        {/* Auto-archive Field */}
        <FormGroup label="Auto-archive after (days)" errorMessage={errors.autoArchiveDays?.message as string} isDarkMode={isDarkMode}>
          <Input
            type="number"
            placeholder="Leave empty to never auto-archive"
            min="1"
            isDarkMode={isDarkMode}
            {...register("autoArchiveDays", {
              min: {
                value: 1,
                message: "Auto-archive days must be at least 1"
              },
              max: {
                value: 365,
                message: "Auto-archive days must not exceed 365"
              }
            })}
          />
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Task will be automatically archived after the specified number of days. Leave empty for permanent tasks.
          </p>
        </FormGroup>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
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