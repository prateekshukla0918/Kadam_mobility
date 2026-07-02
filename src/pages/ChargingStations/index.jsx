import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MdList, MdMap, MdBolt, MdAccessTime } from 'react-icons/md';
import { useApp } from '../../context/AppContext';

const createStationIcon = (status) => {
  const color = status === 'Operational' ? '#10b981' : '#f59e0b';
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-size:14px">⚡</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export default function ChargingStations() {
  const { stations } = useApp();
  const [view, setView] = useState('list');

  const operational = stations.filter(s => s.status === 'Operational').length;
  const totalSlots = stations.reduce((s, st) => s + st.totalSlots, 0);
  const occupied = stations.reduce((s, st) => s + st.occupiedSlots, 0);
  const available = totalSlots - occupied;

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Charging Stations</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{stations.length} stations across Delhi NCR</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ v: 'list', icon: MdList }, { v: 'map', icon: MdMap }].map(({ v, icon: Icon }) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid',
              borderColor: view === v ? '#3b82f6' : 'var(--border-color)',
              background: view === v ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
              color: view === v ? '#60a5fa' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            }}><Icon size={16} /> {v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Operational', value: operational, color: '#10b981' },
          { label: 'Total Slots', value: totalSlots, color: '#60a5fa' },
          { label: 'Available', value: available, color: '#34d399' },
          { label: 'Occupied', value: occupied, color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {view === 'map' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderRadius: 16, overflow: 'hidden', height: 500 }}>
          <MapContainer center={[28.6139, 77.209]} zoom={11} style={{ height: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap'
            />
            {stations.map(s => (
              <Marker key={s.id} position={[s.latitude, s.longitude]} icon={createStationIcon(s.status)}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.operator}</div>
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      <div>Slots: {s.totalSlots - s.occupiedSlots}/{s.totalSlots} available</div>
                      <div>Power: {s.powerOutput} kW</div>
                      <div>Rate: ₹{s.price}/kWh</div>
                      <div>Wait: ~{s.avgWaitTime} min</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {stations.map((s, i) => {
            const occupancyPct = Math.round(s.occupiedSlots / s.totalSlots * 100);
            const available = s.totalSlots - s.occupiedSlots;
            return (
              <motion.div key={s.id} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.operator}</div>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
                    background: s.status === 'Operational' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: s.status === 'Operational' ? '#10b981' : '#f59e0b',
                  }}>{s.status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Available', value: available, color: '#10b981' },
                    { label: 'Fast', value: s.fastChargers, color: '#3b82f6' },
                    { label: 'Wait', value: `${s.avgWaitTime}m`, color: '#f59e0b' },
                  ].map(st => (
                    <div key={st.label} style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 4px' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: st.color }}>{st.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{st.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Occupancy</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: occupancyPct > 80 ? '#ef4444' : occupancyPct > 50 ? '#f59e0b' : '#10b981' }}>{occupancyPct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${occupancyPct}%` }}
                      transition={{ delay: i * 0.04 + 0.3 }}
                      style={{ height: '100%', background: occupancyPct > 80 ? '#ef4444' : occupancyPct > 50 ? '#f59e0b' : '#10b981', borderRadius: 3 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{s.powerOutput} kW output</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{s.price}/kWh</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
