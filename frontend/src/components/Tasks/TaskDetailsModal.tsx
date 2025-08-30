import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  CheckIcon, 
  ClockIcon, 
  ChatBubbleLeftIcon, 
  LinkIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { TaskChecklist } from './TaskChecklist';
import { CleanHtml } from '../../utils/cleanHtml';
import { Column } from '../../api/columnService';
import { SearchSelect } from '../ui/Input';
import { updateTaskStatus } from '../../api';

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
      column_id: number
    };
    parentId: string;
  } | null;
  columns?: Column[],
  column?: Column
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task, columns, column }) => {
  const { isDarkMode } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [statusEditableMode, setStatusEditableMode] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<Column|undefined>(column)

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

  const getColumnName = (columnId: number) => {
    const column = columns?.find(col => col.id === columnId)
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
    await updateTaskStatus(task.content?.databaseId as number, { column_id: col?.id as number })
  }

  const closeModal = () => {
    onClose()
    setStatusEditableMode(false)
    setSelectedColumn(undefined)
  }

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
                    defaultValue={task.title}
                    className={`text-2xl font-semibold w-full bg-transparent border-none outline-none ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    onBlur={() => setIsEditingTitle(false)}
                    autoFocus
                  />
                ) : (
                  <h1 
                    className={`text-2xl font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -m-2 rounded ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {task.title}
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
                  <textarea
                    defaultValue={task.content?.description || 'Add a description...'}
                    className={`w-full p-3 rounded border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={4}
                    onBlur={() => setIsEditingDescription(false)}
                    autoFocus
                  />
                ) : (
                  <div
                    className={`p-3 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {task.content?.description ? <CleanHtml html={task.content?.description} /> : (
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
                  <div className="space-y-6">
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        U
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className={`w-full p-3 rounded border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          rows={3}
                        />
                        {newComment && (
                          <div className="flex gap-2 mt-2">
                            <button className={`px-3 py-1 text-sm rounded ${
                              isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}>
                              Save
                            </button>
                            <button 
                              className={`px-3 py-1 text-sm rounded ${
                                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                              }`}
                              onClick={() => setNewComment('')}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {mockComments.length === 0 ? (
                        <div className={`text-center py-8 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <ChatBubbleLeftIcon className={`w-12 h-12 mx-auto mb-3 ${
                            isDarkMode ? 'text-gray-600' : 'text-gray-300'
                          }`} />
                          <p className="text-sm">No comments yet</p>
                          <p className="text-xs mt-1">Be the first to comment on this task</p>
                        </div>
                      ) : (
                        mockComments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              {comment.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {comment.author}
                                </span>
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  {comment.date}
                                </span>
                              </div>
                              <div className={`p-3 rounded ${
                                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                              }`}>
                                <p className={`${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {/* Combined Activity and Comments Timeline */}
                    {[...mockActivity, ...mockComments.map(comment => ({
                      id: `comment-${comment.id}`,
                      author: comment.author,
                      avatar: comment.avatar,
                      action: 'commented',
                      timestamp: comment.timestamp,
                      date: comment.date,
                      type: 'comment' as const,
                      content: comment.content,
                    }))].sort((a, b) => {
                      // Sort by timestamp (newest first)
                      const timeValues: Record<string, number> = { '1h': 1, '2h': 2, '2d': 48, '3d': 72 };
                      return (timeValues[a.timestamp] || 0) - (timeValues[b.timestamp] || 0);
                    }).map((item: any) => (
                      <div key={item.id} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          item.type === 'comment'
                            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                            : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.author}
                            </span>
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {item.action}
                            </span>
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {item.timestamp}
                            </span>
                          </div>
                          {item.type === 'comment' && (
                            <div className={`mt-2 p-3 rounded ${
                              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                            }`}>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {(item as any).content}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {mockActivity.length === 0 && mockComments.length === 0 && (
                      <div className={`text-center py-8 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <ClockIcon className={`w-12 h-12 mx-auto mb-3 ${
                          isDarkMode ? 'text-gray-600' : 'text-gray-300'
                        }`} />
                        <p className="text-sm">No activity yet</p>
                        <p className="text-xs mt-1">Activity will appear here as the task progresses</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details Panel */}
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
                { !statusEditableMode ? <div className={`px-3 py-2 rounded cursor-pointer border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`} onClick={() => setStatusEditableMode(true)}>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {getColumnName(selectedColumn?.id as number || task.content?.column_id as number)}
                  </span>
                </div> : 
                <SearchSelect 
                  value={ { label: selectedColumn?.title as string, value: String(selectedColumn?.id) } } 
                  options={columns?.map(col => ({ label: col.title, value: String(col.id) })) || []} 
                  open={statusEditableMode}
                  onChange={({value}) => {
                      const col = columns?.find(col => String(col.id) === value)
                      setSelectedColumn(col)
                      setStatusEditableMode(false)
                      saveStatus(col as Column)
                  }} 
                /> }
                
              </div>

              {/* Assignee */}
              <div>
                <label className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Assignee
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    JD
                  </div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    John Doe
                  </span>
                </div>
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
        </div>
      </div>
    </div>
  );
};