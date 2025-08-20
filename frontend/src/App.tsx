import {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Container from './components/ui/Gird/Container';
import {Modal} from "./components/ui/Modal";
import {IsSetupComplete} from "../wailsjs/go/main/App"
import {RootUserForm} from "./View/RootUserForm";
import { Navbar } from './components/ui/Navbar/Navbar';
import { useDarkMode } from './hooks/useDarkMode';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

// Component to handle navigation and active states
function AppContent() {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const getMenuItems = () => [
    { label: 'Board', href: '/', active: location.pathname === '/' },
    { label: 'Search', href: '/tasks', active: location.pathname === '/tasks' },
    { label: 'Users', href: '/users', active: location.pathname === '/users' },
    { label: 'Settings', href: '/settings', active: location.pathname === '/settings' }
  ];

  return (
    <div className={isDarkMode ? 'dark bg-gray-900 min-h-screen' : 'bg-white min-h-screen'}>
      <Navbar 
        menuItems={getMenuItems()}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      <Container isFluid>
        <Routes>
          <Route path="/" element={<Dashboard isDarkMode={isDarkMode} />} />
          <Route path="/tasks" element={<Tasks isDarkMode={isDarkMode} />} />
          <Route path="/users" element={<Users isDarkMode={isDarkMode} />} />
          <Route path="/settings" element={<Settings isDarkMode={isDarkMode} />} />
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
      <Modal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)}>
        <RootUserForm rootSaved={() => setShowSetupModal(false)} />
      </Modal>
      <AppContent />
    </Router>
  );
}

export default App;