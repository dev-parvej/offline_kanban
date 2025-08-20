import React from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ViewColumnsIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SettingsSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const menuItems: SettingsMenuItem[] = [
  {
    id: 'kanban-columns',
    label: 'Kanban Columns',
    icon: ViewColumnsIcon
  },
  {
    id: 'app-settings',
    label: 'App Settings',
    icon: CogIcon
  }
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeSection,
  onSectionChange
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      transition-all duration-300 ease-in-out
    `}>
      <div className="flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Settings
            </h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`
                  w-full flex items-center rounded-lg px-3 py-3 text-left transition-colors
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent className={`
                  h-5 w-5 flex-shrink-0
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `} />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Configure your Kanban board</p>
              <p>and application preferences</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};