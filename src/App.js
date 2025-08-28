import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function AppContent() {
  const location = useLocation();
  console.log('=== CURRENT ROUTE ===', location.pathname);
  
  // Force re-render by using location.pathname as part of component selection
  const getCurrentComponent = () => {
    console.log('=== RENDERING COMPONENT FOR ===', location.pathname);
    switch (location.pathname) {
      case '/':
        return <LandingPage key="landing" />;
      case '/dashboard':
        return <Dashboard key="dashboard" />;
      default:
        return <LandingPage key="default" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {getCurrentComponent()}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
