import React, { useState } from 'react';
import { 
  XMarkIcon,
  RectangleStackIcon,
  SwatchIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { CreateColumnData } from '../../types';

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateColumn: (columnData: CreateColumnData) => Promise<void>;
  existingColumns?: Array<{ id: number; title: string; position: number }>;
}

// Predefined color options for columns
const COLUMN_COLORS = [
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
  { name: 'Yellow', value: '#F59E0B', bg: 'bg-yellow-500' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500' },
  { name: 'Orange', value: '#F97316', bg: 'bg-orange-500' },
  { name: 'Gray', value: '#6B7280', bg: 'bg-gray-500' }
];

export const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  isOpen,
  onClose,
  onCreateColumn,
  existingColumns = []
}) => {
  // Form state
  const [formData, setFormData] = useState<CreateColumnData>({
    title: '',
    description: '',
    color: COLUMN_COLORS[0].value,
    is_active: true,
    position: existingColumns.length + 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        color: COLUMN_COLORS[0].value,
        is_active: true,
        position: existingColumns.length + 1
      });
      setErrors({});
    }
  }, [isOpen, existingColumns.length]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Column title is required';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Column title must be at least 2 characters';
    } else if (formData.title.length > 50) {
      newErrors.title = 'Column title must be less than 50 characters';
    }

    // Check for duplicate column names
    const isDuplicate = existingColumns.some(
      col => col.title.toLowerCase() === formData.title.trim().toLowerCase()
    );
    if (isDuplicate) {
      newErrors.title = 'A column with this name already exists';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (formData.position < 1 || formData.position > existingColumns.length + 1) {
      newErrors.position = 'Invalid position';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onCreateColumn({
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim()
      });
      onClose();
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to create column' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateColumnData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get position options
  const getPositionOptions = () => {
    const options = [];
    for (let i = 1; i <= existingColumns.length + 1; i++) {
      let label = `Position ${i}`;
      if (i === 1) label += ' (First)';
      if (i === existingColumns.length + 1) label += ' (Last)';
      options.push({ value: i.toString(), label });
    }
    return options;
  };

  // Get selected color info
  const selectedColor = COLUMN_COLORS.find(c => c.value === formData.color) || COLUMN_COLORS[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RectangleStackIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create New Column
              </h2>
              <p className="text-sm text-gray-500">
                Add a new column to your board
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          {/* Column Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Preview</div>
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 min-h-[120px]">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <h3 className="font-medium text-gray-900">
                  {formData.title || 'Column Title'}
                </h3>
                {!formData.is_active && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </div>
              {formData.description && (
                <p className="text-sm text-gray-500 mb-2">{formData.description}</p>
              )}
              <div className="text-xs text-gray-400 flex items-center space-x-1">
                <ArrowPathIcon className="h-3 w-3" />
                <span>Tasks will appear here</span>
              </div>
            </div>
          </div>

          {/* Column Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., To Do, In Progress, Done"
              error={errors.title}
              className="w-full"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/50 characters
            </p>
          </div>

          {/* Column Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for this column..."
              error={errors.description}
              rows={3}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              {(formData.description?.length || 0)}/200 characters
            </p>
          </div>

          {/* Column Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <SwatchIcon className="h-4 w-4 inline mr-1" />
              Column Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLUMN_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`
                    relative w-12 h-12 rounded-lg border-2 transition-all
                    ${formData.color === color.value 
                      ? 'border-gray-400 ring-2 ring-blue-500 ring-offset-2' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  title={color.name}
                >
                  <div className={`w-full h-full rounded-md ${color.bg}`} />
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Selected: {selectedColor.name}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <Select
              value={formData.position.toString()}
              onChange={(value) => handleInputChange('position', parseInt(value))}
              options={getPositionOptions()}
              error={errors.position}
            />
            <p className="mt-1 text-xs text-gray-500">
              Choose where this column appears on the board
            </p>
          </div>

          {/* Active Status */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Active Column
                </div>
                <div className="text-xs text-gray-500">
                  {formData.is_active 
                    ? 'Column is visible and can receive tasks' 
                    : 'Column is hidden and cannot receive new tasks'
                  }
                </div>
              </div>
              <Switch
                checked={formData.is_active}
                onChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <EyeIcon className="h-4 w-4 text-blue-600 mt-0.5" />
              </div>
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Column Guidelines</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use clear, descriptive names (e.g., "Ready for Review" vs "Column 3")</li>
                  <li>Consider your workflow: To Do → In Progress → Review → Done</li>
                  <li>You can reorder columns later by changing their position</li>
                  <li>Inactive columns hide existing tasks but preserve data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Column'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};