import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#FFF', letterSpacing: '-0.5px', margin: 0 }}>
            Carbon Analytics
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginTop: '4px' }}>
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
              backgroundColor: '#16161E',
              border: '1px solid #1C1C28',
              color: '#A1A1AA',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1C1C28'; e.currentTarget.style.color = '#FFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16161E'; e.currentTarget.style.color = '#A1A1AA'; }}
            title="Refresh dashboard"
          >
            <RotateCw size={16} className={loading ? 'spin' : ''} />
          </button>

          {/* PERIOD SELECTOR */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={16} style={{ position: 'absolute', left: '14px', color: '#A1A1AA', pointerEvents: 'none' }} />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                paddingLeft: '38px',
                backgroundColor: '#16161E',
                color: '#FFF',
                border: '1px solid #1C1C28',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                height: '38px',
                appearance: 'none',
                paddingRight: '16px',
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
            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', borderRadius: '8px' }}
          >
            <Plus size={16} /> Log Activity
          </button>
        </div>
      </motion.div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#F87171',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            marginBottom: '24px',
          }}
        >
          {error}
        </motion.div>
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
              border: '3px solid #1C1C28',
              borderTopColor: '#10B981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px',
            }}
          />
          <span>Aggregating carbon analytics...</span>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Row 1: Summary Stats */}
          <motion.div variants={itemVariants}>
            <SummaryCards summary={summary} />
          </motion.div>

          {/* Row 2: Charts (Trend & Category) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Trend Chart */}
            <motion.div variants={itemVariants} className="card">
              <div className="card-title">
                <span>Carbon Emission Trend</span>
              </div>
              <TrendLineChart data={trends?.series || []} />
            </motion.div>

            {/* Breakdown Chart */}
            <motion.div variants={itemVariants} className="card">
              <div className="card-title">
                <span>Emission Distribution</span>
              </div>
              <CategoryPieChart data={breakdown?.categories || []} />
            </motion.div>
          </div>

          {/* Row 3: Weekly comparison & recent activity logs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Weekly Bar Chart */}
            <motion.div variants={itemVariants} className="card">
              <div className="card-title">
                <span>Weekly Carbon footprint comparison</span>
              </div>
              <WeeklyBarChart logs={activities} />
            </motion.div>

            {/* Recent Activity Table */}
            <motion.div variants={itemVariants}>
              <RecentActivity
                activities={activities}
                onAddLog={() => setIsModalOpen(true)}
                onDeleteLog={handleDeleteLog}
              />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* POPUP MODAL FOR CARBON ENTRY */}
      <EmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLog}
      />

      {/* CUSTOM CONFIRMATION MODAL FOR DELETION */}
      <AnimatePresence>
        {deleteLogId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(9, 9, 11, 0.8)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card"
              style={{
                width: '90%',
                maxWidth: '420px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                padding: '32px',
                background: '#0F0F14',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: '#EF4444', fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Delete Activity Log
              </h3>
              <p style={{ margin: '0 0 28px 0', color: '#A1A1AA', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Are you sure you want to permanently delete this emission log entry? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setDeleteLogId(null)}
                  style={{
                    backgroundColor: '#1C1C28',
                    border: '1px solid #242435',
                    color: '#A1A1AA',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#242435'; e.target.style.color = '#FFF'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#1C1C28'; e.target.style.color = '#A1A1AA'; }}
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
                    padding: '10px 18px',
                    borderRadius: '8px',
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
