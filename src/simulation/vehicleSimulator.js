// ─── Vehicle Simulator — Real-Time GPS & Status Updates ───
// Simulates live vehicle movement, battery changes, and alert generation

import { generateVehicles } from '../data/generators';

class VehicleSimulator {
  constructor() {
    this.vehicles = generateVehicles();
    this.listeners = new Map();
    this.alertListeners = [];
    this.feedListeners = [];
    this.intervalId = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._tick();
  }

  stop() {
    this.running = false;
    if (this.intervalId) clearTimeout(this.intervalId);
  }

  getVehicles() {
    return [...this.vehicles];
  }

  addVehicle(v) {
    this.vehicles = [v, ...this.vehicles];
    this._emit();
  }

  updateVehicle(updated) {
    this.vehicles = this.vehicles.map(v => v.id === updated.id ? { ...v, ...updated } : v);
    this._emit();
  }

  deleteVehicle(id) {
    this.vehicles = this.vehicles.filter(v => v.id !== id);
    this._emit();
  }

  // Subscribe to all vehicle updates
  subscribe(id, callback) {
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  // Subscribe to alert events
  onAlert(callback) {
    this.alertListeners.push(callback);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== callback);
    };
  }

  // Subscribe to live feed events
  onFeed(callback) {
    this.feedListeners.push(callback);
    return () => {
      this.feedListeners = this.feedListeners.filter(l => l !== callback);
    };
  }

  _emit() {
    const snapshot = [...this.vehicles];
    this.listeners.forEach(cb => cb(snapshot));
  }

  _emitAlert(alert) {
    this.alertListeners.forEach(cb => cb(alert));
  }

  _emitFeed(event) {
    this.feedListeners.forEach(cb => cb(event));
  }

  _tick() {
    if (!this.running) return;

    // Update 15–30 random vehicles per tick
    const updateCount = 15 + Math.floor(Math.random() * 15);
    const indices = [];
    while (indices.length < updateCount) {
      const idx = Math.floor(Math.random() * this.vehicles.length);
      if (!indices.includes(idx)) indices.push(idx);
    }

    indices.forEach(idx => {
      const v = { ...this.vehicles[idx] };
      this._updateVehicle(v);
      this.vehicles[idx] = v;
    });

    this._emit();

    // Next tick: 2–5 seconds
    const delay = 2000 + Math.random() * 3000;
    this.intervalId = setTimeout(() => this._tick(), delay);
  }

  _updateVehicle(v) {
    const prev = { ...v };

    // Move running vehicles
    if (v.status === 'Running') {
      v.latitude += (Math.random() - 0.5) * 0.003;
      v.longitude += (Math.random() - 0.5) * 0.003;
      v.speed = Math.max(10, Math.min(90, v.speed + (Math.random() - 0.5) * 12));
      v.speed = Math.round(v.speed);
      v.battery = Math.max(5, v.battery - Math.random() * 0.4);
      v.battery = parseFloat(v.battery.toFixed(1));
      v.tripDistance += Math.random() * 0.3;
      v.tripDistance = parseFloat(v.tripDistance.toFixed(2));

      this._emitFeed({ type: 'moved', vehicleId: v.id, speed: v.speed, battery: v.battery });

      // Check alerts
      if (v.battery < 20 && prev.battery >= 20) {
        this._emitAlert({ type: 'Battery Low', severity: 'critical', vehicleId: v.id, message: `Battery at ${v.battery.toFixed(0)}%`, time: new Date().toISOString() });
      }
      if (v.speed > 80 && prev.speed <= 80) {
        this._emitAlert({ type: 'Overspeed', severity: 'warning', vehicleId: v.id, message: `Speed: ${v.speed} km/h`, time: new Date().toISOString() });
      }

      // Occasional status change
      if (Math.random() < 0.005) {
        v.status = Math.random() < 0.5 ? 'Idle' : 'Charging';
        v.speed = 0;
        this._emitFeed({ type: 'status_change', vehicleId: v.id, status: v.status });
      }
    } else if (v.status === 'Charging') {
      v.battery = Math.min(100, v.battery + Math.random() * 1.2);
      v.battery = parseFloat(v.battery.toFixed(1));
      this._emitFeed({ type: 'charging', vehicleId: v.id, battery: v.battery });

      if (v.battery >= 95 && Math.random() < 0.1) {
        v.status = 'Idle';
        this._emitAlert({ type: 'Charging Complete', severity: 'info', vehicleId: v.id, message: `Charged to ${v.battery.toFixed(0)}%`, time: new Date().toISOString() });
        this._emitFeed({ type: 'charging_complete', vehicleId: v.id });
      }
    } else if (v.status === 'Idle') {
      // Small drift
      v.battery = Math.max(5, v.battery - Math.random() * 0.05);
      if (Math.random() < 0.008) {
        v.status = 'Running';
        v.speed = 20 + Math.floor(Math.random() * 20);
        this._emitFeed({ type: 'trip_started', vehicleId: v.id, driver: v.driver });
        this._emitAlert({ type: 'Trip Started', severity: 'info', vehicleId: v.id, message: `${v.driver} started a trip`, time: new Date().toISOString() });
      }
    } else if (v.status === 'Offline') {
      if (Math.random() < 0.005) {
        v.status = 'Idle';
        this._emitFeed({ type: 'online', vehicleId: v.id });
      }
    }

    v.range = Math.round(v.battery * 4.2);
  }
}

// Singleton
export const vehicleSimulator = new VehicleSimulator();
