import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useInsights = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/insights');
      setReport(response.data);
    } catch (err) {
      console.error('Failed to load AI Insights:', err);
      setError(err.message || 'Failed to load AI Insights report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    report,
    loading,
    error,
    refresh: fetchInsights,
  };
};

export default useInsights;
