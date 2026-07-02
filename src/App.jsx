import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ToastContainer from './components/ui/ToastContainer';

// Page imports
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import ChargingStations from './pages/ChargingStations';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Vehicles from './pages/Vehicles'; // New page component

function AppContent() {
  const { sidebarCollapsed } = useApp();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Content on the right */}
      <div
        className="sidebar-transition"
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? 72 : 260,
          paddingTop: 64, // topbar height
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <Topbar />
        
        {/* Page router viewports */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/charging" element={<ChargingStations />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* Global Alert Toasts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}
