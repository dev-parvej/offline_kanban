import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  RectangleStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { useColumns } from '../../hooks/useColumns';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { DatePicker } from '../ui/DatePicker';
import { TaskComments } from '../Tasks/TaskComments';
import { TaskHistory } from '../Tasks/TaskHistory';
import { Task, UpdateTaskData } from '../../types';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  canEdit: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  canEdit
}) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const { columns } = useColumns();
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateTaskData>({
    title: task.title,
    content: task.content || '',
    priority: task.priority,
    assigned_to: task.assigned_to,
    due_date: task.due_date,
    labels: task.labels || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');

  // Reset form when task changes
  useEffect(() => {
    setFormData({
      title: task.title,
      content: task.content || '',
      priority: task.priority,
      assigned_to: task.assigned_to,
      due_date: task.due_date,
      labels: task.labels || []
    });
    setIsEditing(false);
    setError('');
  }, [task]);

  // Handle form submission
  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, call API to update task
      console.log('Updating task:', task.id, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Handle task archive
  const handleArchive = async () => {
    if (!user?.is_root) return;
    
    const confirmed = confirm('Are you sure you want to archive this task?');
    if (!confirmed) return;

    setLoading(true);
    try {
      // In a real app, call API to archive task
      console.log('Archiving task:', task.id);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onClose();
      onUpdate();
    } catch (err) {
      setError('Failed to archive task');
    } finally {
      setLoading(false);
    }
  };

  // Get assignee options
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map(user => ({
      value: user.id.toString(),
      label: user.name
    }))
  ];

  // Check if task is overdue
  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'completed';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {/* Priority Indicator */}
            <div className={`
              w-3 h-3 rounded-full
              ${task.priority === 'urgent' ? 'bg-red-500' :
                task.priority === 'high' ? 'bg-orange-500' :
                task.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'}
            `} />
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg font-semibold"
                    placeholder="Task title"
                  />
                ) : (
                  task.title
                )}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {task.column?.title}
                </Badge>
                <Badge className={`text-xs capitalize ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'archived' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.status}
                </Badge>
                {isOverdue && (
                  <Badge variant="danger" className="text-xs">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canEdit && !isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {user?.is_root && task.status !== 'archived' && (
              <Button
                variant="danger"
                onClick={handleArchive}
                disabled={loading}
              >
                <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                Archive
              </Button>
            )}

            <Button variant="ghost" onClick={onClose}>
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {['details', 'comments', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab === 'comments' && (
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2 inline" />
                )}
                {tab}
                {tab === 'comments' && task.comment_count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {task.comment_count}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Add a description..."
                    rows={4}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-md p-3 min-h-[100px]">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {task.content || 'No description provided'}
                    </p>
                  </div>
                )}
              </div>

              {/* Task Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Assignee
                  </label>
                  {isEditing && (canEdit || user?.is_root) ? (
                    <Select
                      value={formData.assigned_to?.toString() || ''}
                      onChange={(value) => setFormData({
                        ...formData,
                        assigned_to: value ? Number(value) : undefined
                      })}
                      options={assigneeOptions}
                    />
                  ) : task.assigned_user ? (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                      <Avatar
                        src={task.assigned_user.avatar_url}
                        name={task.assigned_user.name}
                        size="sm"
                      />
                      <span>{task.assigned_user.name}</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md text-gray-500">
                      Unassigned
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  {isEditing ? (
                    <Select
                      value={formData.priority}
                      onChange={(value) => setFormData({
                        ...formData,
                        priority: value as any
                      })}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' }
                      ]}
                    />
                  ) : (
                    <Badge className={`
                      text-xs capitalize
                      ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}
                    `}>
                      {task.priority}
                    </Badge>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                    Due Date
                  </label>
                  {isEditing ? (
                    <DatePicker
                      value={formData.due_date}
                      onChange={(date) => setFormData({
                        ...formData,
                        due_date: date
                      })}
                    />
                  ) : task.due_date ? (
                    <div className={`
                      p-2 rounded-md
                      ${isOverdue ? 'bg-red-50 text-red-900' : 'bg-gray-50 text-gray-900'}
                    `}>
                      {new Date(task.due_date).toLocaleDateString()}
                      {isOverdue && (
                        <span className="ml-2 text-red-600 text-sm">
                          (Overdue)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md text-gray-500">
                      No due date
                    </div>
                  )}
                </div>

                {/* Time Logged */}
                {task.time_logged && task.time_logged > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      Time Logged
                    </label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {Math.floor(task.time_logged / 60)}h {task.time_logged % 60}m
                    </div>
                  </div>
                )}
              </div>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map((label, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Created by:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar
                        src={task.created_by_user?.avatar_url}
                        name={task.created_by_user?.name || 'Unknown'}
                        size="xs"
                      />
                      <span>{task.created_by_user?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <div className="mt-1">
                      {new Date(task.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="h-full">
              <TaskComments taskId={task.id} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <TaskHistory taskId={task.id} />
            </div>
          )}
        </div>

        {/* Footer - Edit Actions */}
        {isEditing && (
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setError('');
                // Reset form data
                setFormData({
                  title: task.title,
                  content: task.content || '',
                  priority: task.priority,
                  assigned_to: task.assigned_to,
                  due_date: task.due_date,
                  labels: task.labels || []
                });
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || !formData.title.trim()}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};