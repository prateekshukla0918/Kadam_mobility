import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { MdClose, MdBatteryAlert, MdSpeed, MdWifiOff, MdBuild, MdLocationOff, MdSos, MdInfo } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';

const TOAST_ICONS = {
  'Battery Low': MdBatteryAlert,
  'Overspeed': MdSpeed,
  'Vehicle Offline': MdWifiOff,
  'Maintenance Due': MdBuild,
  'GPS Lost': MdLocationOff,
  'Driver SOS': MdSos,
};

const SEVERITY_CONFIG = {
  critical: { accent: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  warning: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  info: { accent: '#60a5fa', bg: 'rgba(59,130,246,0.08)' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(({ id, alert }) => {
          const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          const Icon = TOAST_ICONS[alert.type] || MdInfo;
          return (
            <motion.div
              key={id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="toast"
              style={{ borderLeft: `3px solid ${config.accent}`, background: `var(--bg-card)` }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} color={config.accent} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.type}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {alert.vehicleId} · {alert.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  Just now
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4, flexShrink: 0,
                  borderRadius: 4, transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <MdClose size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
