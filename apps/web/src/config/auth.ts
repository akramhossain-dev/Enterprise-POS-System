export const authConfig = {
  accessTokenKey: 'pos_access_token',
  refreshTokenKey: 'pos_refresh_token',
  sessionKey: 'pos_session',
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes in ms
  sessionTimeout: 30 * 60 * 1000, // 30 minutes in ms
  routes: {
    login: '/login',
    logout: '/logout',
    dashboard: '/dashboard',
    unauthorized: '/unauthorized',
    forbidden: '/forbidden',
  },
  publicRoutes: ['/login', '/forgot-password', '/reset-password', '/unauthorized', '/forbidden'],
  protectedRoutes: ['/dashboard'],
} as const;

export type AuthConfig = typeof authConfig;
