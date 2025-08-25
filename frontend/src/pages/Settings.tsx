import React, { useState } from 'react';
import { SettingsSidebar } from '../components/Settings/SettingsSidebar';
import { KanbanColumnsSettings } from '../components/Settings/KanbanColumnsSettings';
import { AppSettings } from '../components/Settings/AppSettings';

export const Settings: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('kanban-columns');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'kanban-columns':
        return <KanbanColumnsSettings />;
      case 'app-settings':
        return <AppSettings />;
      default:
        return <AppSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <SettingsSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-8">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};