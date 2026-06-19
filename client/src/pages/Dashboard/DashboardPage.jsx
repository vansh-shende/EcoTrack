import React, { useState } from 'react';
import useDashboard from '../../hooks/useDashboard';
import SummaryCards from './SummaryCards';
import TrendLineChart from '../../components/charts/TrendLineChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import WeeklyBarChart from '../../components/charts/WeeklyBarChart';
import RecentActivity from './RecentActivity';
import EmissionModal from '../../components/modals/EmissionModal';
import api from '../../services/api';
import { Loader2, Plus, Calendar, RotateCw } from 'lucide-react';

export const DashboardPage = () => {
  const [period, setPeriod] = useState('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);
  const { summary, trends, breakdown, activities, loading, error, refresh } = useDashboard(period);

  const handleCreateLog = async (logData) => {
    try {
      await api.post('/emissions', logData);
      refresh();
      return true;
    } catch (err) {
      console.error('Failed to create carbon log:', err);
      alert(err.message || 'Failed to submit log entry.');
      return false;
    }
  };

  const handleDeleteLog = (logId) => {
    setDeleteLogId(logId);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* HEADER SECTION */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#FFF', letterSpacing: '-0.5px', margin: 0 }}>
            Carbon Analytics
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '0.85rem', marginTop: '4px' }}>
            Monitor, measure, and minimize your environmental footprint
          </p>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* REFRESH */}
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              backgroundColor: '#252538',
              border: '1px solid #303046',
              color: '#A1A1AA',
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Refresh dashboard"
          >
            <RotateCw size={16} className={loading ? 'spin' : ''} />
          </button>

          {/* PERIOD SELECTOR */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={16} style={{ position: 'absolute', left: '12px', color: '#A1A1AA', pointerEvents: 'none' }} />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                paddingLeft: '36px',
                backgroundColor: '#252538',
                color: '#FFF',
                border: '1px solid #303046',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          {/* ADD ACTIVITY */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Log Activity
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid #F87171',
            color: '#F87171',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '24px',
          }}
        >
          {error}
        </div>
      )}

      {/* DASHBOARD CONTENT GRID */}
      {loading && !summary ? (
        <div
          style={{
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A1A1AA',
            fontSize: '0.95rem',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #2D2D44',
              borderTopColor: '#4ADE80',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '12px',
            }}
          />
          <span>Aggregating analytics data...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Row 1: Summary Stats */}
          <SummaryCards summary={summary} />

          {/* Row 2: Charts (Trend & Category) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Trend Chart */}
            <div className="card">
              <div className="card-title">
                <span>Carbon Emission Trend</span>
              </div>
              <TrendLineChart data={trends?.series || []} />
            </div>

            {/* Breakdown Chart */}
            <div className="card">
              <div className="card-title">
                <span>Emission Distribution</span>
              </div>
              <CategoryPieChart data={breakdown?.categories || []} />
            </div>
          </div>

          {/* Row 3: Weekly comparison & recent activity logs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Weekly Bar Chart */}
            <div className="card">
              <div className="card-title">
                <span>Weekly Carbon footprint comparison</span>
              </div>
              <WeeklyBarChart logs={activities} />
            </div>

            {/* Recent Activity Table */}
            <RecentActivity
              activities={activities}
              onAddLog={() => setIsModalOpen(true)}
              onDeleteLog={handleDeleteLog}
            />
          </div>

        </div>
      )}

      {/* POPUP MODAL FOR CARBON ENTRY */}
      <EmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLog}
      />

      {/* CUSTOM CONFIRMATION MODAL FOR DELETION */}
      {deleteLogId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: '400px',
              border: '1px solid #3F3F56',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
              padding: '24px',
              animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', color: '#F87171', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ Delete Activity Log
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#D1D5DB', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete this emission log entry? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setDeleteLogId(null)}
                style={{
                  backgroundColor: '#252538',
                  border: '1px solid #303046',
                  color: '#A1A1AA',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#2D2D44'; e.target.style.color = '#FFF'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#252538'; e.target.style.color = '#A1A1AA'; }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/emissions/${deleteLogId}`);
                    refresh();
                  } catch (err) {
                    console.error('Failed to delete carbon log:', err);
                    alert(err.message || 'Failed to delete log entry.');
                  } finally {
                    setDeleteLogId(null);
                  }
                }}
                style={{
                  backgroundColor: '#EF4444',
                  border: 'none',
                  color: '#FFF',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
              >
                Delete Log
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalSlideIn {
          from {
            transform: translateY(15px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
