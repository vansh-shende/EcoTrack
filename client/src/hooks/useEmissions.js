import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useEmissions = (initialPage = 1, initialCategory = '', initialLimit = 10) => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState(initialCategory);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/emissions?page=${page}&limit=${initialLimit}&sort=log_date:desc`;
      if (category) {
        url += `&category=${category}`;
      }
      const response = await api.get(url);
      setLogs(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      console.error('Failed to fetch emission logs:', err);
      setError(err.message || 'Failed to load emission logs');
    } finally {
      setLoading(false);
    }
  }, [page, category, initialLimit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = async (logData) => {
    setError(null);
    try {
      const response = await api.post('/emissions', logData);
      // Refresh the list to page 1
      if (page === 1) {
        await fetchLogs();
      } else {
        setPage(1);
      }
      return response.data;
    } catch (err) {
      console.error('Failed to create emission log:', err);
      throw err;
    }
  };

  const deleteLog = async (logId) => {
    setError(null);
    try {
      await api.delete(`/emissions/${logId}`);
      await fetchLogs();
    } catch (err) {
      console.error('Failed to delete emission log:', err);
      throw err;
    }
  };

  return {
    logs,
    meta,
    loading,
    error,
    page,
    setPage,
    category,
    setCategory,
    addLog,
    deleteLog,
    refresh: fetchLogs,
  };
};

export default useEmissions;
