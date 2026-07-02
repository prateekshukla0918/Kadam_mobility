import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MdDirectionsCar, MdCheckCircle, MdBolt, MdRadar, MdRoute,
  MdSearch, MdClose, MdEvStation
} from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import AnimatedNumber from '../../components/ui/AnimatedNumber';
import { formatDistanceToNow } from 'date-fns';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_CONFIG = {
  Running: { color: '#10b981', label: 'Running' },
  Charging: { color: '#3b82f6', label: 'Charging' },
  Idle: { color: '#f59e0b', label: 'Idle' },
  Offline: { color: '#6b7280', label: 'Offline' },
  Maintenance: { color: '#f97316', label: 'Maintenance' },
};

function createVehicleIcon(vehicle) {
  const cfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.Idle;
  const isMoving = vehicle.status === 'Running';
  const html = `
    <div style="position:relative;width:36px;height:36px;">
      ${isMoving ? `<div style="position:absolute;inset:-3px;border-radius:50%;border:2px solid ${cfg.color}60;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
      <div style="width:36px;height:36px;border-radius:50%;background:${cfg.color};border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px ${cfg.color}60;font-size:14px;position:relative;z-index:1;">
        ${vehicle.status === 'Running' ? '🚗' : vehicle.status === 'Charging' ? '⚡' : vehicle.status === 'Offline' ? '📵' : vehicle.status === 'Maintenance' ? '🔧' : '🚙'}
      </div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
}

function createStationIcon() {
  return L.divIcon({
    html: '<div style="width:22px;height:22px;border-radius:6px;background:#3b82f6;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(59,130,246,0.5)">⚡</div>',
    className: '', iconSize: [22, 22], iconAnchor: [11, 11],
  });
}

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
  moved: (e) => `${e.vehicleId} ${Math.round(e.speed || 0)} km/h`,
  trip_started: (e) => `${e.vehicleId} started trip`,
  charging: (e) => `${e.vehicleId} ${e.battery?.toFixed(0)}%`,
  charging_complete: (e) => `${e.vehicleId} charged`,
  status_change: (e) => `${e.vehicleId} → ${e.status}`,
  online: (e) => `${e.vehicleId} online`,
};

const FEED_COLORS = {
  moved: '#60a5fa', trip_started: '#10b981', charging: '#f59e0b',
  charging_complete: '#34d399', status_change: '#a78bfa', online: '#10b981',
};

export default function Dashboard() {
  const { stats, vehicles, liveFeed, stations } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tab, setTab] = useState('vehicles');
  const [showStations, setShowStations] = useState(true);

  const filteredVehicles = useMemo(() => vehicles.filter(v => {
    const q = search.toLowerCase();
    return (statusFilter === 'All' || v.status === statusFilter) &&
      (!q || v.id.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q));
  }), [vehicles, search, statusFilter]);

  const selectedData = selectedVehicle
    ? vehicles.find(v => v.id === selectedVehicle.id) || selectedVehicle
    : null;

  const kpiItems = [
    { label: 'Total Vehicles', value: stats.total, icon: MdDirectionsCar, color: '#3b82f6' },
    { label: 'Online Now', value: stats.running + stats.charging + stats.idle, icon: MdCheckCircle, color: '#10b981' },
    { label: 'In Transit', value: stats.running, icon: MdRoute, color: '#8b5cf6' },
    { label: 'Avg Battery', value: stats.avgBattery, icon: MdBolt, color: '#f59e0b', suffix: '%', decimals: 1 },
    { label: 'Active Trips', value: stats.running, icon: MdRadar, color: '#f472b6' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px', overflow: 'hidden', gap: 12 }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
        {kpiItems.map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={15} color={kpi.color} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              <AnimatedNumber value={kpi.value} suffix={kpi.suffix || ''} decimals={kpi.decimals || 0} />
            </div>
          </div>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>

        {/* Map */}
        <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
          <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={true}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              maxZoom={19}
            />
            <MovingMarkers vehicles={filteredVehicles} onSelect={setSelectedVehicle} />
            {showStations && stations.map(s => (
              <Marker key={s.id} position={[s.latitude, s.longitude]} icon={createStationIcon()}>
                <Popup>
                  <div style={{ minWidth: 150 }}>
                    <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>Available: {s.totalSlots - s.occupiedSlots}/{s.totalSlots}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map overlay controls */}
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', gap: 6 }}>
            <label style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={showStations} onChange={() => setShowStations(s => !s)} style={{ accentColor: '#3b82f6' }} />
              Stations
            </label>
            <div style={{
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981', fontWeight: 600,
            }}>
              <span className="live-dot" />
              {vehicles.filter(v => v.status === 'Running').length} live
            </div>
          </div>

          {/* Vehicle Detail Panel */}
          <AnimatePresence>
            {selectedData && (
              <motion.div
                initial={{ x: -360, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -360, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: 300, zIndex: 1001,
                  background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{
                  padding: '14px 16px', borderBottom: '1px solid var(--border-color)',
                  background: `linear-gradient(135deg, ${STATUS_CONFIG[selectedData.status]?.color}10, transparent)`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedData.id}</div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{selectedData.model}</span>
                    </div>
                    <button type="button" onClick={() => setSelectedVehicle(null)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <MdClose size={13} />
                    </button>
                  </div>
                  <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, background: `${STATUS_CONFIG[selectedData.status]?.color}20`, color: STATUS_CONFIG[selectedData.status]?.color, border: `1px solid ${STATUS_CONFIG[selectedData.status]?.color}30` }}>
                    {selectedData.status}
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Battery', value: `${selectedData.battery?.toFixed(0)}%`, color: selectedData.battery > 50 ? '#10b981' : selectedData.battery > 20 ? '#f59e0b' : '#ef4444' },
                      { label: 'Speed', value: `${Math.round(selectedData.speed || 0)} km/h`, color: '#60a5fa' },
                      { label: 'Range', value: `${selectedData.range} km`, color: '#34d399' },
                      { label: 'Temp', value: `${selectedData.temperature}°C`, color: '#f97316' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Battery</span>
                      <span style={{ fontWeight: 600, color: selectedData.battery > 50 ? '#10b981' : '#f59e0b' }}>{selectedData.battery?.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                      <div style={{ width: `${selectedData.battery}%`, height: '100%', background: selectedData.battery > 50 ? '#10b981' : selectedData.battery > 20 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Driver</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                        {selectedData.driver?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedData.driver}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{selectedData.driverId}</div>
                      </div>
                    </div>
                  </div>
                  {selectedData.status === 'Running' && (
                    <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                      <div style={{ fontSize: 9, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Active Trip</div>
                      <InfoRow label="ETA" value={selectedData.eta || 'N/A'} />
                      <InfoRow label="Today" value={`${selectedData.tripDistance?.toFixed(1)} km`} />
                    </div>
                  )}
                  <InfoRow label="Location" value={`${selectedData.latitude?.toFixed(4)}, ${selectedData.longitude?.toFixed(4)}`} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <MdSearch size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" placeholder="Search vehicle..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, fontSize: 12, padding: '6px 10px 6px 30px' }} />
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
              {['All', 'Running', 'Charging', 'Idle', 'Offline'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '3px 8px', borderRadius: 20, border: '1px solid', fontSize: 10, cursor: 'pointer', fontWeight: 500,
                  borderColor: statusFilter === s ? (STATUS_CONFIG[s]?.color || '#3b82f6') : 'var(--border-color)',
                  background: statusFilter === s ? `${STATUS_CONFIG[s]?.color || '#3b82f6'}18` : 'transparent',
                  color: statusFilter === s ? (STATUS_CONFIG[s]?.color || '#3b82f6') : 'var(--text-muted)',
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
            {[{ id: 'vehicles', label: `Vehicles (${filteredVehicles.length})` }, { id: 'feed', label: 'Live Feed' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '8px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#3b82f6' : 'transparent'}`,
                color: tab === t.id ? '#3b82f6' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'vehicles' ? (
              <div style={{ padding: 6 }}>
                {filteredVehicles.map(v => {
                  const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.Idle;
                  return (
                    <div key={v.id} onClick={() => setSelectedVehicle(v)} style={{
                      padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                      background: selectedVehicle?.id === v.id ? 'rgba(59,130,246,0.08)' : 'transparent',
                      border: `1px solid ${selectedVehicle?.id === v.id ? 'rgba(59,130,246,0.2)' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, boxShadow: v.status === 'Running' ? `0 0 6px ${cfg.color}` : 'none' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v.id}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.driver}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: v.battery > 50 ? '#10b981' : v.battery > 20 ? '#f59e0b' : '#ef4444' }}>{v.battery?.toFixed(0)}%</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{v.speed > 0 ? `${Math.round(v.speed)} km/h` : '—'}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {liveFeed.slice(0, 30).map(event => (
                  <div key={event.id} style={{
                    padding: '6px 8px', borderRadius: 6, background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', gap: 6, alignItems: 'flex-start',
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: FEED_COLORS[event.type] || '#6b7280', flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-primary)' }}>{(FEED_LABELS[event.type] || ((e) => e.vehicleId))(event)}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</div>
                    </div>
                  </div>
                ))}
                {liveFeed.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 12 }}>Waiting for events...</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}
