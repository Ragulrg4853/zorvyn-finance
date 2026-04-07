import { useState, useEffect, useCallback } from 'react';
import * as UserService from '../services/UserService';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export function useUsers(options = { enabled: true }) {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    role: '',
    is_active: '',
    page: 1,
    page_size: 10,
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserService.fetchUsers(filters);
      setUsers(data.data || []);
      setMeta(data.meta || { total: 0, current_page: 1, total_pages: 1 });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (options.enabled) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [loadUsers, options.enabled]);

  const createUser = async (payload) => {
    const newUser = await UserService.createUser(payload);
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = async (id, payload) => {
    const updatedUser = await UserService.updateUser(id, payload);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)));
  };

  const activateUser = async (id) => {
    const updatedUser = await UserService.activateUser(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: true, ...updatedUser } : u)));
  };

  const deactivateUser = async (id) => {
    const updatedUser = await UserService.deactivateUser(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: false, ...updatedUser } : u)));
  };

  return { 
    users, 
    setUsers,
    loading, 
    error, 
    meta, 
    filters, 
    setFilters, 
    refetch: loadUsers, 
    createUser, 
    updateUser, 
    activateUser,
    deactivateUser 
  };
}
