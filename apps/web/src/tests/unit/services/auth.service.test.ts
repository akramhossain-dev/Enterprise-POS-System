import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '@/services/auth.service';
import { tokenManager } from '@/lib/axios';

describe('AuthService (API Client wrapper)', () => {
  beforeEach(() => {
    tokenManager.clearTokens();
  });

  afterEach(() => {
    tokenManager.clearTokens();
  });

  it('login() calls the API, stores access token and returns payload', async () => {
    const res = await authService.login({ email: 'admin@test.com', password: 'password' });
    expect(res.user.email).toBe('admin@test.com');
    expect(res.tokens.accessToken).toBe('mock-access-token');
    expect(tokenManager.getAccessToken()).toBe('mock-access-token');
  });

  it('logout() calls the API and clears the token manager', async () => {
    tokenManager.setAccessToken('some-old-token');
    await authService.logout();
    expect(tokenManager.getAccessToken()).toBeNull();
  });

  it('getMe() returns the current user info', async () => {
    const user = await authService.getMe();
    expect(user.email).toBe('admin@test.com');
    expect(user.role).toBe('admin');
  });

  it('refreshToken() fetches and sets a new access token', async () => {
    const res = await authService.refreshToken();
    expect(res.accessToken).toBe('mock-refreshed-token');
    expect(tokenManager.getAccessToken()).toBe('mock-refreshed-token');
  });
});
