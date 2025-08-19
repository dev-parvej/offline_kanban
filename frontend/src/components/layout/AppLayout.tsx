import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';

export const AppLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Navigation />
        
        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};