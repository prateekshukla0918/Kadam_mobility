import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdDirectionsCar, MdEvStation, MdSupervisorAccount, MdAdd, MdEdit, MdDelete, MdLock } from 'react-icons/md';
import { useApp } from '../../context/AppContext';

const ROLES = [
  { role: 'Admin', users: 3, color: '#ef4444', permissions: ['All Access', 'System Settings', 'User Management'] },
  { role: 'Fleet Manager', users: 8, color: '#3b82f6', permissions: ['Vehicle CRUD', 'Driver CRUD', 'Reports', 'Alerts'] },
  { role: 'Operator', users: 12, color: '#10b981', permissions: ['View Tracking', 'View Reports', 'Manage Trips'] },
  { role: 'Viewer', users: 5, color: '#8b5cf6', permissions: ['Read Only Access'] },
];

let nextId = 7;
const ROLE_COLORS = { Admin: '#ef4444', 'Fleet Manager': '#3b82f6', Operator: '#10b981', Viewer: '#8b5cf6' };

export default function Admin() {
  const { vehicles, drivers, stations, trips } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([
    { id: 'USR-001', name: 'Arun Kapoor', email: 'arun@fleet.in', role: 'Admin', status: 'Active', lastLogin: '2026-07-01' },
    { id: 'USR-002', name: 'Meena Sharma', email: 'meena@fleet.in', role: 'Fleet Manager', status: 'Active', lastLogin: '2026-07-01' },
    { id: 'USR-003', name: 'Sunil Jain', email: 'sunil@fleet.in', role: 'Fleet Manager', status: 'Active', lastLogin: '2026-06-30' },
    { id: 'USR-004', name: 'Pooja Gupta', email: 'pooja@fleet.in', role: 'Operator', status: 'Active', lastLogin: '2026-06-30' },
    { id: 'USR-005', name: 'Nitin Tyagi', email: 'nitin@fleet.in', role: 'Operator', status: 'Inactive', lastLogin: '2026-06-20' },
    { id: 'USR-006', name: 'Shweta Dubey', email: 'shweta@fleet.in', role: 'Viewer', status: 'Active', lastLogin: '2026-06-29' },
  ]);

  const handleAddUser = () => {
    const name = prompt('Enter user name:');
    if (!name) return;
    const email = prompt('Enter email:') || `${name.toLowerCase().replace(/\s/g, '.')}@fleet.in`;
    const role = prompt('Enter role (Admin / Fleet Manager / Operator / Viewer):') || 'Viewer';
    const validRole = ['Admin', 'Fleet Manager', 'Operator', 'Viewer'].includes(role) ? role : 'Viewer';
    const id = `USR-${String(nextId++).padStart(3, '0')}`;
    setUsers(prev => [{ id, name, email, role: validRole, status: 'Active', lastLogin: new Date().toISOString().slice(0, 10) }, ...prev]);
  };

  const handleEditUser = (user) => {
    const name = prompt('Edit name:', user.name);
    if (!name) return;
    const role = prompt('Edit role (Admin / Fleet Manager / Operator / Viewer):', user.role) || user.role;
    const validRole = ['Admin', 'Fleet Manager', 'Operator', 'Viewer'].includes(role) ? role : user.role;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, name, role: validRole } : u));
  };

  const handleDeleteUser = (user) => {
    if (confirm(`Delete user ${user.name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Admin Portal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>System administration and user management</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Vehicles', value: vehicles.length, icon: MdDirectionsCar, color: '#3b82f6' },
          { label: 'Total Drivers', value: drivers.length, icon: MdPeople, color: '#10b981' },
          { label: 'Charging Stations', value: stations.length, icon: MdEvStation, color: '#f59e0b' },
          { label: 'System Users', value: users.length, icon: MdSupervisorAccount, color: '#8b5cf6' },
        ].map((s, i) => (
          <motion.div key={s.label} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '20px 22px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['overview', 'users', 'roles'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid', fontSize: 13, cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize',
            borderColor: activeTab === tab ? '#3b82f6' : 'var(--border-color)',
            background: activeTab === tab ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
            color: activeTab === tab ? '#60a5fa' : 'var(--text-muted)',
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Fleet Summary</h3>
            {[
              { label: 'Running Vehicles', value: vehicles.filter(v=>v.status==='Running').length, color: '#10b981' },
              { label: 'Charging', value: vehicles.filter(v=>v.status==='Charging').length, color: '#3b82f6' },
              { label: 'Idle', value: vehicles.filter(v=>v.status==='Idle').length, color: '#f59e0b' },
              { label: 'Offline', value: vehicles.filter(v=>v.status==='Offline').length, color: '#6b7280' },
              { label: 'Maintenance', value: vehicles.filter(v=>v.status==='Maintenance').length, color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </motion.div>
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>User Distribution</h3>
            {ROLES.map(r => (
              <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{r.role}</span>
                <div style={{ height: 6, width: 120, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                  <div style={{ width: `${(r.users/28)*100}%`, height: '100%', background: r.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: r.color, minWidth: 20 }}>{r.users}</span>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {activeTab === 'users' && (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>System Users</span>
            <button className="btn-primary" onClick={handleAddUser} style={{ fontSize: 13, padding: '7px 14px' }}><MdAdd size={15} /> Add User</button>
          </div>
          <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.email}</td>
                  <td><span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role], fontWeight: 600 }}>{u.role}</span></td>
                  <td><span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: u.status==='Active'?'rgba(16,185,129,0.15)':'rgba(107,114,128,0.15)', color: u.status==='Active'?'#10b981':'#9ca3af', fontWeight: 600 }}>{u.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.lastLogin}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-secondary" onClick={() => handleEditUser(u)} style={{ padding: '4px 10px', fontSize: 12 }}><MdEdit size={12} /></button>
                      <button className="btn-danger" onClick={() => handleDeleteUser(u)} style={{ padding: '4px 10px', fontSize: 12 }}><MdDelete size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {ROLES.map((r, i) => (
            <motion.div key={r.role} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: 24, borderLeft: `3px solid ${r.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: r.color }}>{r.role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.users} users</div>
                </div>
                <MdLock size={20} color={r.color} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {r.permissions.map(p => (
                  <div key={p} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#10b981' }}>✓</span> {p}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
