import React, { useEffect, useState } from 'react';
import { useForm, FieldValues, set } from 'react-hook-form';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import FormGroup from '../ui/FormGroup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal/Modal';
import { useToast } from '../../hook';
import { GripVerticalIcon } from '../ui/Icons/GripVerticalIcon';
import { api } from '../../api';

interface KanbanColumn {
  id?: number;
  title: string;
  position: number;
  colors?: string;
}

export const KanbanColumnsSettings: React.FC = () => {
  const { showToast, ToastContainer } = useToast();
  
  // Mock data - will be replaced with API calls
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(null);
  const [isLoading, setIsLoading] = useState(false);  

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const handleCreateColumn = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      const newColumn: KanbanColumn = {
        title: data.title,
        position: columns.length + 1,
        colors: data.color || '#6b7280'
      };
      
      await api.post('/settings/columns', newColumn)

      showToast("Column created successfully!", "success");
      reset();
      setShowCreateModal(false);
      fetchColumns()
    } catch (error) {
      showToast("Failed to create column.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditColumn = async (data: FieldValues) => {
    if (!selectedColumn) return;
    
    setIsLoading(true);
    try {
      setColumns(prev => prev.map(col => 
        col.id === selectedColumn.id 
          ? { ...col, title: data.title, colors: data.colors || col.colors }
          : col
      ));

      await api.put(`/settings/columns/${selectedColumn.id}`, data)
      
      showToast("Column updated successfully!", "success");
      reset();
      setShowEditModal(false);
      setSelectedColumn(null);
      fetchColumns()
    } catch (error) {
      showToast("Failed to update column.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteColumn = (column: KanbanColumn) => {
    if (columns.length <= 1) {
      showToast("Cannot delete the last column.", "error");
      return;
    }
    
    setColumns(prev => prev.filter(col => col.id !== column.id));
    showToast("Column deleted successfully!", "success");
  };

  const handleMoveColumn = async (columnId: number, direction: 'up' | 'down') => {
    setIsLoading(true);
    const columnIndex = columns.findIndex(col => col.id === columnId);
    if (
      (direction === 'up' && columnIndex === 0) ||
      (direction === 'down' && columnIndex === columns.length - 1)
    ) {
      return;
    }

    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
    
    [newColumns[columnIndex], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[columnIndex]];
    newColumns.forEach((col, index) => {
      col.position = index + 1;
    });
    
    try {
      await api.post('/settings/columns/reorder', { orders: newColumns.map(col => ({ id: col.id, position: col.position }))});
      fetchColumns()
    } catch (error) {
      showToast("Failed to reorder columns.", "error");
    } finally {
      setIsLoading(false);
    }
  
  };

  const openEditModal = (column: KanbanColumn) => {
    setSelectedColumn(column);
    setValue('title', column.title);
    setValue('colors', column.colors);
    setShowEditModal(true);
  };

  const fetchColumns = async () => {
    setIsLoading(true)
    const { data } = await api.get('/settings/columns/with-counts')
    setColumns(data.columns)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchColumns();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kanban Columns
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your board columns and their order
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>

      {/* Columns List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Current Columns ({columns.length})
          </h3>
          
          <div className="space-y-2">
            {columns.map((column, index) => (
              <div
                key={column.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <GripVerticalIcon className="h-5 w-5 text-gray-400 cursor-move" />
                  
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: column.colors }}
                  />
                  
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {column.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Position: {column.position}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Move Up/Down */}
                  <button
                    onClick={() => handleMoveColumn(column.id as number, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Move Up"
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleMoveColumn(column.id as number, 'down')}
                    disabled={index === columns.length - 1}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Move Down"
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(column)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Edit Column"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteColumn(column)}
                    disabled={columns.length <= 1}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete Column"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Column Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        className="max-w-md w-full"
      >
        <div className="text-gray-900 dark:text-white">
          <h3 className="text-lg font-medium mb-4">Create New Column</h3>
          
          <form onSubmit={handleSubmit(handleCreateColumn)} className="space-y-4">
            <FormGroup label="Column title" errorMessage={errors.title?.message as string}>
              <Input
                placeholder="Enter column name..."
                {...register("title", {
                  required: "Column title is required",
                  minLength: { value: 1, message: "Column title cannot be empty" },
                  maxLength: { value: 50, message: "Column title too long" }
                })}
              />
            </FormGroup>

            <FormGroup label="Color">
              <Input
                type="color"
                {...register("colors")}
              />
            </FormGroup>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <Button type="submit" isLoading={isLoading}>
                Create Column
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Column Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedColumn(null);
          reset();
        }}
        className="max-w-md w-full"
      >
        <div className="text-gray-900 dark:text-white">
          <h3 className="text-lg font-medium mb-4">Edit Column</h3>
          
          <form onSubmit={handleSubmit(handleEditColumn)} className="space-y-4">
            <FormGroup label="Column Name" errorMessage={errors.name?.message as string}>
              <Input
                placeholder="Enter column name..."
                {...register("title", {
                  required: "Column name is required",
                  minLength: { value: 1, message: "Column name cannot be empty" },
                  maxLength: { value: 50, message: "Column name too long" }
                })}
              />
            </FormGroup>

            <FormGroup label="Color">
              <Input
                type="color"
                {...register("colors")}
              />
            </FormGroup>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <Button type="submit" isLoading={isLoading}>
                Update Column
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};