/**
 * AuthService — all auth API calls.
 * Constitution: CLAUDE.md #66 (services handle API, never components)
 */
import apiClient from '@/shared/lib/apiClient';

export function setAuthToken(token) {
  if (typeof window !== 'undefined') {
    window.__zorvyn_token = token;
    sessionStorage.setItem('zorvyn_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    window.__zorvyn_token = null;
    sessionStorage.removeItem('zorvyn_token');
    localStorage.removeItem('zorvyn_token');
  }
  clearUserCache();
}

export function restoreToken() {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('zorvyn_token');
    if (saved) window.__zorvyn_token = saved;
    return saved;
  }
  return null;
}

// Proactively restore token on load to prevent race conditions in concurrent hooks
restoreToken();

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

let userPromise = null;
let cachedUser = null;

export async function getCurrentUser(forceRefetch = false) {
  if (cachedUser && !forceRefetch) return cachedUser;
  if (userPromise) return userPromise;

  userPromise = apiClient.get('/v1/auth/me')
    .then(response => {
      cachedUser = response.data.data;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth_changed', { detail: cachedUser }));
      }
      return cachedUser;
    })
    .finally(() => {
      userPromise = null;
    });

  return userPromise;
}

export function getCachedUser() {
  return cachedUser;
}

export function clearUserCache() {
  cachedUser = null;
  userPromise = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth_changed', { detail: null }));
  }
}
