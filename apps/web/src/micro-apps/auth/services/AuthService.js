/**
 * AuthService — all auth API calls.
 * Constitution: CLAUDE.md #66 (services handle API, never components)
 */
import apiClient, { setAuthToken, clearAuthToken } from '@/shared/lib/apiClient';

export async function login(username, password) {
  const formData = new URLSearchParams({ username, password });
  const response = await apiClient.post('/v1/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  setAuthToken(response.data.data.access_token);
  return response.data.data;
}

export async function register(username, email, password) {
  const response = await apiClient.post('/v1/auth/register', { username, email, password });
  setAuthToken(response.data.data.access_token);
  return response.data.data;
}

export async function logout() {
  try { await apiClient.post('/v1/auth/logout'); } finally { clearAuthToken(); }
}

export async function getCurrentUser() {
  const response = await apiClient.get('/v1/auth/me');
  return response.data.data;
}
