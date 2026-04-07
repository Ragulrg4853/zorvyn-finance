import { useState, useEffect, useCallback } from 'react';
import { fetchRoles, fetchPermissions, fetchAuditLogs as apiFetchAuditLogs, assignPermissions as apiAssignPermissions } from '../services/RoleService';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState(null);

  const [auditFilters, setAuditFilters] = useState({
    page: 1,
    page_size: 50,
    action: ''
  });
  const [auditMeta, setAuditMeta] = useState(null);

  const fetchRolesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesRes, permsRes] = await Promise.all([fetchRoles(), fetchPermissions()]);
      setRoles(rolesRes || []);
      setPermissions(permsRes || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogsData = useCallback(async () => {
    try {
      setAuditLoading(true);
      const data = await apiFetchAuditLogs(auditFilters);
      setAuditLogs(data.data || []);
      setAuditMeta(data.meta || { total: 0, current_page: 1, total_pages: 1 });
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditFilters]);

  useEffect(() => {
    fetchRolesData();
  }, [fetchRolesData]);

  useEffect(() => {
    fetchAuditLogsData();
  }, [fetchAuditLogsData]);

  const assignPermissions = async (roleId, payload) => {
    await apiAssignPermissions(roleId, payload);
    await fetchRolesData(); // refresh roles and permissions
  };

  return {
    roles,
    permissions,
    auditLogs,
    loading,
    auditLoading,
    error,
    assignPermissions,
    auditFilters,
    setAuditFilters,
    auditMeta,
    refetchAuditLogs: fetchAuditLogsData,
    refetchRoles: fetchRolesData,
  };
}
