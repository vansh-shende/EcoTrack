import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import InsightsPage from '../pages/Insights/InsightsPage';

// Simple placeholder page for other nav items so they don't crash
const NavigationPlaceholder = ({ title }) => (
  <div
    style={{
      padding: '40px',
      color: '#A1A1AA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <h2 style={{ color: '#FFF', marginBottom: '8px' }}>{title} Module</h2>
    <p>This section is scaffolded and ready for implementation.</p>
  </div>
);

export const AppRouter = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PROTECTED DASHBOARD ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="emissions" element={<NavigationPlaceholder title="Emissions Listing" />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="reports" element={<NavigationPlaceholder title="Reports & Export" />} />
      </Route>

      {/* FALLBACK REDIRECT */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
