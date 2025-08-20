import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCenter } from '../Notifications/NotificationCenter';
import { GlobalSearch } from '../Search/GlobalSearch';
import { UserMenu } from '../ui/UserMenu';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">
              Kanban
            </span>
          </Link>
        </div>

        {/* Center - Global Search */}
        <div className="flex-1 max-w-lg mx-8">
          <GlobalSearch />
        </div>

        {/* Right Side - Actions and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <NotificationCenter />
          </div>

          {/* User Menu */}
          <UserMenu
            user={user}
            onLogout={logout}
            trigger={
              <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                <Avatar
                  src={user?.avatar_url}
                  name={user?.name || 'User'}
                  size="sm"
                />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.is_root ? 'Administrator' : 'User'}
                  </div>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
};