import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../src/micro-apps/auth/hooks/useAuth';
import * as AuthService from '../../src/micro-apps/auth/services/AuthService';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/micro-apps/auth/services/AuthService');

// Mock constants so ROLE_PERMISSIONS resolves properly
jest.mock('../../src/shared/lib/constants', () => ({
  ROLE_PERMISSIONS: {
    viewer: ['dashboard:read', 'transactions:read'],
    admin: ['dashboard:read', 'transactions:read', 'transactions:write', 'users:manage', 'roles:manage']
  },
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard'
  }
}));

describe('useAuth hook', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  it('should set loading false after session check', async () => {
    AuthService.getCurrentUser.mockResolvedValue({ id: '1', role: 'viewer' });

    const { result } = renderHook(() => useAuth());
    
    // Initial state
    expect(result.current.loading).toBe(true);

    // Wait for the effect to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual({ id: '1', role: 'viewer' });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should redirect to login when unauthenticated', async () => {
    AuthService.getCurrentUser.mockResolvedValue(null);
    AuthService.logout.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/login');
    expect(result.current.user).toBeNull();
  });

  it('should return correct hasPermission for viewer role', async () => {
    AuthService.getCurrentUser.mockResolvedValue({ id: '1', role: 'viewer', username: 'guest' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.user).not.toBeNull();

    let hasRead = false;
    let hasWrite = false;

    act(() => {
      hasRead = result.current.hasPermission('transactions:read');
      hasWrite = result.current.hasPermission('transactions:write');
    });

    expect(hasRead).toBe(true);
    expect(hasWrite).toBe(false);
  });
});
