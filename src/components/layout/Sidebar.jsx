import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdBarChart, MdDirectionsCar,
  MdPeople, MdRoute, MdEvStation,
  MdAssessment, MdAdminPanelSettings, MdSettings,
  MdChevronLeft, MdChevronRight, MdElectricCar
} from 'react-icons/md';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: MdDashboard },
  { path: '/analytics', label: 'Analytics', icon: MdBarChart },
  { path: '/vehicles', label: 'Vehicles', icon: MdDirectionsCar },
  { path: '/drivers', label: 'Drivers', icon: MdPeople },
  { path: '/trips', label: 'Trips', icon: MdRoute },
  { path: '/charging', label: 'Charging', icon: MdEvStation },
  { path: '/reports', label: 'Reports', icon: MdAssessment },
  { path: '/admin', label: 'Admin', icon: MdAdminPanelSettings },
  { path: '/settings', label: 'Settings', icon: MdSettings },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, stats } = useApp();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
        gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <MdElectricCar size={20} color="white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>KADAM mobility</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fleet Management</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setSidebarCollapsed(c => !c)}
          style={{
            width: '100%',
            height: 40,
            borderRadius: 10,
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
            padding: '0 12px',
            transition: 'all 0.2s',
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
          {sidebarCollapsed ? <MdChevronRight size={18} /> : <MdChevronLeft size={18} />}
          {!sidebarCollapsed && (
            <span style={{ fontSize: 12, marginRight: 4 }}>Collapse</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

function SidebarItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        marginBottom: 2,
        textDecoration: 'none',
        color: isActive ? '#60a5fa' : 'var(--text-muted)',
        background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
        border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      })}
      onMouseEnter={e => {
        if (!e.currentTarget.style.background.includes('59, 130')) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
      onMouseLeave={e => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.background = '';
          e.currentTarget.style.color = '';
        }
      }}
    >
      {({ isActive }) => (
        <>
          <item.icon size={20} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 400 }}
              >
                {item.label}
                </motion.span>
            )}
          </AnimatePresence>
          </>
      )}
    </NavLink>
  );
}
