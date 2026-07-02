import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdNotifications, MdVpnKey, MdPerson, MdSave } from 'react-icons/md';

export default function Settings() {
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false, battery: true, overspeed: true, offline: true, maintenance: true });
  const [profile, setProfile] = useState({ name: 'Admin User', email: 'admin@fleet.in', phone: '+91 98765 43210' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage your preferences and configuration</p>
      </div>

      {/* Notifications */}
      <Section title="Notifications" icon={MdNotifications}>
        {[
          { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email' },
          { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
          { key: 'sms', label: 'SMS Alerts', desc: 'Critical alerts via SMS' },
          { key: 'battery', label: 'Battery Low Alerts', desc: 'When battery drops below 20%' },
          { key: 'overspeed', label: 'Overspeed Alerts', desc: 'When speed exceeds 80 km/h' },
          { key: 'offline', label: 'Vehicle Offline Alerts', desc: 'When vehicle loses connectivity' },
          { key: 'maintenance', label: 'Maintenance Due', desc: 'Service reminder notifications' },
        ].map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
            <button onClick={() => setNotifications(n => ({...n, [item.key]: !n[item.key]}))} style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: notifications[item.key] ? '#3b82f6' : 'var(--border-color)',
              position: 'relative', transition: 'background 0.3s',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: notifications[item.key] ? 23 : 3,
                transition: 'left 0.3s',
              }} />
            </button>
          </div>
        ))}
      </Section>

      {/* Profile */}
      <Section title="Profile" icon={MdPerson}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{key:'name',label:'Full Name'},{key:'email',label:'Email'},{key:'phone',label:'Phone'}].map(f => (
            <div key={f.key} style={{ gridColumn: f.key==='phone'?'1/-1':'auto' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <input
                className="input-field"
                value={profile[f.key]}
                onChange={e => setProfile(p => ({...p, [f.key]: e.target.value}))}
              />
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleSave} style={{ marginTop: 16 }}>
          <MdSave size={15} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </Section>

      {/* API Keys */}
      <Section title="API Keys" icon={MdVpnKey}>
        {[{ label: 'Map Tiles API Key', value: 'osm_●●●●●●●●●●●●●●●●●●●●' }, { label: 'Telematics API Key', value: 'tlm_●●●●●●●●●●●●●●●●●●●●' }].map(k => (
          <div key={k.label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</label>
            <input className="input-field" value={k.value} readOnly style={{ cursor: 'not-allowed', opacity: 0.7 }} />
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border-color)' }}>
        <Icon size={20} color="#60a5fa" />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
