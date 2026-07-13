import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { ApiResponse } from '@/types/api';
import type { User, UpdateProfilePayload } from '@/types/auth';

class UserService extends ApiClient {
  async getProfile(): Promise<User> {
    const response = await this.get<User>(apiConfig.endpoints.profile);
    return response.data;
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await this.patch<User>(apiConfig.endpoints.profile, payload);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.http.post<ApiResponse<{ avatarUrl: string }>>(
      apiConfig.endpoints.avatar,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  }

  async deleteAvatar(): Promise<ApiResponse<null>> {
    return this.delete<null>(apiConfig.endpoints.avatar);
  }
}

export const userService = new UserService();
