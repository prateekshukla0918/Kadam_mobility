import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdStar, MdPhone, MdEmail, MdDirectionsCar, MdShield, MdSearch } from 'react-icons/md';
import { useApp } from '../../context/AppContext';

const STATUS_COLORS = { Active: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' }, Inactive: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' } };

export default function Drivers() {
  const { drivers } = useApp();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('trips');

  const filtered = drivers
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Driver Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{drivers.length} registered drivers</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <MdSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 220 }} />
          </div>
          <select
            className="input-field"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="trips">Sort: Most Trips</option>
            <option value="safetyScore">Sort: Safety Score</option>
            <option value="efficiency">Sort: Efficiency</option>
            <option value="rating">Sort: Rating</option>
          </select>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Most Efficient', value: filtered[0]?.name.split(' ')[0] || 'N/A', sub: `${filtered[0]?.efficiency} km/kWh`, color: '#10b981' },
          { label: 'Highest Rating', value: [...filtered].sort((a,b) => b.rating-a.rating)[0]?.name.split(' ')[0] || 'N/A', sub: `★ ${[...filtered].sort((a,b) => b.rating-a.rating)[0]?.rating}`, color: '#f59e0b' },
          { label: 'Safest Driver', value: [...filtered].sort((a,b) => b.safetyScore-a.safetyScore)[0]?.name.split(' ')[0] || 'N/A', sub: `${[...filtered].sort((a,b) => b.safetyScore-a.safetyScore)[0]?.safetyScore}% score`, color: '#8b5cf6' },
          { label: 'Most Trips', value: filtered[0]?.name.split(' ')[0] || 'N/A', sub: `${filtered[0]?.trips} trips`, color: '#3b82f6' },
        ].map((s, i) => (
          <motion.div key={s.label} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Driver Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((driver, i) => (
          <motion.div
            key={driver.id}
            className="card gradient-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            style={{ padding: 20 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: `hsl(${(driver.id.charCodeAt(4) * 37) % 360}, 60%, 45%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {driver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{driver.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{driver.id}</div>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                  background: STATUS_COLORS[driver.status]?.bg,
                  color: STATUS_COLORS[driver.status]?.color,
                }}>{driver.status}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>★ {driver.rating}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.experience}y exp</div>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Trips', value: driver.trips, color: '#60a5fa' },
                { label: 'Safety', value: `${driver.safetyScore}%`, color: '#10b981' },
                { label: 'km/kWh', value: driver.efficiency, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Safety Bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Safety Score</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: driver.safetyScore >= 90 ? '#10b981' : '#f59e0b' }}>{driver.safetyScore}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${driver.safetyScore}%` }}
                  transition={{ delay: i * 0.03 + 0.3 }}
                  style={{ height: '100%', background: driver.safetyScore >= 90 ? '#10b981' : '#f59e0b', borderRadius: 2 }}
                />
              </div>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <MdPhone size={12} />{driver.phone}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
