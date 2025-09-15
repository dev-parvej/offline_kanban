import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { Activity, getTaskActivities } from '../../api/activityService';
import { Comment, getCommentsByTask } from '../../api/commentService';
import { getUserInitials } from '../../util/user';
import { CleanHtml } from '../../utils/cleanHtml';

interface TaskActivityProps {
  taskId: number;
}

export const TaskActivity: React.FC<TaskActivityProps> = ({ taskId }) => {
  const { isDarkMode } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load activities and comments on component mount and when taskId changes
  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesResponse, commentsResponse] = await Promise.all([
        getTaskActivities(taskId),
        getCommentsByTask(taskId)
      ]);
      setActivities(activitiesResponse.activities);
      setComments(commentsResponse.comments);
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatActivityAction = (activity: Activity) => {
    switch (activity.action) {
      case 'created':
        return 'created this task';
      case 'updated':
        if (activity.field_name) {
          return `updated ${activity.field_name}`;
        }
        return 'updated this task';
      case 'moved':
        return `moved from ${activity.old_value} to ${activity.new_value}`;
      case 'assigned':
        return `changed assignee from ${activity.old_value} to ${activity.new_value}`;
      case 'priority_changed':
        return `changed priority from ${activity.old_value} to ${activity.new_value}`;
      case 'commented':
        return 'commented';
      case 'deleted':
        return 'deleted this task';
      default:
        return activity.action;
    }
  };

  // Combine activities and comments into a single timeline
  const timelineItems = [
    ...activities.map(activity => ({
      id: `activity-${activity.id}`,
      author: activity.user_name || activity.username,
      avatar: getUserInitials(activity.user_name || activity.username),
      action: formatActivityAction(activity),
      created_at: activity.created_at,
      type: 'activity' as const,
      activity
    })),
    ...comments.map(comment => ({
      id: `comment-${comment.id}`,
      author: comment.author_name || comment.author_username,
      avatar: getUserInitials(comment.author_name || comment.author_username),
      action: 'commented',
      created_at: comment.created_at,
      type: 'comment' as const,
      content: comment.content,
      comment
    }))
  ].sort((a, b) => {
    // Sort by created_at (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        Loading activity...
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return (
      <div className={`text-center py-8 ${
        isDarkMode ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <ClockIcon className={`w-12 h-12 mx-auto mb-3 ${
          isDarkMode ? 'text-gray-600' : 'text-gray-300'
        }`} />
        <p className="text-sm">No activity yet</p>
        <p className="text-xs mt-1">Activity will appear here as the task progresses</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timelineItems.map((item) => (
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
                {formatDate(item.created_at)}
              </span>
            </div>
            {item.type === 'comment' && (
              <div className={`mt-2 p-3 rounded ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div 
                  className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  <CleanHtml html={item.content} />
                  </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};