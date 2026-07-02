import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdDoneAll, MdDelete, MdBatteryAlert, MdSpeed, MdWifiOff, MdBuild, MdLocationOff, MdSos, MdInfo } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Critical' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Warning' },
  info: { color: '#60a5fa', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', label: 'Info' },
};

const ICONS = {
  'Battery Low': MdBatteryAlert, 'Overspeed': MdSpeed, 'Vehicle Offline': MdWifiOff,
  'Maintenance Due': MdBuild, 'GPS Lost': MdLocationOff, 'Driver SOS': MdSos,
};

export default function AlertsPage() {
  const { alerts, markAlertRead, markAllRead } = useApp();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');
  const [readFilter, setReadFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const filtered = alerts.filter(a => {
    const matchSearch = a.type.toLowerCase().includes(search.toLowerCase()) || a.vehicleId.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severity === 'All' || a.severity === severity.toLowerCase();
    const matchRead = readFilter === 'All' || (readFilter === 'Unread' ? !a.read : a.read);
    return matchSearch && matchSeverity && matchRead;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const unread = alerts.filter(a => !a.read).length;
  const critical = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Alert Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{unread} unread of {alerts.length} total alerts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={markAllRead} style={{ fontSize: 13 }}><MdDoneAll size={16} /> Mark All Read</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Alerts', value: alerts.length, color: '#60a5fa' },
          { label: 'Critical', value: critical, color: '#ef4444' },
          { label: 'Unread', value: unread, color: '#f59e0b' },
          { label: 'Resolved', value: alerts.filter(a => a.read).length, color: '#10b981' },
        ].map((s, i) => (
          <motion.div key={s.label} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <MdSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search alerts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 32, width: 220 }} />
        </div>
        {['All', 'Critical', 'Warning', 'Info'].map(s => (
          <button key={s} onClick={() => { setSeverity(s); setPage(1); }} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, cursor: 'pointer',
            borderColor: severity === s ? (s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#3b82f6') : 'var(--border-color)',
            background: severity === s ? (s === 'Critical' ? 'rgba(239,68,68,0.15)' : s === 'Warning' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)') : 'var(--bg-card)',
            color: severity === s ? (s === 'Critical' ? '#ef4444' : s === 'Warning' ? '#f59e0b' : '#60a5fa') : 'var(--text-muted)',
          }}>{s}</button>
        ))}
        {['All', 'Unread', 'Read'].map(s => (
          <button key={s} onClick={() => { setReadFilter(s); setPage(1); }} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, cursor: 'pointer',
            borderColor: readFilter === s ? '#3b82f6' : 'var(--border-color)',
            background: readFilter === s ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
            color: readFilter === s ? '#60a5fa' : 'var(--text-muted)',
          }}>{s}</button>
        ))}
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {paginated.map((alert, i) => {
            const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
            const Icon = ICONS[alert.type] || MdInfo;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => markAlertRead(alert.id)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: `1px solid ${alert.read ? 'var(--border-color)' : config.border}`,
                  background: alert.read ? 'var(--bg-card)' : config.bg,
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                  opacity: alert.read ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${config.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color={config.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.type}</span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                      background: config.bg, color: config.color, border: `1px solid ${config.border}`,
                      flexShrink: 0,
                    }}>{config.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {alert.vehicleId} · {alert.details} · {alert.location}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </div>
                {!alert.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color, flexShrink: 0 }} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ opacity: page===1?0.5:1, padding:'6px 14px', fontSize:12 }}>Prev</button>
          <span style={{ padding: '6px 14px', fontSize: 12, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button className="btn-secondary" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ opacity: page===totalPages?0.5:1, padding:'6px 14px', fontSize:12 }}>Next</button>
        </div>
      )}
    </div>
  );
}
