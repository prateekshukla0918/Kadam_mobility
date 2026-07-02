import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdAssessment, MdDirectionsCar, MdBolt, MdAttachMoney, MdBuild } from 'react-icons/md';

const REPORT_TYPES = [
  { id: 'trip', label: 'Trip Report', icon: MdAssessment, color: '#3b82f6', desc: 'Detailed trip analytics, routes, durations, and fares' },
  { id: 'vehicle', label: 'Vehicle Report', icon: MdDirectionsCar, color: '#10b981', desc: 'Fleet utilization, mileage, and performance metrics' },
  { id: 'battery', label: 'Battery Report', icon: MdBolt, color: '#f59e0b', desc: 'Charging cycles, health, and consumption patterns' },
  { id: 'revenue', label: 'Revenue Report', icon: MdAttachMoney, color: '#8b5cf6', desc: 'Earnings breakdown by vehicle, driver, and region' },
  { id: 'maintenance', label: 'Maintenance Report', icon: MdBuild, color: '#ef4444', desc: 'Service history, costs, and upcoming schedules' },
];

const SAMPLE_DATA = [
  { id: 'TRIP-10001', vehicle: 'EV-1001', driver: 'Rahul Sharma', distance: '48 km', revenue: '₹576', status: 'Completed', date: '2026-06-30' },
  { id: 'TRIP-10002', vehicle: 'EV-1042', driver: 'Priya Patel', distance: '23 km', revenue: '₹276', status: 'Completed', date: '2026-06-30' },
  { id: 'TRIP-10003', vehicle: 'EV-1017', driver: 'Amit Kumar', distance: '67 km', revenue: '₹804', status: 'Completed', date: '2026-06-29' },
  { id: 'TRIP-10004', vehicle: 'EV-1089', driver: 'Sunita Singh', distance: '31 km', revenue: '₹372', status: 'Delayed', date: '2026-06-29' },
  { id: 'TRIP-10005', vehicle: 'EV-1055', driver: 'Vijay Mehta', distance: '52 km', revenue: '₹624', status: 'Completed', date: '2026-06-28' },
];

export default function Reports() {
  const [selectedType, setSelectedType] = useState('trip');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Reports</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Generate and export fleet reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Report Type Selector */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Report Type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REPORT_TYPES.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedType(r.id)}
                style={{
                  padding: '14px 16px', borderRadius: 12, border: '1px solid',
                  borderColor: selectedType === r.id ? r.color : 'var(--border-color)',
                  background: selectedType === r.id ? `${r.color}15` : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${r.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <r.icon size={18} color={r.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedType === r.id ? r.color : 'var(--text-primary)' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Report Preview */}
        <div>
          {/* Preview Table */}
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {REPORT_TYPES.find(r => r.id === selectedType)?.label} Preview
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>— {dateRange}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Distance</th><th>Revenue</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_DATA.map(row => (
                    <tr key={row.id}>
                      <td style={{ color: '#60a5fa', fontWeight: 600, fontSize: 12 }}>{row.id}</td>
                      <td>{row.vehicle}</td>
                      <td>{row.driver}</td>
                      <td>{row.distance}</td>
                      <td style={{ fontWeight: 600 }}>{row.revenue}</td>
                      <td><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{row.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
