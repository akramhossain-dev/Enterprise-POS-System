import { env } from '../../config';
import { FastifyInstance } from 'fastify';
import {
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  verifyTwoFactor,
} from './auth.controller';
import { authGuard } from '../../common/middleware/auth';

/**
 * Routes definitions for /auth endpoints
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    register,
  );

  fastify.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    login,
  );

  fastify.post(
    '/refresh',
    {
      config: {
        rateLimit: {
          max: env.NODE_ENV === 'production' ? 10 : 1000,
          timeWindow: '15 minutes',
        },
      },
    },
    refresh,
  );

  fastify.post('/logout', logout);
  fastify.get('/me', { preHandler: [authGuard] }, me);

  // New recovery & verification routes
  fastify.post(
    '/forgot-password',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    forgotPassword,
  );

  fastify.post(
    '/reset-password',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    resetPassword,
  );

  fastify.post('/verify-email', verifyEmail);
  fastify.post('/resend-verification', resendVerification);
  fastify.post('/two-factor/verify', verifyTwoFactor);
}
export default authRoutes;
