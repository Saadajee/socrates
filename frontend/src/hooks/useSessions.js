import { useState, useEffect } from 'react';
import api from '../api/client';

export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rag/sessions');
      setSessions(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (title = 'New Dialogue') => {
    const res = await api.post('/rag/create_session', { title });
    setSessions(prev => [res.data, ...prev]);
    return res.data;
  };

  const renameSession = async (id, title) => {
    await api.put(`/rag/session/${id}`, { title });
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/rag/session/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      // Re-throw so confirmDelete can catch it
      throw err;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { sessions, loading, error, fetchSessions, createSession, renameSession, deleteSession };
};