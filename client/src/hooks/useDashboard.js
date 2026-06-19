import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useDashboard = (period = 'month') => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Map period configurations
      const groupBy = period === 'year' ? 'month' : 'day';

      const [summaryRes, trendsRes, breakdownRes, activitiesRes] = await Promise.all([
        api.get(`/dashboard/summary?period=${period}`),
        api.get(`/dashboard/trends?period=${period}&group_by=${groupBy}`),
        api.get(`/dashboard/breakdown?period=${period}`),
        api.get('/emissions?page=1&limit=6&sort=log_date:desc'),
      ]);

      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setBreakdown(breakdownRes.data);
      setActivities(activitiesRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    summary,
    trends,
    breakdown,
    activities,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

export default useDashboard;
