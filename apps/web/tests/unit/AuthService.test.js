import { login, logout } from '../../src/micro-apps/auth/services/AuthService';
import apiClient, { setAuthToken, clearAuthToken } from '../../src/shared/lib/apiClient';

jest.mock('../../src/shared/lib/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call login endpoint with form-data format', async () => {
    apiClient.post.mockResolvedValue({ data: { data: { access_token: 'fake-token' } } });
    
    await login('testuser', 'password123');
    
    expect(apiClient.post).toHaveBeenCalledWith(
      '/v1/auth/login',
      expect.any(URLSearchParams),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  });

  it('should set auth token after successful login', async () => {
    apiClient.post.mockResolvedValue({ data: { data: { access_token: 'real-token' } } });
    
    const result = await login('testuser', 'password123');
    
    expect(setAuthToken).toHaveBeenCalledWith('real-token');
    expect(result).toEqual({ access_token: 'real-token' });
  });

  it('should clear token on logout', async () => {
    apiClient.post.mockResolvedValue({});
    
    await logout();
    
    expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/logout');
    expect(clearAuthToken).toHaveBeenCalled();
  });
});
