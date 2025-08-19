import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RootRoute } from './components/auth/RootRoute';

// Pages
import { BoardPage } from './pages/BoardPage';
import { TaskListPage } from './pages/TaskListPage';
import { UserListPage } from './pages/UserListPage';
import { ColumnListPage } from './pages/ColumnListPage';
import { LoginPage } from './pages/LoginPage';
import { SetupPage } from './pages/SetupPage';

// Global styles
import './index.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/setup" element={<SetupPage />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  {/* Default redirect to board */}
                  <Route index element={<Navigate to="/board" replace />} />
                  
                  {/* Main App Routes */}
                  <Route path="board" element={<BoardPage />} />
                  <Route path="tasks" element={<TaskListPage />} />
                  
                  {/* Root-only Routes */}
                  <Route path="users" element={
                    <RootRoute>
                      <UserListPage />
                    </RootRoute>
                  } />
                  <Route path="columns" element={
                    <RootRoute>
                      <ColumnListPage />
                    </RootRoute>
                  } />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;