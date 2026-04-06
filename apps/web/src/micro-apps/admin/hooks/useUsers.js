import { useState, useEffect, useCallback } from 'react';
import * as UserService from '../services/UserService';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export function useUsers() {
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
    loadUsers();
  }, [loadUsers]);

  const createUser = async (payload) => {
    await UserService.createUser(payload);
    loadUsers();
  };

  const updateUser = async (id, payload) => {
    await UserService.updateUser(id, payload);
    loadUsers();
  };

  const deactivateUser = async (id) => {
    await UserService.deactivateUser(id);
    loadUsers();
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
    deactivateUser 
  };
}
