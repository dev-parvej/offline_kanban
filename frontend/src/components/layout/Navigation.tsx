import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Squares2X2Icon,
  ListBulletIcon,
  UsersIcon,
  RectangleStackIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

interface NavigationItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
  rootOnly?: boolean;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  badge,
  rootOnly = false 
}) => {
  const { user } = useAuth();
  
  // Hide root-only items for normal users
  if (rootOnly && !user?.is_root) {
    return null;
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {badge && (
        <Badge variant="secondary" className="text-xs ml-auto">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

export const Navigation: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 px-4 py-6 overflow-y-auto">
      {/* Main Navigation */}
      <div className="space-y-1 mb-8">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Main
        </h3>
        
        <NavigationItem
          to="/board"
          icon={Squares2X2Icon}
          label="Board"
        />
        
        <NavigationItem
          to="/tasks"
          icon={ListBulletIcon}
          label="All Tasks"
        />
      </div>

      {/* Administration Section (Root Only) */}
      {user?.is_root && (
        <div className="space-y-1 mb-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Administration
          </h3>
          
          <NavigationItem
            to="/users"
            icon={UsersIcon}
            label="Users"
            rootOnly={true}
          />
          
          <NavigationItem
            to="/columns"
            icon={RectangleStackIcon}
            label="Columns"
            rootOnly={true}
          />
        </div>
      )}

      {/* Analytics Section (Future) */}
      <div className="space-y-1">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Insights
        </h3>
        
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed">
          <ChartBarIcon className="h-5 w-5" />
          <span>Analytics</span>
          <Badge variant="outline" className="text-xs ml-auto">
            Soon
          </Badge>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-gray-200">
        <div className="px-3 text-xs text-gray-500">
          <div className="mb-1">Offline Kanban v1.0</div>
          <div>
            Logged in as{' '}
            <span className="font-medium text-gray-700">
              {user?.name}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};