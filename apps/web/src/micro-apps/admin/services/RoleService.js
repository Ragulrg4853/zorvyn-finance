import apiClient from '@/shared/lib/apiClient';

export async function fetchRoles() {
  const response = await apiClient.get('/v1/roles');
  return response.data.data;
}

export async function fetchPermissions() {
  const response = await apiClient.get('/v1/permissions');
  return response.data.data;
}

export async function assignPermissions(roleId, payload) {
  const defaultPayload = { grant: [], revoke: [], ...payload };
  const response = await apiClient.patch(`/v1/roles/${roleId}/permissions`, defaultPayload);
  return response.data.data;
}

export async function fetchAuditLogs(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  );
  const response = await apiClient.get('/v1/audit/logs', { params });
  return response.data;
}
