import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedFor?: 'root' | 'normal' | 'both'; // Who can access this route
}

// Loading spinner component
const LoadingSpinner: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
          isDarkMode ? 'border-blue-400' : 'border-blue-600'
        }`}></div>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Loading...
        </p>
      </div>
    </div>
  );
};

// Access denied component
const AccessDenied: React.FC<{ userType: string; requiredType: string }> = ({ 
  userType, 
  requiredType 
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className={`text-2xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Access Denied
        </h1>
        <p className={`mb-4 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          This page is only accessible to {requiredType} users.
        </p>
        <p className={`text-sm mb-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          You are currently logged in as: <strong>{userType}</strong>
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedFor = 'both' 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check access permissions
  const isRootUser = user.is_root;
  const userType = isRootUser ? 'Administrator' : 'Normal User';

  switch (allowedFor) {
    case 'root':
      // Only root users can access (Settings, Users pages)
      if (!isRootUser) {
        return <AccessDenied userType={userType} requiredType="administrator" />;
      }
      break;
      
    case 'normal':
      // Only normal users can access (if any specific pages)
      if (isRootUser) {
        return <AccessDenied userType={userType} requiredType="normal" />;
      }
      break;
      
    case 'both':
    default:
      // Both root and normal users can access (Board, Tasks pages)
      // No additional check needed
      break;
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};