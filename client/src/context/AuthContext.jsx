import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getAccessToken, setTokens, clearTokens } from '../utils/storage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user profiles:', error);
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize: check for token and fetch profile
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (token) {
        await fetchCurrentUser();
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for custom silent-refresh failure events
    const handleAuthExpired = () => {
      setUser(null);
      clearTokens();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid credentials or login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword,
      });
      const { user: userData, accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Best-effort logout call to server
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Server logout failed:', error);
    } finally {
      clearTokens();
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
