import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Leaf, BarChart2, List, Sparkles, FileText, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Extract user info from localStorage if present
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Eco User', email: 'user@ecotrack.com' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { to: '/emissions', label: 'Emissions', icon: List },
    { to: '/insights', label: 'AI Insights', icon: Sparkles },
    { to: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside
      className="desktop-sidebar no-print"
      style={{
        width: isCollapsed ? '72px' : '260px',
        backgroundColor: '#0F0F14',
        borderRight: '1px solid #1C1C28',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'width 0.30s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
            paddingLeft: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              minWidth: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <Leaf size={18} style={{ color: '#10B981' }} />
          </div>
          {!isCollapsed && (
            <span
              style={{
                color: '#FFF',
                fontWeight: '700',
                fontSize: '1.2rem',
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s',
              }}
            >
              EcoTrack
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: isActive ? '#10B981' : '#A1A1AA',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textDecoration: 'none',
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#FFF';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                  if (!isActive) {
                    e.currentTarget.style.color = '#A1A1AA';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Toggle Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: isCollapsed ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
            border: isCollapsed ? 'none' : '1px solid #1C1C28',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#1E1E2E',
              border: '1px solid #2D2D44',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              fontWeight: '700',
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {user.name[0].toUpperCase()}
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <span style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name}
              </span>
              <span style={{ color: '#71717A', fontSize: '0.75rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.email}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#71717A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#71717A'}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

        {/* Sidebar Toggle Chevron */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '36px',
            backgroundColor: '#16161E',
            border: '1px solid #1C1C28',
            color: '#71717A',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFF';
            e.currentTarget.style.backgroundColor = '#1C1C28';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#71717A';
            e.currentTarget.style.backgroundColor = '#16161E';
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
