import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCheck, MdDoneAll } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', dot: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', dot: '#60a5fa' },
};

export default function NotificationPanel() {
  const { notifPanelOpen, setNotifPanelOpen, notifications, markAlertRead, markAllRead, sidebarCollapsed } = useApp();
  const left = sidebarCollapsed ? 72 : 260;

  return (
    <>
      <AnimatePresence>
        {notifPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifPanelOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 149,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
              }}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 380, zIndex: 150,
                background: 'var(--bg-secondary)',
                borderLeft: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Notifications</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {notifications.filter(n => !n.read).length} unread
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" onClick={markAllRead} style={{ padding: '6px 12px', fontSize: 12 }}>
                    <MdDoneAll size={14} /> Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifPanelOpen(false)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-card-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--glass-bg)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {notifications.slice(0, 50).map((notif, idx) => {
                      const colors = SEVERITY_COLORS[notif.severity] || SEVERITY_COLORS.info;
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => markAlertRead(notif.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 12,
                            marginBottom: 6,
                            cursor: 'pointer',
                            background: notif.read ? 'transparent' : colors.bg,
                            border: `1px solid ${notif.read ? 'var(--border-color)' : colors.border}`,
                            transition: 'all 0.2s',
                            opacity: notif.read ? 0.6 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: colors.dot, flexShrink: 0, marginTop: 5,
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                              }}>
                                <span>{notif.type}</span>
                                {notif.read && <MdCheck size={12} color="var(--text-muted)" />}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {notif.vehicleId} · {notif.message || notif.details}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
