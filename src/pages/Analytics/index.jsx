import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { MdTrendingUp, MdCo2, MdNature, MdLocalGasStation } from 'react-icons/md';
import { generateDailyStats } from '../../data/generators';

const RANGE_OPTIONS = ['7 Days', '30 Days', '90 Days', '1 Year'];
const RANGE_MAP = { '7 Days': 7, '30 Days': 30, '90 Days': 90, '1 Year': 365 };

const PERFORMANCE_DATA = [
  { driver: 'Rahul Sharma', trips: 142, safety: 97, efficiency: 7.2, rating: 4.9 },
  { driver: 'Priya Patel', trips: 138, safety: 95, efficiency: 7.0, rating: 4.8 },
  { driver: 'Amit Kumar', trips: 131, safety: 94, efficiency: 6.8, rating: 4.8 },
  { driver: 'Sunita Singh', trips: 129, safety: 93, efficiency: 6.7, rating: 4.7 },
  { driver: 'Vijay Mehta', trips: 125, safety: 92, efficiency: 6.5, rating: 4.7 },
  { driver: 'Deepa Nair', trips: 119, safety: 91, efficiency: 6.3, rating: 4.6 },
  { driver: 'Arjun Gupta', trips: 115, safety: 90, efficiency: 6.1, rating: 4.6 },
  { driver: 'Kavya Reddy', trips: 112, safety: 89, efficiency: 5.9, rating: 4.5 },
];

const allStats = generateDailyStats(365);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [range, setRange] = useState('30 Days');
  const { dailyStats } = useApp();
  const days = RANGE_MAP[range];
  const data = allStats.slice(-days);
  const step = Math.max(1, Math.floor(days / 12));
  const chartData = data.filter((_, i) => i % step === 0);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalTrips = data.reduce((s, d) => s + d.trips, 0);
  const totalDistance = data.reduce((s, d) => s + d.distance, 0);
  const co2Saved = (totalDistance * 0.12).toFixed(0);
  const treeEquiv = Math.round(co2Saved / 21);
  const fuelSaved = (totalDistance / 10).toFixed(0);

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Analytics & Insights</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Fleet performance metrics and trends</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid',
                fontSize: 13, cursor: 'pointer', fontWeight: 500,
                borderColor: range === opt ? '#3b82f6' : 'var(--border-color)',
                background: range === opt ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
                color: range === opt ? '#60a5fa' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >{opt}</button>
          ))}
        </div>
      </div>

      {/* Carbon Savings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'CO₂ Saved', value: `${Number(co2Saved).toLocaleString()} kg`, icon: MdCo2, color: '#10b981' },
          { label: 'Tree Equivalent', value: `${treeEquiv.toLocaleString()} trees`, icon: MdNature, color: '#34d399' },
          { label: 'Fuel Saved', value: `${Number(fuelSaved).toLocaleString()} L`, icon: MdLocalGasStation, color: '#f59e0b' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <item.icon size={24} color={item.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Vehicle Usage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="activeVehicles" name="Active Vehicles" stroke="#3b82f6" fill="url(#usageGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Distance Travelled (km)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="distance" name="Distance" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Revenue Analytics (₹)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Energy Consumption (kWh)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="energy" name="Energy" stroke="#f59e0b" fill="url(#energyGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue/100000).toFixed(1)}L`, sub: `${range}` },
          { label: 'Total Trips', value: totalTrips.toLocaleString(), sub: `Avg ${Math.round(totalTrips/days)}/day` },
          { label: 'Total Distance', value: `${(totalDistance/1000).toFixed(1)}K km`, sub: `Avg ${Math.round(totalDistance/days)} km/day` },
        ].map((s, i) => (
          <motion.div key={s.label} className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }} style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0 2px' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Driver Leaderboard */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Driver Performance Leaderboard</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Driver</th>
                <th>Trips</th>
                <th>Safety Score</th>
                <th>Efficiency (km/kWh)</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_DATA.map((d, i) => (
                <tr key={d.driver}>
                  <td>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : 'var(--text-muted)',
                    }}>#{i+1}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{d.driver}</td>
                  <td style={{ color: '#60a5fa', fontWeight: 600 }}>{d.trips}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
                        <div style={{ width: `${d.safety}%`, height: '100%', background: d.safety >= 95 ? '#10b981' : d.safety >= 90 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, minWidth: 28, color: 'var(--text-secondary)' }}>{d.safety}%</span>
                    </div>
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>{d.efficiency}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#f59e0b' }}>★</span>
                      <span style={{ fontWeight: 600 }}>{d.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
