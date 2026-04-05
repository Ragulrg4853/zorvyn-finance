/**
 * useAuth â€” authentication state. Single source of truth.
 * Constitution: CLAUDE.md #66 (hook manages state), #67 (all 3 async states)
 * Copilot Session 10: implement full body per COPILOT_GUIDE.md Session 10.
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as AuthService from '../services/AuthService';
import { getErrorMessage } from '@/shared/lib/errorHandler';
import { ROLE_PERMISSIONS, ROUTES } from '@/shared/lib/constants';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__zorvyn_token) {
      setLoading(false);
      setUser(null);
      return;
    }

    AuthService.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.login(username, password);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
    router.push(ROUTES.LOGIN);
  }, [router]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
  }, [user]);

  return { user, loading, error, login, logout, hasPermission, isAuthenticated: !!user };
}
