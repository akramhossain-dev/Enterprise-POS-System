import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { apiConfig } from '@/config/api';
import { authConfig } from '@/config/auth';
import { normalizeError } from '@/utils/error';

// ---- Token Storage (memory — not localStorage for security) ----
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const tokenManager = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },
  clearTokens: () => {
    accessToken = null;
  },
};

// ---- Axios Instance ----
const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // send httpOnly refresh cookie
});

// ---- Request Interceptor ----
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(normalizeError(error)),
);

// ---- Response Interceptor ----
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const originalRequest = (
      error as { config?: InternalAxiosRequestConfig & { _retry?: boolean } }
    ).config;
    const status = (error as { response?: { status: number } }).response?.status;

    // Auto-refresh on 401 (skip for login and refresh endpoints to prevent deadlock/loops)
    const isAuthRoute =
      originalRequest?.url?.includes(apiConfig.endpoints.auth.login) ||
      originalRequest?.url?.includes(apiConfig.endpoints.auth.refresh);

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch {
        // Refresh failed — force logout
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = authConfig.routes.login;
        }
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

// ---- Token Refresh ----
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axiosInstance
    .post<{ data: { accessToken: string } }>(apiConfig.endpoints.auth.refresh)
    .then((res) => {
      const token = res.data.data.accessToken;
      tokenManager.setAccessToken(token);
      return token;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ---- Typed API Helper ----
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.request<{ data: T }>(config);
  return response.data.data;
}

export default axiosInstance;
