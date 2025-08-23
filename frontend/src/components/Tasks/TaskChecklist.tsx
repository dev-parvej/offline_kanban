import React, { useState } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GripVerticalIcon } from '../ui/Icons/GripVerticalIcon';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

interface TaskChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  editable?: boolean;
  showProgress?: boolean;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  items,
  onChange,
  editable = true,
  showProgress = true
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const completedCount = items.filter(item => item.completed).length;
  const completionPercentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const addNewItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      order: items.length
    };

    onChange([...items, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id: string) => {
    const updatedItems = items
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, order: index }));
    onChange(updatedItems);
  };

  const toggleCompleted = (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onChange(updatedItems);
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const saveEditing = () => {
    if (!editingText.trim()) return;

    const updatedItems = items.map(item =>
      item.id === editingId ? { ...item, text: editingText.trim() } : item
    );
    onChange(updatedItems);
    setEditingId(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const moveItem = (dragIndex: number, dropIndex: number) => {
    const draggedItem = items[dragIndex];
    const updatedItems = [...items];
    
    updatedItems.splice(dragIndex, 1);
    updatedItems.splice(dropIndex, 0, draggedItem);
    
    // Update order
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    onChange(reorderedItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

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
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            {/* Drag Handle */}
            {editable && (
              <button
                className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Drag to reorder"
              >
                <GripVerticalIcon className="h-4 w-4" />
              </button>
            )}

            {/* Checkbox */}
            <button
              onClick={() => toggleCompleted(item.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                item.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
              }`}
            >
              {item.completed && <CheckIcon className="h-3 w-3" />}
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
                    item.completed
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}
                  onClick={() => editable && startEditing(item)}
                  title={editable ? "Click to edit" : undefined}
                >
                  {item.text}
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
            />
            <Button
              onClick={addNewItem}
              disabled={!newItemText.trim()}
              size="sm"
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {items.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create checklist items to track subtasks and requirements for this task.
            </p>
          )}
        </div>
      )}

      {/* Summary for read-only mode */}
      {!editable && items.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <div className="text-sm">No checklist items</div>
        </div>
      )}
    </div>
  );
};