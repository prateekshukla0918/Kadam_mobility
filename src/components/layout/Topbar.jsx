import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPerson, MdMenu
} from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import useMediaQuery from '../../hooks/useMediaQuery';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/analytics': 'Analytics',
  '/vehicles': 'Vehicle Management',
  '/drivers': 'Driver Management',
  '/trips': 'Trip Management',
  '/charging': 'Charging Stations',
  '/reports': 'Reports',
  '/admin': 'Admin Portal',
  '/settings': 'Settings',
};

export default function Topbar() {
  const location = useLocation();
  const { stats, sidebarCollapsed, setSidebarCollapsed } = useApp();
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
          <span style={{ fontSize: isMobile ? 10 : 12, color: '#10b981', fontWeight: 600 }}>
            {isMobile ? '' : `${stats.running} `}LIVE
          </span>
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
    </>
  );
}
