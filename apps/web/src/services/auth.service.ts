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
  ChangePasswordPayload,
} from '@/types/auth';

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService extends ApiClient {
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

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    return this.post<null>(apiConfig.endpoints.auth.forgotPassword, payload);
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    return this.post<null>(apiConfig.endpoints.auth.resetPassword, payload);
  }

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<null>> {
    return this.post<null>('/auth/change-password', payload);
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await this.post<{ accessToken: string }>(apiConfig.endpoints.auth.refresh);
    if (response.data.accessToken) {
      tokenManager.setAccessToken(response.data.accessToken);
    }
    return response.data;
  }
}

export const authService = new AuthService();
