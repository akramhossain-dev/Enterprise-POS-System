import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../lib/prisma';
import {
  registerUser,
  loginUser,
  rotateRefreshToken,
  logoutUser,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
  handleResendVerification,
  handleVerifyTwoFactor,
} from './auth.service';
import { sendSuccess } from '../../common/responses/success';
import { UnauthorizedError } from '../../common/errors/AppError';
import { validateBody } from '../../common/utils/validate';
import {
  registerBodySchema,
  loginBodySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  twoFactorVerifySchema,
} from './auth.schema';

const COOKIE_NAME = 'refreshToken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Register a new user with default CASHIER role.
 */
export async function register(request: FastifyRequest, reply: FastifyReply) {
  const body = validateBody(registerBodySchema, request.body);
  const user = await registerUser(body);

  // Return user details without password
  const responseData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    role: user.role,
  };

  return reply.status(201).send(
    sendSuccess({
      message: 'User registered successfully',
      data: responseData,
    }),
  );
}

/**
 * User login. Authenticates credentials and sets HttpOnly refresh token cookie.
 */
export async function login(request: FastifyRequest, reply: FastifyReply) {
  const body = validateBody(loginBodySchema, request.body);
  const { accessToken, refreshToken, user } = await loginUser(body, request);

  void reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

  return reply.status(200).send(
    sendSuccess({
      message: 'Login successful',
      data: { accessToken, user },
    }),
  );
}

/**
 * Rotates refresh token session and returns a new access token.
 */
export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[COOKIE_NAME];
  if (!token) {
    throw new UnauthorizedError('Refresh token is missing');
  }

  const { accessToken, refreshToken, user } = await rotateRefreshToken(token);

  void reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

  return reply.status(200).send(
    sendSuccess({
      message: 'Token refreshed successfully',
      data: { accessToken, user },
    }),
  );
}

/**
 * Revokes refresh token session and clears the browser cookie.
 */
export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[COOKIE_NAME];
  if (token) {
    await logoutUser(token, request);
  }

  void reply.clearCookie(COOKIE_NAME, { path: '/' });

  return reply.status(200).send(
    sendSuccess({
      message: 'Logout successful',
      data: {},
    }),
  );
}

/**
 * Returns current authenticated user context details.
 */
export async function me(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    throw new UnauthorizedError('User authentication context is missing');
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    include: {
      role: {
        select: { id: true, name: true, description: true },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('Authenticated user does not exist in the database');
  }

  const responseData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    role: user.role,
    permissions: request.user.permissions,
  };

  return reply.status(200).send(
    sendSuccess({
      message: 'User profile fetched successfully',
      data: responseData,
    }),
  );
}

export async function forgotPassword(request: FastifyRequest, reply: FastifyReply) {
  const body = validateBody(forgotPasswordSchema, request.body);
  await handleForgotPassword(body.email);
  return reply.status(200).send(
    sendSuccess({
      message: 'Password reset email sent if user exists',
      data: {},
    }),
  );
}

export async function resetPassword(request: FastifyRequest, reply: FastifyReply) {
  const body = validateBody(resetPasswordSchema, request.body);
  await handleResetPassword(body.token, body.password);
  return reply.status(200).send(
    sendSuccess({
      message: 'Password has been reset successfully',
      data: {},
    }),
  );
}

export async function verifyEmail(request: FastifyRequest, reply: FastifyReply) {
  const body = validateBody(verifyEmailSchema, request.body);
  const user = await handleVerifyEmail(body.token);
  return reply.status(200).send(
    sendSuccess({
      message: 'Email verified successfully',
      data: { user },
    }),
  );
}

export async function resendVerification(request: FastifyRequest, reply: FastifyReply) {
  const body = validateBody(resendVerificationSchema, request.body);
  await handleResendVerification(body.email);
  return reply.status(200).send(
    sendSuccess({
      message: 'Verification email resent if user is unverified',
      data: {},
    }),
  );
}

export async function verifyTwoFactor(request: FastifyRequest, reply: FastifyReply) {
  const body = validateBody(twoFactorVerifySchema, request.body);
  const { accessToken, refreshToken, user } = await handleVerifyTwoFactor(
    body.code,
    body.sessionToken,
  );

  void reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

  return reply.status(200).send(
    sendSuccess({
      message: 'Two-factor authentication successful',
      data: { accessToken, user },
    }),
  );
}
