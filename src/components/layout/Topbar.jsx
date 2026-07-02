import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdNotifications, MdPerson, MdMenu
} from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import NotificationPanel from './NotificationPanel';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/analytics': 'Analytics',
  '/vehicles': 'Vehicle Management',
  '/drivers': 'Driver Management',
  '/trips': 'Trip Management',
  '/charging': 'Charging Stations',
  '/alerts': 'Alert Center',
  '/reports': 'Reports',
  '/admin': 'Admin Portal',
  '/settings': 'Settings',
};

export default function Topbar() {
  const location = useLocation();
  const { stats, notifPanelOpen, setNotifPanelOpen, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const title = PAGE_TITLES[location.pathname] || 'KADAM mobility';
  const isMobile = useMediaQuery('(max-width: 640px)');
  const left = (isMobile || sidebarCollapsed) ? 0 : 260;

  return (
    <>
      <header className="topbar" style={{
        position: 'fixed',
        top: 0,
        left,
        right: 0,
        height: isMobile ? 56 : 64,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 12px' : '0 24px',
        gap: isMobile ? 8 : 16,
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setSidebarCollapsed(c => !c)} style={{
            background: 'none', border: 'none', color: 'var(--text-primary)',
            cursor: 'pointer', padding: 4, display: 'flex',
          }}>
            <MdMenu size={22} />
          </button>
        )}

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={location.pathname}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {isMobile && location.pathname === '/' ? 'KADAM mobility' : title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Live Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 6,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 20, padding: isMobile ? '3px 8px' : '5px 12px', flexShrink: 0,
        }}>
          <span className="live-dot" />
          <span style={{ fontSize: isMobile ? 10 : 12, color: '#10b981', fontWeight: 600 }} className={isMobile ? '' : ''}>
            {isMobile ? '' : `${stats.running} `}LIVE
          </span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <IconBtn onClick={() => setNotifPanelOpen(o => !o)} title="Notifications">
            <MdNotifications size={isMobile ? 18 : 20} />
            {stats.unreadAlerts > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute', top: -2, right: -2,
                  background: '#ef4444', color: 'white',
                  fontSize: 9, fontWeight: 700, borderRadius: '50%',
                  width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-secondary)',
                }}
              >
                {Math.min(stats.unreadAlerts, 9)}
              </motion.span>
            )}
          </IconBtn>
        </div>

        {/* User Avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8,
          padding: isMobile ? '4px 6px' : '6px 10px', borderRadius: 10,
          border: '1px solid var(--border-color)',
          background: 'var(--glass-bg)',
          flexShrink: 0,
        }}>
          <div style={{
            width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MdPerson size={isMobile ? 14 : 16} color="white" />
          </div>
          <div className="topbar-avatar-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Admin</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Fleet Manager</span>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel />
    </>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
        color: 'var(--text-muted)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', position: 'relative', flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.borderColor = 'var(--border-color-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {children}
    </button>
  );
}
