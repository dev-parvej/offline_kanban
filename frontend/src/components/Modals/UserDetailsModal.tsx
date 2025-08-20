import React from 'react';
import { 
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { User } from '../../types';

interface UserDetailsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  canEdit = false
}) => {
  // Mock user stats - in real app, these would come from props or API
  const userStats = {
    tasksAssigned: 15,
    tasksCompleted: 12,
    tasksOverdue: 1,
    averageCompletionTime: '2.3 days',
    lastActivity: user.last_login_at || user.created_at
  };

  const completionRate = userStats.tasksAssigned > 0 
    ? Math.round((userStats.tasksCompleted / userStats.tasksAssigned) * 100)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                User Details
              </h2>
              <p className="text-sm text-gray-500">
                View user information and activity
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && onEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
              >
                Edit User
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* User Profile Section */}
          <div className="flex items-start space-x-6 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={user.avatar_url}
                name={user.name}
                size="2xl"
                className="border-4 border-white shadow-lg"
              />
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {user.name}
                </h3>
                {user.is_root && (
                  <Badge variant="warning" className="text-sm">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    Administrator
                  </Badge>
                )}
                <Badge 
                  variant={user.is_active ? "success" : "secondary"} 
                  className="text-sm"
                >
                  {user.is_active ? (
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircleIcon className="h-3 w-3 mr-1" />
                  )}
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-2 text-gray-500 mb-1">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>Member since</span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                {user.last_login_at && (
                  <div>
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Last seen</span>
                    </div>
                    <div className="font-medium text-gray-900">
                      {new Date(user.last_login_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900">Activity Overview</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tasks Assigned */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Tasks Assigned</p>
                    <p className="text-2xl font-bold text-blue-900">{userStats.tasksAssigned}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">📋</span>
                  </div>
                </div>
              </div>

              {/* Tasks Completed */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Tasks Completed</p>
                    <p className="text-2xl font-bold text-green-900">{userStats.tasksCompleted}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{completionRate}%</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">📈</span>
                  </div>
                </div>
              </div>

              {/* Overdue Tasks */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Overdue Tasks</p>
                    <p className="text-2xl font-bold text-red-900">{userStats.tasksOverdue}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-sm font-bold">⏰</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completion Rate Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Task Completion Rate</span>
                    <span className="text-sm text-gray-500">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        completionRate >= 80 ? 'bg-green-500' :
                        completionRate >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Average Completion Time */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Avg. Completion Time</span>
                    <span className="text-sm text-gray-500">{userStats.averageCompletionTime}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Time from assignment to completion
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Permissions & Access</h4>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">User Management</span>
                  </div>
                  {user.is_root ? (
                    <Badge variant="success" className="text-xs">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Granted
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Denied
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">System Configuration</span>
                  </div>
                  {user.is_root ? (
                    <Badge variant="success" className="text-xs">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Granted
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Denied
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Task Management</span>
                  </div>
                  <Badge variant="success" className="text-xs">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Granted
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Board Access</span>
                  </div>
                  <Badge variant="success" className="text-xs">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Granted
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};