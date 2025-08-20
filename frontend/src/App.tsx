import {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Container from './components/ui/Gird/Container';
import {Modal} from "./components/ui/Modal";
import {IsSetupComplete} from "../wailsjs/go/main/App"
import {RootUserForm} from "./View/RootUserForm";
import { Navbar } from './components/ui/Navbar/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

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
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      const isSetupComplete = await IsSetupComplete();

      if (!isSetupComplete) {
        setShowSetupModal(true);
      } else {
        setShowSetupModal(false);
      }
    };
    checkSetup();
  }, []);

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