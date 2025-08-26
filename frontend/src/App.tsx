import {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Container from './components/ui/Gird/Container';
import {Modal} from "./components/ui/Modal";
import {RootUserForm} from "./View/RootUserForm";
import { Navbar } from './components/ui/Navbar/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPage } from './components/Auth/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { api } from './api';

// Component to handle navigation and active states
function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const [ appName, setAppName ] = useState('')
  
  const getMenuItems = () => {
    const baseItems = [
      { label: 'Board', href: '/', active: location.pathname === '/' },
      { label: 'Search', href: '/tasks', active: location.pathname === '/tasks' }
    ];

    // Add root-only menu items
    if (user?.is_root) {
      baseItems.push(
        { label: 'Users', href: '/users', active: location.pathname === '/users' },
        { label: 'Settings', href: '/settings', active: location.pathname === '/settings' }
      );
    }

    return baseItems;
  };

   const getAppName = async () => {
    const { data: name } = await api.get('/setup/settings')
    setAppName(name)
  }

  useEffect(() => {
    getAppName()
  })

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <Navbar menuItems={getMenuItems()} brand={ appName ? appName : 'loading...' } />
      <Container isFluid>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes for both root and normal users */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedFor="both">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute allowedFor="both">
                <Tasks />
              </ProtectedRoute>
            } 
          />
          
          {/* Root-only routes */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedFor="root">
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedFor="root">
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
    </div>
  );
}

function App() {
  const [showSetupModal, setShowSetupModal] = useState(false);

  const checkSetup = async () => {
    try {
      const { data: isSetupComplete } = await api.get('/setup/is-setup-complete');

      if (!isSetupComplete) {
        setShowSetupModal(true);
      } else {
        setShowSetupModal(false);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      // If API fails, assume setup is needed
      setShowSetupModal(true);
    }
  };

  useEffect(() => {
    checkSetup();
  }, [showSetupModal]);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Modal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)}>
            <RootUserForm rootSaved={() => setShowSetupModal(false)} />
          </Modal>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;