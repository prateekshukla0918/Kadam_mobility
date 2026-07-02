import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdSearch, MdFilterList, MdRoute } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

const STATUS_COLORS = {
  Completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  'In Progress': { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  Cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  Delayed: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
};

export default function Trips() {
  const { trips } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const filtered = trips.filter(t => {
    const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.driver.toLowerCase().includes(search.toLowerCase()) ||
      t.origin.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const completed = trips.filter(t => t.status === 'Completed').length;
  const inProgress = trips.filter(t => t.status === 'In Progress').length;
  const totalRevenue = trips.reduce((s, t) => s + t.fare, 0);

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Trip Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{trips.length} total trips</p>
        </div>
        
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Trips', value: trips.length.toLocaleString(), color: '#60a5fa' },
          { label: 'Completed', value: completed.toLocaleString(), color: '#10b981' },
          { label: 'In Progress', value: inProgress.toLocaleString(), color: '#3b82f6' },
          { label: 'Total Revenue', value: `₹${(totalRevenue/100000).toFixed(1)}L`, color: '#8b5cf6' },
        ].map((s, i) => (
          <motion.div key={s.label} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <MdSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search trips..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 32 }} />
        </div>
        {['All', 'Completed', 'In Progress', 'Cancelled', 'Delayed'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, cursor: 'pointer',
            borderColor: statusFilter === s ? '#3b82f6' : 'var(--border-color)',
            background: statusFilter === s ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
            color: statusFilter === s ? '#60a5fa' : 'var(--text-muted)',
          }}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Driver</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(trip => (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 600, color: '#60a5fa', fontSize: 12 }}>{trip.id}</td>
                  <td>{trip.driver}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{trip.origin}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{trip.destination}</td>
                  <td>{trip.distance} km</td>
                  <td>{trip.duration} min</td>
                  <td style={{ fontWeight: 600 }}>₹{trip.fare}</td>
                  <td>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      background: STATUS_COLORS[trip.status]?.bg || 'transparent',
                      color: STATUS_COLORS[trip.status]?.color || 'var(--text-muted)',
                    }}>{trip.status}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {format(new Date(trip.startTime), 'dd MMM yy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-secondary" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ padding: '6px 14px', fontSize: 12, opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
            <span style={{ padding: '6px 14px', fontSize: 12, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <button className="btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={{ padding: '6px 14px', fontSize: 12, opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


