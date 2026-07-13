import { createContext, useContext, useState, useEffect } from 'react';
import { vehicleSimulator } from '../simulation/vehicleSimulator';
import { generateDrivers, generateTrips, generateChargingStations, generateMaintenanceLogs, generateDailyStats } from '../data/generators';

const AppContext = createContext(null);

// Initialize data once
const initialDrivers = generateDrivers();
const initialTrips = generateTrips(800);
const initialStations = generateChargingStations();
const maintenanceLogs = generateMaintenanceLogs(500);
const dailyStats = generateDailyStats(365);

export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState(() => vehicleSimulator.getVehicles());
  const [liveFeed, setLiveFeed] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Start simulator
  useEffect(() => {
    vehicleSimulator.start();

    const unsub = vehicleSimulator.subscribe('app', (updatedVehicles) => {
      setVehicles([...updatedVehicles]);
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
      unsubFeed();
    };
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
    unreadAlerts: 0,
  };

  return (
    <AppContext.Provider value={{
      vehicles,
      drivers: initialDrivers,
      trips: initialTrips,
      stations: initialStations,
      maintenanceLogs,
      dailyStats,
      liveFeed,
      stats,
      sidebarCollapsed, setSidebarCollapsed,
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
