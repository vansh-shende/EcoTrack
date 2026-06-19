import React from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf, BarChart2, List, Sparkles, FileText } from 'lucide-react';
import { UserMenu } from './UserMenu';

export const Navbar = () => {
  return (
    <header
      style={{
        backgroundColor: '#151521',
        borderBottom: '1px solid #303046',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 500,
      }}
    >
      {/* BRAND LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Leaf size={20} style={{ color: '#4ADE80' }} />
        </div>
        <span
          style={{
            color: '#FFF',
            fontWeight: '700',
            fontSize: '1.15rem',
            letterSpacing: '-0.3px',
          }}
        >
          EcoTrack
        </span>
      </div>

      {/* NAVIGATION LINKS */}
      <nav style={{ display: 'flex', gap: '8px', height: '100%', alignItems: 'center' }}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isActive ? '#4ADE80' : '#A1A1AA',
            backgroundColor: isActive ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
            transition: 'all 0.2s',
          })}
        >
          <BarChart2 size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/emissions"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isActive ? '#4ADE80' : '#A1A1AA',
            backgroundColor: isActive ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
            transition: 'all 0.2s',
          })}
        >
          <List size={16} />
          <span>Emissions</span>
        </NavLink>

        <NavLink
          to="/insights"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isActive ? '#4ADE80' : '#A1A1AA',
            backgroundColor: isActive ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
            transition: 'all 0.2s',
          })}
        >
          <Sparkles size={16} />
          <span>AI Insights</span>
        </NavLink>

        <NavLink
          to="/reports"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isActive ? '#4ADE80' : '#A1A1AA',
            backgroundColor: isActive ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
            transition: 'all 0.2s',
          })}
        >
          <FileText size={16} />
          <span>Reports</span>
        </NavLink>
      </nav>

      {/* USER UTILITIES / DROPDOWN */}
      <UserMenu />
    </header>
  );
};

export default Navbar;
