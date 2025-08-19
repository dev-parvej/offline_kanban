import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface RootRouteProps {
  children: React.ReactNode;
}

export const RootRoute: React.FC<RootRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to board if not root user
  if (!user?.is_root) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShieldExclamationIcon className="mx-auto h-16 w-16 text-red-400" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500 mb-4">
            This page is only accessible to administrators.
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};