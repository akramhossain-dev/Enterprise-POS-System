import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import { tokenManager } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  User,
  AuthTokens,
  LoginCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  TwoFactorPayload,
  ActiveSession,
} from '@/types/auth';

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  requiresTwoFactor?: boolean;
  twoFactorSessionToken?: string;
}

class AuthService extends ApiClient {
  // ── Core Auth ──────────────────────────────

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(apiConfig.endpoints.auth.login, credentials);
    if (response.data.tokens?.accessToken) {
      tokenManager.setAccessToken(response.data.tokens.accessToken);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.post(apiConfig.endpoints.auth.logout);
    } finally {
      tokenManager.clearTokens();
    }
  }

  async getMe(): Promise<User> {
    const response = await this.get<User>(apiConfig.endpoints.auth.me);
    return response.data;
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await this.post<{ accessToken: string }>(apiConfig.endpoints.auth.refresh);
    if (response.data.accessToken) {
      tokenManager.setAccessToken(response.data.accessToken);
    }
    return response.data;
  }

  // ── Password ───────────────────────────────

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    return this.post<null>(apiConfig.endpoints.auth.forgotPassword, payload);
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    return this.post<null>(apiConfig.endpoints.auth.resetPassword, payload);
  }

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<null>> {
    return this.post<null>(apiConfig.endpoints.auth.changePassword, payload);
  }

  // ── Email Verification ─────────────────────

  async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<{ user: User }>> {
    return this.post<{ user: User }>(apiConfig.endpoints.auth.verifyEmail, payload);
  }

  async resendVerification(payload: ResendVerificationPayload): Promise<ApiResponse<null>> {
    return this.post<null>(apiConfig.endpoints.auth.resendVerification, payload);
  }

  // ── Two Factor ─────────────────────────────

  async verifyTwoFactor(payload: TwoFactorPayload): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(apiConfig.endpoints.auth.twoFactor, payload);
    if (response.data.tokens?.accessToken) {
      tokenManager.setAccessToken(response.data.tokens.accessToken);
    }
    return response.data;
  }

  // ── Sessions ───────────────────────────────

  async getActiveSessions(): Promise<ActiveSession[]> {
    const response = await this.get<ActiveSession[]>(apiConfig.endpoints.sessions);
    return response.data;
  }

  async revokeSession(sessionId: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`${apiConfig.endpoints.sessions}/${sessionId}`);
  }

  async revokeAllSessions(): Promise<ApiResponse<null>> {
    return this.delete<null>(`${apiConfig.endpoints.sessions}/all`);
  }
}

export const authService = new AuthService();
