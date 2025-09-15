import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import RichTextEditor from '../ui/RichTextEditor';
import { CleanHtml } from '../../utils/cleanHtml';
import { 
  Comment, 
  createComment, 
  getCommentsByTask, 
  updateComment, 
  deleteComment
} from '../../api/commentService';
import { deleteImages, findRemovedImages } from '../../api/fileService';
import { getUserInitials } from '../../util/user';

interface TaskCommentsProps {
  taskId: number;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const { isDarkMode } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load comments on component mount and when taskId changes
  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await getCommentsByTask(taskId);
      setComments(response.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await createComment({
          content: newComment,
          task_id: taskId
        });
        
        setComments(prev => [...prev, response.comment]);
        setNewComment('');
        setIsComposing(false);
      } catch (error) {
        console.error('Failed to save comment:', error);
        alert('Failed to save comment. Please try again.');
      }
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (editContent.trim()) {
      try {
        const originalComment = comments.find(c => c.id === commentId);
        
        // Find images that were removed
        const removedImages = findRemovedImages(originalComment?.content || '', editContent);
        
        const response = await updateComment(commentId, {
          content: editContent
        });
        
        // Delete removed images
        if (removedImages.length > 0) {
          try {
            await deleteImages(removedImages);
          } catch (error) {
            console.error('Failed to clean up images:', error);
          }
        }
        
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId ? response.comment : comment
          )
        );
        setEditingComment(null);
        setEditContent('');
      } catch (error) {
        console.error('Failed to update comment:', error);
        alert('Failed to update comment. Please try again.');
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        const commentToDelete = comments.find(c => c.id === commentId);
        
        // Find images in the comment and delete them
        if (commentToDelete?.content) {
          const removedImages = findRemovedImages(commentToDelete.content, '');
          if (removedImages.length > 0) {
            try {
              await deleteImages(removedImages);
            } catch (error) {
              console.error('Failed to clean up images:', error);
            }
          }
        }
        
        await deleteComment(commentId);
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.error('Failed to delete comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        Loading comments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
        }`}>
          U
        </div>
        <div className="flex-1">
          {isComposing ? (
            <div>
              <RichTextEditor
                value={newComment}
                onChange={setNewComment}
                placeholder="Add a comment..."
                isDarkMode={isDarkMode}
              />
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={handleSaveComment}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Save
                </button>
                <button 
                  onClick={() => {
                    setIsComposing(false);
                    setNewComment('');
                  }}
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
            <button
              onClick={() => setIsComposing(true)}
              className={`w-full p-3 text-left rounded border border-dashed transition-colors ${
                isDarkMode
                  ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                  : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600'
              }`}
            >
              Add a comment...
            </button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.length === 0 ? (
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
          comments?.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {getUserInitials(comment.author_name || comment.author_username)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {comment.author_name || comment.author_username}
                    </span>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditing(comment)}
                      className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                        isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                      title="Edit comment"
                    >
                      <PencilIcon className={`w-4 h-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                        isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                      title="Delete comment"
                    >
                      <TrashIcon className={`w-4 h-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </button>
                  </div>
                </div>
                
                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <RichTextEditor
                      value={editContent}
                      onChange={setEditContent}
                      placeholder="Edit your comment..."
                      isDarkMode={isDarkMode}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
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
                  <div className={`p-3 rounded ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div 
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      <CleanHtml html={comment.content} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};