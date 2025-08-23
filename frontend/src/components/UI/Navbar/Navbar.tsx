import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import Container from '../Gird/Container';

interface MenuItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  brand?: string;
  menuItems?: MenuItem[];
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  brand = "Offline Kanban", 
  menuItems = [],
  className = ""
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-sm border-b ${className}`}>
      <Container isFluid>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
          {/* Brand/Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {brand}
              </h1>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.active
                    ? 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* User Info & Controls */}
            {isAuthenticated && (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-2 px-3 py-2 text-sm">
                  <UserCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{user?.name || user?.username}</span>
                    {user?.is_root && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md transition-colors text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      </Container>

      {/* Mobile Menu */}
      {isOpen && isAuthenticated && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            {/* User Info */}
            <div className="flex items-center px-3 py-2 mb-2">
              <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-3" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {user?.name || user?.username}
                </div>
                {user?.is_root && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">Administrator</div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  item.active
                    ? 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 inline mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};