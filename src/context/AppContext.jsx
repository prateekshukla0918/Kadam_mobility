import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { vehicleSimulator } from '../simulation/vehicleSimulator';
import { generateAlerts, generateDrivers, generateTrips, generateChargingStations, generateMaintenanceLogs, generateDailyStats } from '../data/generators';

const AppContext = createContext(null);

// Initialize data once
const initialAlerts = generateAlerts(1000);
const initialDrivers = generateDrivers();
const initialTrips = generateTrips(800);
const initialStations = generateChargingStations();
const maintenanceLogs = generateMaintenanceLogs(500);
const dailyStats = generateDailyStats(365);

export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState(() => vehicleSimulator.getVehicles());
  const [alerts, setAlerts] = useState(initialAlerts);
  const [liveFeed, setLiveFeed] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Start simulator
  useEffect(() => {
    vehicleSimulator.start();

    const unsub = vehicleSimulator.subscribe('app', (updatedVehicles) => {
      setVehicles([...updatedVehicles]);
    });

    const unsubAlert = vehicleSimulator.onAlert((alert) => {
      const newAlert = {
        ...alert,
        id: `ALT-live-${Date.now()}`,
        read: false,
        location: 'Delhi NCR',
        details: alert.message,
        driver: 'System',
      };
      setAlerts(prev => [newAlert, ...prev]);
      setNotifications(prev => [newAlert, ...prev.slice(0, 49)]);
      addToast(newAlert);
    });

    const unsubFeed = vehicleSimulator.onFeed((event) => {
      setLiveFeed(prev => [
        { ...event, id: Date.now() + Math.random(), timestamp: new Date().toISOString() },
        ...prev.slice(0, 99),
      ]);
    });

    return () => {
      vehicleSimulator.stop();
      unsub();
      unsubAlert();
      unsubFeed();
    };
  }, []);

  const addToast = useCallback((alert) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, alert }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAlertRead = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    setNotifications(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setNotifications(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const addVehicle = useCallback((v) => {
    vehicleSimulator.addVehicle(v);
  }, []);

  const updateVehicle = useCallback((updated) => {
    vehicleSimulator.updateVehicle(updated);
  }, []);

  const deleteVehicle = useCallback((id) => {
    vehicleSimulator.deleteVehicle(id);
  }, []);

  // Computed stats
  const stats = {
    total: vehicles.length,
    running: vehicles.filter(v => v.status === 'Running').length,
    charging: vehicles.filter(v => v.status === 'Charging').length,
    idle: vehicles.filter(v => v.status === 'Idle').length,
    offline: vehicles.filter(v => v.status === 'Offline').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
    avgBattery: parseFloat((vehicles.reduce((s, v) => s + v.battery, 0) / vehicles.length).toFixed(1)),
    totalDistance: vehicles.reduce((s, v) => s + v.tripDistance, 0).toFixed(0),
    co2Saved: (vehicles.reduce((s, v) => s + v.tripDistance * 0.12, 0)).toFixed(0),
    unreadAlerts: alerts.filter(a => !a.read).length,
  };

  return (
    <AppContext.Provider value={{
      vehicles, selectedVehicle, setSelectedVehicle,
      alerts, markAlertRead, markAllRead,
      drivers: initialDrivers,
      trips: initialTrips,
      stations: initialStations,
      maintenanceLogs,
      dailyStats,
      liveFeed,
      notifications,
      stats,
      sidebarCollapsed, setSidebarCollapsed,
      notifPanelOpen, setNotifPanelOpen,
      toasts, removeToast,
      addVehicle, updateVehicle, deleteVehicle,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
