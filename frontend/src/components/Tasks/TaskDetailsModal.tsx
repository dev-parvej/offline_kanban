import React, { useMemo, useState } from 'react';
import { 
  XMarkIcon, 
  ClockIcon, 
  ChatBubbleLeftIcon, 
  LinkIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { TaskChecklist } from './TaskChecklist';
import { TaskComments } from './TaskComments';
import { TaskActivity } from './TaskActivity';
import { TaskDetailsPanel } from './TaskDetailsPanel';
import { CleanHtml } from '../../utils/cleanHtml';
import { Column } from '../../api/columnService';
import { updateTask } from '../../api/taskService';
import RichTextEditor from '../ui/RichTextEditor';
import { deleteImages, findRemovedImages } from '../../api/fileService';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  } | null;
  columns?: Column[],
  column?: Column
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task, columns, column }) => {
  const { isDarkMode } = useTheme();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [currentTitle, setCurrentTitle] = useState(task?.title || '');
  const [currentDescription, setCurrentDescription] = useState(task?.content?.description || '');

  if (!isOpen || !task) return null;

  const mockComments = [
    {
      id: '1',
      author: 'John Doe',
      avatar: 'JD',
      content: 'Started working on the wireframes. Should have initial draft by EOD.',
      timestamp: '2h',
      date: 'Today at 2:30 PM',
    },
    {
      id: '2',
      author: 'Jane Smith',
      avatar: 'JS',
      content: 'Looks good! Can we also include mobile responsive designs?',
      timestamp: '1h',
      date: 'Today at 3:30 PM',
    },
  ];

  const mockActivity = [
    {
      id: '1',
      author: 'John Doe',
      avatar: 'JD',
      action: 'created this issue',
      timestamp: '3d',
      date: 'Monday at 9:00 AM',
    },
    {
      id: '2',
      author: 'Jane Smith',
      avatar: 'JS',
      action: 'changed priority from Medium to High',
      timestamp: '2d',
      date: 'Tuesday at 11:30 AM',
    },
  ];

  const closeModal = () => {
    onClose();
  };

  const handleAddComment = (comment: string) => {
    // TODO: Implement comment saving functionality
    console.log('Adding comment:', comment);
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (newTitle.trim() && newTitle !== task?.title) {
      try {
        await updateTask(task.content?.databaseId as number, {
          title: newTitle.trim()
        });
        setCurrentTitle(newTitle.trim());
        // TODO: Update parent component or show success message
      } catch (error) {
        console.error('Failed to update task title:', error);
        // Reset to original title on error
        setCurrentTitle(task?.title || '');
        // TODO: Show error message to user
      }
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = async (newDescription: string) => {
    if (newDescription !== task?.content?.description) {
      try {
        // Find images that were removed from the description
        const removedImages = findRemovedImages(task?.content?.description || '', newDescription);
        
        // Update the task description
        await updateTask(task.content?.databaseId as number, {
          description: newDescription
        });
        
        // Delete removed images from the server
        if (removedImages.length > 0) {
          try {
            const deleteResult = await deleteImages(removedImages);
            console.log(`Cleaned up ${deleteResult.deleted_count} unused images`);
            if (deleteResult.errors && deleteResult.errors.length > 0) {
              console.warn('Some images could not be deleted:', deleteResult.errors);
            }
          } catch (error) {
            console.error('Failed to clean up unused images:', error);
            // Don't fail the save operation if image cleanup fails
          }
        }
        
        setCurrentDescription(newDescription);
        // TODO: Update parent component or show success message
      } catch (error) {
        console.error('Failed to update task description:', error);
        // Reset to original description on error
        setCurrentDescription(task?.content?.description || '');
        // TODO: Show error message to user
      }
    }
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    // Reset to original description
    setCurrentDescription(task?.content?.description || '');
    setIsEditingDescription(false);
  };

console.log(task);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeModal}
      />
      
      <div className={`relative w-full max-w-5xl max-h-[90vh] mx-4 rounded-md shadow-xl overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        
        {/* Jira-style Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                {task.id}
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <PaperClipIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}>
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
              <button
                onClick={closeModal}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Jira Two Column Layout */}
        <div className="flex overflow-hidden max-h-[80vh]">
          
          {/* Left Column - Main Content */}
          <div className="flex-1 overflow-y-auto scroll-box">
            <div className="p-6 space-y-6">
              
              {/* Task Title */}
              <div>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    className={`text-2xl font-semibold w-full bg-transparent border-none outline-none ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    onBlur={() => handleSaveTitle(currentTitle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveTitle(currentTitle);
                      } else if (e.key === 'Escape') {
                        setCurrentTitle(task?.title || '');
                        setIsEditingTitle(false);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <h1 
                    className={`text-2xl font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -m-2 rounded ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {currentTitle || task.title}
                  </h1>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </h3>
                {isEditingDescription ? (
                  <div>
                    <RichTextEditor
                      value={currentDescription}
                      onChange={setCurrentDescription}
                      placeholder="Add a description..."
                      isDarkMode={isDarkMode}
                    />
                    {/* Save/Cancel Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSaveDescription(currentDescription)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelDescription}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {currentDescription || task.content?.description ? (
                      <CleanHtml html={currentDescription || task.content?.description || ''} />
                    ) : (
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                        Add a description...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div>
                <TaskChecklist 
                  taskId={typeof task.content?.databaseId === 'number' ? task.content.databaseId : 0}
                  editable={true}
                  showProgress={true}
                />
              </div>

              {/* Comments & Activity Tabs */}
              <div>
                {/* Tab Navigation */}
                <div className={`flex border-b mb-6 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'comments'
                        ? isDarkMode
                          ? 'border-blue-500 text-blue-400'
                          : 'border-blue-500 text-blue-600'
                        : isDarkMode
                          ? 'border-transparent text-gray-400 hover:text-gray-200'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      Comments ({mockComments.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'activity'
                        ? isDarkMode
                          ? 'border-blue-500 text-blue-400'
                          : 'border-blue-500 text-blue-600'
                        : isDarkMode
                          ? 'border-transparent text-gray-400 hover:text-gray-200'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      Activity ({mockActivity.length + mockComments.length})
                    </div>
                  </button>
                </div>

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <TaskComments 
                    taskId={task.content?.databaseId as number}
                  />
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <TaskActivity 
                    taskId={task.content?.databaseId as number}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details Panel */}
          <TaskDetailsPanel task={task} columns={columns} column={column} />
        </div>
      </div>
    </div>
  );
};