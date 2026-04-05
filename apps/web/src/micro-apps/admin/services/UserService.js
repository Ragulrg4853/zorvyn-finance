import apiClient from '@/shared/lib/apiClient';

export async function fetchUsers(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  );
  const response = await apiClient.get('/v1/users', { params });
  return response.data;
}

export async function createUser(payload) {
  const response = await apiClient.post('/v1/users', payload);
  return response.data.data;
}

export async function updateUser(id, payload) {
  const response = await apiClient.patch(`/v1/users/${id}`, payload);
  return response.data.data;
}

export async function deactivateUser(id) {
  const response = await apiClient.delete(`/v1/users/${id}`);
  return response?.data;
}
