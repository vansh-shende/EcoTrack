import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!user.username) return 'U';
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#E4E4E7',
          padding: '4px',
          borderRadius: '20px',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#A78BFA',
            color: '#151521',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: '600',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {getInitials()}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: '500', display: 'none', md: 'block' }}>
          {user.username}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            width: '200px',
            backgroundColor: '#252538',
            border: '1px solid #303046',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 100,
            padding: '6px 0',
          }}
        >
          <div style={{ padding: '8px 14px', borderBottom: '1px solid #303046' }}>
            <p style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.username}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#A1A1AA', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>

          <div style={{ padding: '4px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                color: '#E4E4E7',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2D2D44')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <User size={16} />
              <span>Profile</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                color: '#E4E4E7',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2D2D44')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Settings size={16} />
              <span>Settings</span>
            </div>

            {user.role === 'admin' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  color: '#4ADE80',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2D2D44')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Shield size={16} />
                <span>Admin Console</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #303046', padding: '4px 0' }}>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 14px',
                fontSize: '0.85rem',
                color: '#F87171',
                textAlign: 'left',
                background: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2D2D44')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
