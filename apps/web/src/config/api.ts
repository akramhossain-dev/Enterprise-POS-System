export const apiConfig = {
  baseURL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1',
  timeout: 30_000,
  retries: 3,
  retryDelay: 1_000,
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
    },
    users: '/users',
    roles: '/roles',
    permissions: '/permissions',
    workspaces: '/workspaces',
  },
} as const;

export type ApiConfig = typeof apiConfig;
