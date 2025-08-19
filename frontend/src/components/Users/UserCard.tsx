import React from 'react';
import { 
  EyeIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { DropdownMenu } from '../ui/DropdownMenu';
import { User } from '../../types';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onToggleStatus: (user: User) => void;
  canEdit: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onView,
  onToggleStatus,
  canEdit
}) => {
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

  // Get status color classes
  const getCardBorderColor = () => {
    if (user.is_active) {
      return user.is_root 
        ? 'border-purple-200 bg-purple-50' 
        : 'border-green-200 bg-green-50';
    }
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className={`
      bg-white rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg group
      ${getCardBorderColor()}
      ${!user.is_active ? 'opacity-75' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar
            src={user.avatar_url}
            name={user.name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 font-mono truncate">
              {user.username}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 p-1"
            >
              <EllipsisHorizontalIcon className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              label: 'View Details',
              icon: EyeIcon,
              onClick: () => onView(user)
            },
            ...(canEdit ? [
              {
                label: 'Edit User',
                icon: PencilIcon,
                onClick: () => onEdit(user)
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
      </div>

      {/* Role and Status Badges */}
      <div className="flex items-center justify-between mb-4">
        {getRoleBadge(user)}
        
        <Badge className={`
          text-xs
          ${user.is_active 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200'}
        `}>
          {user.is_active ? (
            <>
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircleIcon className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {Math.floor(Math.random() * 20 + 5)}
          </div>
          <div className="text-xs text-gray-500">Tasks Created</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {Math.floor(Math.random() * 15 + 3)}
          </div>
          <div className="text-xs text-gray-500">Tasks Assigned</div>
        </div>
      </div>

      {/* Recent Activity Indicator */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <ChartBarIcon className="h-3 w-3" />
          <span>Recent Activity</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-xs text-gray-600 truncate">
              Created "Design Homepage"
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-600 truncate">
              Commented on task
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <CalendarDaysIcon className="h-3 w-3" />
            <span>
              Joined {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {/* Last Activity */}
          <div className="flex items-center space-x-1">
            <div className={`
              w-2 h-2 rounded-full 
              ${user.is_active ? 'bg-green-400' : 'bg-gray-400'}
            `}></div>
            <span className="text-xs">
              {user.is_active ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(user)}
          className="flex-1 text-xs"
        >
          <EyeIcon className="h-3 w-3 mr-1" />
          View
        </Button>
        
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="flex-1 text-xs"
          >
            <PencilIcon className="h-3 w-3 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {/* Quick Status Toggle */}
      {canEdit && (
        <div className="mt-2">
          <Button
            variant={user.is_active ? "danger" : "primary"}
            size="sm"
            onClick={() => onToggleStatus(user)}
            className="w-full text-xs"
          >
            {user.is_active ? (
              <>
                <XCircleIcon className="h-3 w-3 mr-1" />
                Deactivate User
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Activate User
              </>
            )}
          </Button>
        </div>
      )}

      {/* Current User Indicator */}
      {!canEdit && (
        <div className="mt-2">
          <Badge variant="primary" className="w-full justify-center text-xs py-1">
            This is your account
          </Badge>
        </div>
      )}
    </div>
  );
};

export default UserCard;