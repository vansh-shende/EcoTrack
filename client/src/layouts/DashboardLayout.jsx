import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { Menu, X, Leaf, LogOut, BarChart2, List, Sparkles, FileText } from 'lucide-react';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="app-container" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      
      {/* Desktop Sidebar (hidden on mobile via CSS) */}
      <Sidebar />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        
        {/* Mobile Header (hidden on desktop via CSS) */}
        <header className="mobile-header no-print" style={{
          height: '60px',
          backgroundColor: '#0F0F14',
          borderBottom: '1px solid #1C1C28',
          display: 'none', // Overridden in CSS for screens <= 768px
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 110,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <Leaf size={16} style={{ color: '#10B981' }} />
            </div>
            <span style={{ color: '#FFF', fontWeight: '700', fontSize: '1rem', letterSpacing: '-0.5px' }}>EcoTrack</span>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#A1A1AA',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            {mobileMenuOpen ? <X size={20} style={{ color: '#FFF' }} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Drawer Navigation Overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-sidebar-drawer no-print"
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#0F0F14',
              zIndex: 105,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px 16px',
              boxSizing: 'border-box',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      color: isActive ? '#10B981' : '#A1A1AA',
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Profile & Logout in Drawer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid #1C1C28',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1E1E2E',
                    border: '1px solid #2D2D44',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                  <span style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: '600' }}>{user.name}</span>
                  <span style={{ color: '#71717A', fontSize: '0.75rem' }}>{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#71717A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px',
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
