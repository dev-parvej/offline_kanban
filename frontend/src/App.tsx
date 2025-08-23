import {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Container from './components/ui/Gird/Container';
import {Modal} from "./components/ui/Modal";
import {RootUserForm} from "./View/RootUserForm";
import { Navbar } from './components/ui/Navbar/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { api } from './api';

// Component to handle navigation and active states
function AppContent() {
  const location = useLocation();
  
  const getMenuItems = () => [
    { label: 'Board', href: '/', active: location.pathname === '/' },
    { label: 'Search', href: '/tasks', active: location.pathname === '/tasks' },
    { label: 'Users', href: '/users', active: location.pathname === '/users' },
    { label: 'Settings', href: '/settings', active: location.pathname === '/settings' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <Navbar menuItems={getMenuItems()} />
      <Container isFluid>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Container>
    </div>
  );
}

function App() {
  const [showSetupModal, setShowSetupModal] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      const { data: isSetupComplete } = await api.get('/setup/is-setup-complete');

      if (!isSetupComplete) {
        setShowSetupModal(true);
      } else {
        setShowSetupModal(false);
      }
    };
    checkSetup();
  }, [setShowSetupModal, api, showSetupModal]);

  return (
    <Router>
      <ThemeProvider>
        <Modal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)}>
          <RootUserForm rootSaved={() => setShowSetupModal(false)} />
        </Modal>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;