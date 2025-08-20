import React from 'react';

interface TasksProps {
  isDarkMode: boolean;
}

export const Tasks: React.FC<TasksProps> = ({ isDarkMode }) => {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Tasks
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Detailed task management
          </p>
        </div>
        <div className={`mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
            <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Task management features coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};