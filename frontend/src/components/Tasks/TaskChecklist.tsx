import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GripVerticalIcon } from '../ui/Icons/GripVerticalIcon';
import { 
  getTaskChecklists, 
  createChecklist, 
  updateChecklist, 
  toggleChecklist, 
  deleteChecklist,
  ChecklistResponse,
  CreateChecklistRequest,
  UpdateChecklistRequest 
} from '../../api/checklistService';

interface TaskChecklistProps {
  taskId: number;
  editable?: boolean;
  showProgress?: boolean;
  onChecklistUpdate?: (total: number, completed: number) => void;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  taskId,
  editable = true,
  showProgress = true,
  onChecklistUpdate
}) => {
  const [items, setItems] = useState<ChecklistResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const completedCount = items.filter(item => item.is_completed).length;
  const completionPercentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  // Fetch checklists when component mounts or taskId changes
  useEffect(() => {
    if (taskId) {
      fetchChecklists();
    }
  }, [taskId]);

  // Update parent component when checklist changes
  useEffect(() => {
    onChecklistUpdate?.(items.length, completedCount);
  }, [items, completedCount, onChecklistUpdate]);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const data = await getTaskChecklists(taskId);
      setItems(data.checklists);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewItem = async () => {
    if (!newItemText.trim()) return;

    try {
      const request: CreateChecklistRequest = {
        title: newItemText.trim(),
        task_id: taskId
      };
      
      await createChecklist(taskId, request);
      setNewItemText('');
      await fetchChecklists(); // Refresh the list
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) {
      return;
    }

    try {
      await deleteChecklist(taskId, id);
      await fetchChecklists(); // Refresh the list
    } catch (error) {
      console.error('Error deleting checklist:', error);
    }
  };

  const toggleCompleted = async (id: number, completed: boolean) => {
    try {
      await toggleChecklist(taskId, id, { completed: !completed });
      await fetchChecklists(); // Refresh the list
    } catch (error) {
      console.error('Error toggling checklist:', error);
    }
  };

  const startEditing = (item: ChecklistResponse) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  const saveEditing = async () => {
    if (!editingText.trim() || !editingId) return;

    try {
      const request: UpdateChecklistRequest = {
        title: editingText.trim()
      };
      
      await updateChecklist(taskId, editingId, request);
      setEditingId(null);
      setEditingText('');
      await fetchChecklists(); // Refresh the list
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Progress */}
      {showProgress && items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Checklist Progress
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {completedCount} of {items.length} completed ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleCompleted(item.id, item.is_completed)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                item.is_completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
              }`}
            >
              {item.is_completed && <CheckIcon className="h-3 w-3" />}
            </button>

            {/* Item Text */}
            <div className="flex-1 min-w-0">
              {editingId === item.id ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, saveEditing)}
                    className="text-sm"
                    autoFocus
                  />
                  <button
                    onClick={saveEditing}
                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Save"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Cancel"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span
                  className={`text-sm cursor-pointer transition-colors ${
                    item.is_completed
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}
                  onClick={() => editable && startEditing(item)}
                  title={editable ? "Click to edit" : undefined}
                >
                  {item.title}
                </span>
              )}
            </div>

            {/* Delete Button */}
            {editable && (
              <button
                onClick={() => deleteItem(item.id)}
                className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete item"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add New Item */}
      {editable && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Add a checklist item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addNewItem)}
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={addNewItem}
              disabled={!newItemText.trim() || loading}
              size="sm"
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {items.length === 0 && !loading && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create checklist items to track subtasks and requirements for this task.
            </p>
          )}
        </div>
      )}

      {/* Summary for read-only mode */}
      {!editable && items.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <div className="text-sm">No checklist items</div>
        </div>
      )}
    </div>
  );
};