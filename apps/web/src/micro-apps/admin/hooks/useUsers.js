import { useState, useEffect, useCallback } from 'react';
import { fetchUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deactivateUser as apiDeactivateUser } from '../services/UserService';
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

  const fetchUsersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers(filters);
      setUsers(data.data || []);
      setMeta(data.meta || { total: 0, current_page: 1, total_pages: 1 });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const createUser = async (payload) => {
    await apiCreateUser(payload);
    fetchUsersData();
  };

  const updateUser = async (id, payload) => {
    await apiUpdateUser(id, payload);
    fetchUsersData();
  };

  const deactivateUser = async (id) => {
    await apiDeactivateUser(id);
    fetchUsersData();
  };

  return { 
    users, 
    loading, 
    error, 
    meta, 
    filters, 
    setFilters, 
    refetch: fetchUsersData, 
    createUser, 
    updateUser, 
    deactivateUser 
  };
}
