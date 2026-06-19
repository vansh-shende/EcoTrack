import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  List,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Leaf,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { to: '/emissions', label: 'Emissions', icon: List },
  { to: '/insights', label: 'AI Insights', icon: Sparkles },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Efficiency: parse once on mount instead of on every collapse/expand render cycle.
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Eco User', email: 'user@ecotrack.com' };
    } catch {
      return { name: 'Eco User', email: 'user@ecotrack.com' };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside
      className="desktop-sidebar no-print sidebar-wrapper"
      style={{ width: isCollapsed ? '72px' : '260px' }}
    >
      <div>
        {/* Logo Brand Title */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Leaf size={18} style={{ color: '#10B981' }} />
          </div>
          {!isCollapsed && <span className="sidebar-title">EcoTrack</span>}
        </div>

        {/* Dynamic Navigation Stack */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="sidebar-link"
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info Footing Panel */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          style={{
            padding: isCollapsed ? '8px' : '8px 12px',
            backgroundColor: isCollapsed ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
            border: isCollapsed ? 'none' : '1px solid #1C1C28',
          }}
        >
          <div className="sidebar-avatar">
            {user.name ? user.name[0].toUpperCase() : 'E'}
          </div>
          {!isCollapsed && (
            <>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-email">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="sidebar-logout-btn"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>

        {/* Collapse Trigger chevron */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-toggle-btn"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
