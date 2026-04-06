/**
 * Axios API client — single instance for all requests.
 * Constitution: CLAUDE.md #66, #37 (no sensitive data in logs)
 *
 * Responsibilities:
 *  1. Inject Authorization Bearer token on every authenticated request
 *  2. Inject X-Correlation-ID header for tracing
 *  3. Handle 401 -> clear token -> redirect to /login (auto-logout)
 *  4. Normalise errors to { code, message, field } shape
 */
'use client';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zorvyn-finance-production.up.railway.app';
if (!BASE_URL) {
  console.error('NEXT_PUBLIC_API_URL is not set. Check environment variables.');
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && window.__zorvyn_token) {
    config.headers.Authorization = `Bearer ${window.__zorvyn_token}`;
  }
  config.headers['X-Correlation-ID'] = 
    (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).slice(2);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your network or if the backend is running.',
        field: null,
      });
    }
    if (error.response.status === 401) {
      if (typeof window !== 'undefined') {
        window.__zorvyn_token = null;
        sessionStorage.removeItem('zorvyn_token');
        window.dispatchEvent(new CustomEvent('auth_changed', { detail: null }));
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    if (error.response.status === 403) {
      if (typeof window !== 'undefined') {
        window.__zorvyn_token = null;
        sessionStorage.removeItem('zorvyn_token');
        window.dispatchEvent(new CustomEvent('auth_changed', { detail: null }));
        sessionStorage.setItem('auth_toast', 'Your permissions have been updated. Please log in again.');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    const apiError = error.response?.data?.error || {
      code: 'SYSTEM_001',
      message: error.response?.data?.detail?.message || 'An unexpected error occurred',
      field: null,
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;
