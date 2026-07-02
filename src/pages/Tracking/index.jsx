import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MdSearch, MdFilterList, MdClose, MdBolt, MdSpeed, MdPerson,
  MdLocationOn, MdDirectionsCar, MdBuild, MdRadar, MdRoute,
  MdMyLocation, MdLayers, MdSignalWifi4Bar, MdSignalWifiOff,
  MdChevronRight, MdEvStation
} from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_CONFIG = {
  Running: { color: '#10b981', bg: '#10b981', label: 'Running' },
  Charging: { color: '#3b82f6', bg: '#3b82f6', label: 'Charging' },
  Idle: { color: '#f59e0b', bg: '#f59e0b', label: 'Idle' },
  Offline: { color: '#6b7280', bg: '#6b7280', label: 'Offline' },
  Maintenance: { color: '#f97316', bg: '#f97316', label: 'Maintenance' },
  Emergency: { color: '#ef4444', bg: '#ef4444', label: 'Emergency' },
};

function createVehicleIcon(vehicle) {
  const cfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.Idle;
  const batteryColor = vehicle.battery > 50 ? '#10b981' : vehicle.battery > 20 ? '#f59e0b' : '#ef4444';
  const isMoving = vehicle.status === 'Running';

  const html = `
    <div style="position:relative;width:40px;height:40px;">
      ${isMoving ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${cfg.color}60;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
      <div style="
        width:40px;height:40px;border-radius:50%;
        background:${cfg.color};
        border:3px solid rgba(255,255,255,0.9);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 12px ${cfg.color}60;
        font-size:16px;
        position:relative;z-index:1;
      ">
        ${vehicle.status === 'Running' ? '🚗' : vehicle.status === 'Charging' ? '⚡' : vehicle.status === 'Offline' ? '📵' : vehicle.status === 'Maintenance' ? '🔧' : '🚙'}
      </div>
      <div style="
        position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,0.75);color:white;
        font-size:9px;font-weight:700;
        padding:2px 5px;border-radius:10px;white-space:nowrap;
      ">${vehicle.id}</div>
    </div>
  `;

  return L.divIcon({ html, className: '', iconSize: [40, 60], iconAnchor: [20, 20] });
}

function createStationIcon() {
  return L.divIcon({
    html: `<div style="width:24px;height:24px;border-radius:6px;background:#3b82f6;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(59,130,246,0.6)">⚡</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Animate marker movement
function MovingMarkers({ vehicles, onSelect }) {
  const map = useMap();
  const markersRef = useRef({});

  useEffect(() => {
    vehicles.forEach(v => {
      const icon = createVehicleIcon(v);
      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng([v.latitude, v.longitude]);
        markersRef.current[v.id].setIcon(icon);
      } else {
        const marker = L.marker([v.latitude, v.longitude], { icon })
          .addTo(map)
          .on('click', () => onSelect(v));
        markersRef.current[v.id] = marker;
      }
    });
  }, [vehicles]);

  return null;
}

const FEED_LABELS = {
  moved: (e) => `${e.vehicleId} moving at ${Math.round(e.speed || 0)} km/h`,
  trip_started: (e) => `${e.vehicleId} started trip`,
  charging: (e) => `${e.vehicleId} charging at ${e.battery?.toFixed(0)}%`,
  charging_complete: (e) => `${e.vehicleId} fully charged`,
  status_change: (e) => `${e.vehicleId} → ${e.status}`,
  online: (e) => `${e.vehicleId} back online`,
};

const FEED_COLORS = {
  moved: '#60a5fa', trip_started: '#10b981', charging: '#f59e0b',
  charging_complete: '#34d399', status_change: '#a78bfa', online: '#10b981',
};

export default function Tracking() {
  const { vehicles, liveFeed, stations } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStations, setShowStations] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const mapRef = useRef(null);

  const filteredVehicles = useMemo(() => vehicles.filter(v => {
    const matchSearch = !search || v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.driver.toLowerCase().includes(search.toLowerCase()) ||
      (v.vehicleNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchSearch && matchStatus;
  }), [vehicles, search, statusFilter]);

  const selectedVehicleData = selectedVehicle
    ? vehicles.find(v => v.id === selectedVehicle.id) || selectedVehicle
    : null;

  const handleVehicleSelect = (v) => {
    setSelectedVehicle(v);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* Main Map (70%) */}
      <div style={{ flex: 1, position: 'relative' }}>

        {/* Map Controls Overlay */}
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Layer Toggles */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 12, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Layers</div>
            {[
              { label: 'Charging Stations', state: showStations, toggle: () => setShowStations(s => !s) },
              { label: 'Vehicle Routes', state: showRoutes, toggle: () => setShowRoutes(s => !s) },
            ].map(l => (
              <label key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={l.state} onChange={l.toggle} style={{ accentColor: '#3b82f6' }} />
                {l.label}
              </label>
            ))}
          </div>

          {/* Live count */}
          <div style={{
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
              {vehicles.filter(v => v.status === 'Running').length} vehicles live
            </span>
          </div>
        </div>

        <MapContainer
          ref={mapRef}
          center={[28.6139, 77.2090]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
          />

          {/* Moving Vehicle Markers */}
          <MovingMarkers
            vehicles={filteredVehicles}
            onSelect={handleVehicleSelect}
          />

          {/* Route Polylines */}
          {showRoutes && filteredVehicles
            .filter(v => v.status === 'Running' && v.waypoints?.length > 1)
            .map(v => (
              <Polyline
                key={`route-${v.id}`}
                positions={v.waypoints.map(w => [w.lat, w.lng])}
                color={STATUS_CONFIG[v.status]?.color || '#6b7280'}
                weight={2}
                opacity={0.5}
                dashArray="6,4"
              />
            ))
          }

          {/* Charging Stations */}
          {showStations && stations.map(s => (
            <Marker key={s.id} position={[s.latitude, s.longitude]} icon={createStationIcon()}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12 }}>Available: {s.totalSlots - s.occupiedSlots}/{s.totalSlots}</div>
                  <div style={{ fontSize: 12 }}>Power: {s.powerOutput} kW</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Vehicle Detail Panel (slides over map) */}
        <AnimatePresence>
          {selectedVehicleData && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'absolute', top: 16, left: 16, bottom: 16,
                width: 320, zIndex: 1001,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '16px 18px', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                background: `linear-gradient(135deg, ${STATUS_CONFIG[selectedVehicleData.status]?.color}15, transparent)`,
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedVehicleData.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selectedVehicleData.model}</div>
                  <span style={{
                    display: 'inline-block', marginTop: 6, fontSize: 11, padding: '3px 10px',
                    borderRadius: 20, fontWeight: 700,
                    background: `${STATUS_CONFIG[selectedVehicleData.status]?.color}20`,
                    color: STATUS_CONFIG[selectedVehicleData.status]?.color,
                    border: `1px solid ${STATUS_CONFIG[selectedVehicleData.status]?.color}40`,
                  }}>
                    {selectedVehicleData.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <MdClose size={14} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Battery', value: `${selectedVehicleData.battery?.toFixed(0)}%`, icon: MdBolt, color: selectedVehicleData.battery > 50 ? '#10b981' : selectedVehicleData.battery > 20 ? '#f59e0b' : '#ef4444' },
                    { label: 'Speed', value: `${Math.round(selectedVehicleData.speed || 0)} km/h`, icon: MdSpeed, color: '#60a5fa' },
                    { label: 'Range', value: `${selectedVehicleData.range} km`, icon: MdRoute, color: '#34d399' },
                    { label: 'Temp', value: `${selectedVehicleData.temperature}°C`, icon: MdRadar, color: '#f97316' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <s.icon size={13} color={s.color} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Battery Bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Battery Level</span>
                    <span style={{ color: selectedVehicleData.battery > 50 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {selectedVehicleData.battery?.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                    <motion.div
                      animate={{ width: `${selectedVehicleData.battery}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        height: '100%',
                        background: selectedVehicleData.battery > 50 ? '#10b981' : selectedVehicleData.battery > 20 ? '#f59e0b' : '#ef4444',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>

                {/* Driver */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Driver</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'white',
                    }}>
                      {selectedVehicleData.driver?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedVehicleData.driver}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedVehicleData.driverId}</div>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                {selectedVehicleData.status === 'Running' && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Active Trip</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <InfoRow label="Trip ID" value={selectedVehicleData.currentTrip || 'N/A'} />
                      <InfoRow label="Destination" value={selectedVehicleData.destination || 'N/A'} />
                      <InfoRow label="ETA" value={selectedVehicleData.eta || 'N/A'} />
                      <InfoRow label="Distance Today" value={`${selectedVehicleData.tripDistance?.toFixed(1)} km`} />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <InfoRow label="Last Maintenance" value={selectedVehicleData.lastMaintenance} />
                  <InfoRow label="Region" value={selectedVehicleData.region} />
                  <InfoRow label="Location" value={`${selectedVehicleData.latitude?.toFixed(4)}, ${selectedVehicleData.longitude?.toFixed(4)}`} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Sidebar (30%) */}
      <div style={{
        width: 340,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Search & Filter */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <MdSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              placeholder="Search vehicle, driver..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['All', 'Running', 'Charging', 'Idle', 'Offline', 'Maintenance'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '4px 10px', borderRadius: 20, border: '1px solid', fontSize: 11, cursor: 'pointer', fontWeight: 500,
                  borderColor: statusFilter === s ? (STATUS_CONFIG[s]?.color || '#3b82f6') : 'var(--border-color)',
                  background: statusFilter === s ? `${STATUS_CONFIG[s]?.color || '#3b82f6'}20` : 'transparent',
                  color: statusFilter === s ? (STATUS_CONFIG[s]?.color || '#60a5fa') : 'var(--text-muted)',
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 12 }}>
          {Object.entries(STATUS_CONFIG).slice(0, 5).map(([status, cfg]) => {
            const count = vehicles.filter(v => v.status === status).length;
            return (
              <div key={status} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: cfg.color }}>{count}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status.slice(0, 4)}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs: Vehicle List | Live Feed */}
        <SidebarTabs vehicles={filteredVehicles} liveFeed={liveFeed} onSelect={handleVehicleSelect} selectedId={selectedVehicle?.id} />
      </div>
    </div>
  );
}

function SidebarTabs({ vehicles, liveFeed, onSelect, selectedId }) {
  const [tab, setTab] = useState('vehicles');

  return (
    <>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        {[{ id: 'vehicles', label: `Vehicles (${vehicles.length})` }, { id: 'feed', label: 'Live Feed' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? '#3b82f6' : 'transparent'}`,
              color: tab === t.id ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'vehicles' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 8 }}>
            {vehicles.map(v => {
              const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.Idle;
              return (
                <motion.div
                  key={v.id}
                  onClick={() => onSelect(v)}
                  whileHover={{ x: 2 }}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: selectedId === v.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                    border: `1px solid ${selectedId === v.id ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: cfg.color, flexShrink: 0,
                      boxShadow: v.status === 'Running' ? `0 0 8px ${cfg.color}` : 'none',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.driver} · {v.region}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: v.battery > 50 ? '#10b981' : v.battery > 20 ? '#f59e0b' : '#ef4444' }}>
                        {v.battery?.toFixed(0)}%
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {v.speed > 0 ? `${Math.round(v.speed)} km/h` : '—'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence initial={false}>
              {liveFeed.slice(0, 50).map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: FEED_COLORS[event.type] || '#6b7280',
                    flexShrink: 0, marginTop: 5,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                      {(FEED_LABELS[event.type] || ((e) => e.vehicleId))(event)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {liveFeed.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Waiting for events...
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}
