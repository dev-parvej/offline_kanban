import React, { useState } from 'react';
import { 
  EyeIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { DropdownMenu } from '../ui/DropdownMenu';
import { User } from '../../types';

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  onToggleStatus: (user: User) => void;
  currentUserId: number;
  sortBy?: string;
  sortOrder?: string;
  onSort?: (field: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onViewUser,
  onToggleStatus,
  currentUserId,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSort
}) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Sort header component
  const SortHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className={`
        px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
        ${onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
      `}
      onClick={() => onSort && onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {onSort && sortBy === field && (
          sortOrder === 'asc' ? 
            <ChevronUpIcon className="h-3 w-3" /> : 
            <ChevronDownIcon className="h-3 w-3" />
        )}
      </div>
    </th>
  );

  // Toggle row expansion
  const toggleRowExpansion = (userId: number) => {
    setExpandedRows(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Get user role badge
  const getRoleBadge = (user: User) => {
    if (user.is_root) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
          <ShieldCheckIcon className="h-3 w-3 mr-1" />
          Root
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        <UserIcon className="h-3 w-3 mr-1" />
        Normal
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (user: User) => {
    if (user.is_active) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
        <XCircleIcon className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Expand Column */}
              <th className="px-2 py-3 w-8"></th>
              
              {/* User Info */}
              <SortHeader field="name">User</SortHeader>
              <SortHeader field="username">Username</SortHeader>
              <SortHeader field="is_root">Role</SortHeader>
              <SortHeader field="is_active">Status</SortHeader>
              <SortHeader field="created_at">Created</SortHeader>
              <SortHeader field="updated_at">Last Updated</SortHeader>
              
              {/* Actions */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const isExpanded = expandedRows.includes(user.id);
              const isCurrentUser = user.id === currentUserId;
              
              return (
                <React.Fragment key={user.id}>
                  {/* Main Row */}
                  <tr className={`
                    hover:bg-gray-50 transition-colors
                    ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-400' : ''}
                  `}>
                    {/* Expand Button */}
                    <td className="px-2 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(user.id)}
                        className="p-1"
                      >
                        {isExpanded ? 
                          <ChevronDownIcon className="h-3 w-3" /> : 
                          <ChevronUpIcon className="h-3 w-3" />
                        }
                      </Button>
                    </td>

                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={user.avatar_url}
                          name={user.name}
                          size="md"
                          className="mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.name}
                            {isCurrentUser && (
                              <Badge variant="primary" className="ml-2 text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {user.username}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    {/* Updated Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm" className="p-1">
                            <EllipsisHorizontalIcon className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: 'View Details',
                            icon: EyeIcon,
                            onClick: () => onViewUser(user)
                          },
                          ...(user.id !== currentUserId ? [
                            {
                              label: 'Edit User',
                              icon: PencilIcon,
                              onClick: () => onEditUser(user)
                            },
                            {
                              label: user.is_active ? 'Deactivate' : 'Activate',
                              icon: user.is_active ? XCircleIcon : CheckCircleIcon,
                              onClick: () => onToggleStatus(user),
                              variant: user.is_active ? 'danger' as const : 'default' as const
                            }
                          ] : [])
                        ]}
                        align="right"
                      />
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-4">
                          {/* User Statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-blue-600">12</div>
                              <div className="text-xs text-gray-500">Tasks Created</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-green-600">8</div>
                              <div className="text-xs text-gray-500">Tasks Assigned</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-orange-600">24</div>
                              <div className="text-xs text-gray-500">Comments</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-2xl font-bold text-purple-600">
                                {Math.floor(Math.random() * 40 + 10)}h
                              </div>
                              <div className="text-xs text-gray-500">Time Logged</div>
                            </div>
                          </div>

                          {/* User Details */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              User Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Full Name:</span>
                                <div className="text-gray-900">{user.name}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Username:</span>
                                <div className="text-gray-900 font-mono">{user.username}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Account Type:</span>
                                <div>{user.is_root ? 'Root User' : 'Normal User'}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Status:</span>
                                <div>{user.is_active ? 'Active' : 'Inactive'}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Created:</span>
                                <div>{new Date(user.created_at).toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Last Updated:</span>
                                <div>{new Date(user.updated_at).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          {/* Recent Activity */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Recent Activity
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span>Created task "Design Homepage" 2 hours ago</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span>Commented on "Setup Database" 5 hours ago</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span>Moved task to "In Progress" 1 day ago</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {user.id !== currentUserId && (
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => onEditUser(user)}
                                size="sm"
                              >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Edit User
                              </Button>
                              <Button
                                variant={user.is_active ? "danger" : "primary"}
                                onClick={() => onToggleStatus(user)}
                                size="sm"
                              >
                                {user.is_active ? (
                                  <>
                                    <XCircleIcon className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;