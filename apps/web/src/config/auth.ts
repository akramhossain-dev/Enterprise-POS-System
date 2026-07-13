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
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/verify-email',
    resendVerification: '/resend-verification',
    twoFactor: '/two-factor',
    accountLocked: '/account-locked',
    sessionExpired: '/session-expired',
    profile: '/settings/profile',
  },
  publicRoutes: [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/resend-verification',
    '/two-factor',
    '/account-locked',
    '/session-expired',
    '/unauthorized',
    '/forbidden',
  ],
  protectedRoutes: ['/dashboard', '/settings'],
  guestOnlyRoutes: ['/login', '/forgot-password', '/reset-password'],
} as const;

export type AuthConfig = typeof authConfig;
