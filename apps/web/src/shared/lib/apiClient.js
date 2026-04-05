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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.__zorvyn_token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      config.headers['X-Correlation-ID'] = crypto.randomUUID();
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.__zorvyn_token = null;
      window.location.href = '/login';
    }
    const apiError = error.response?.data?.error || {
      code: 'SYSTEM_001',
      message: error.message || 'An unexpected error occurred',
      field: null,
    };
    return Promise.reject(apiError);
  },
);

export function setAuthToken(token) {
  if (typeof window !== 'undefined') window.__zorvyn_token = token;
}
export function clearAuthToken() {
  if (typeof window !== 'undefined') window.__zorvyn_token = null;
}

export default apiClient;
