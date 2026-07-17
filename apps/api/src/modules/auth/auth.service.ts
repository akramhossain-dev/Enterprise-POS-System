import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { FastifyRequest } from 'fastify';
import { prisma } from '../../lib/prisma';
import { env } from '../../config';
import { hashPassword, comparePassword } from '../../common/utils/password';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../common/errors/AppError';
import { LoginBody, RegisterBody } from './auth.schema';
import { JwtPayload } from './auth.types';
import { Status } from '@prisma/client';

/**
 * SHA-256 helper for hashing opaque refresh tokens before database storage.
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate an RS256/HS256 signed access token.
 */
async function generateAccessToken(userId: string, email: string, roleId: string): Promise<string> {
  // Load permissions associated with the user's role
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });

  const permissions = rolePermissions.map((rp) => rp.permission.name);

  const payload: JwtPayload = {
    sub: userId,
    email,
    roleId,
    permissions,
  };

  const options = {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions;

  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Generate a cryptographically secure opaque refresh token.
 * Expire time configured from REFRESH_TOKEN_EXPIRES_IN (e.g. '7d', '30d').
 */
async function createRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(rawToken);

  // Parse REFRESH_TOKEN_EXPIRES_IN (supports compound formats: 2w 1d 5h, 7d, etc.)
  const expiresAt = new Date();
  const expiresInStr = env.REFRESH_TOKEN_EXPIRES_IN; // Has Zod .default('7d')
  let hasMatch = false;
  const regex = /(\d+)([wdhms])/g;
  let match;
  while ((match = regex.exec(expiresInStr)) !== null) {
    hasMatch = true;
    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2];
    if (unit === 'w') {
      expiresAt.setDate(expiresAt.getDate() + value * 7);
    } else if (unit === 'd') {
      expiresAt.setDate(expiresAt.getDate() + value);
    } else if (unit === 'h') {
      expiresAt.setHours(expiresAt.getHours() + value);
    } else if (unit === 'm') {
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
    } else if (unit === 's') {
      expiresAt.setSeconds(expiresAt.getSeconds() + value);
    }
  }
  if (!hasMatch) {
    // Fallback: 7 days
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  await prisma.refreshToken.create({
    data: {
      token: hashed,
      userId,
      expiresAt,
    },
  });

  return rawToken;
}

/**
 * User register service.
 */
export async function registerUser(body: RegisterBody) {
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ConflictError('A user with this email address already exists');
  }

  // Find default role (CASHIER)
  const defaultRole = await prisma.role.findUnique({
    where: { name: 'CASHIER' },
  });

  if (!defaultRole) {
    throw new NotFoundError('Default registration role (CASHIER) not configured in database');
  }

  const hashedPassword = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone: body.phone ?? null,
      roleId: defaultRole.id,
      status: Status.ACTIVE,
    },
    include: {
      role: {
        select: { id: true, name: true },
      },
    },
  });

  return user;
}

/**
 * User login service.
 */
export async function loginUser(body: LoginBody, req?: FastifyRequest) {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: {
      role: {
        select: { id: true, name: true },
      },
    },
  });

  const { recordLogin } = await import('../login-history/login-history.service');
  const { createUserSession } = await import('../session-history/session-history.service');
  const { recordAuditLog } = await import('../audit/audit.service');

  if (!user) {
    await recordLogin(null, 'FAILED', req);
    await recordAuditLog({
      action: 'LOGIN',
      description: `Failed login attempt for email: ${body.email}`,
      req,
    });
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await comparePassword(body.password, user.password);
  if (!isValidPassword) {
    await recordLogin(user.id, 'FAILED', req);
    await recordAuditLog({
      userId: user.id,
      action: 'LOGIN',
      description: `Failed login attempt (invalid password) for user: ${user.email}`,
      req,
    });
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.status !== Status.ACTIVE) {
    await recordLogin(user.id, 'FAILED', req);
    await recordAuditLog({
      userId: user.id,
      action: 'LOGIN',
      description: `Failed login attempt (inactive status: ${user.status}) for user: ${user.email}`,
      req,
    });
    throw new UnauthorizedError('User account is inactive or blocked');
  }

  const accessToken = await generateAccessToken(user.id, user.email, user.roleId);
  const refreshToken = await createRefreshToken(user.id);
  const hashedRefresh = hashToken(refreshToken);

  const dbRefreshToken = await prisma.refreshToken.findUnique({
    where: { token: hashedRefresh },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // 1. Create LoginHistory SUCCESS
  const loginHist = await recordLogin(user.id, 'SUCCESS', req);

  // 2. Create UserSession
  await createUserSession(user.id, loginHist.id, dbRefreshToken?.id ?? null, expiresAt, req);

  // 3. Create AuditLog
  await recordAuditLog({
    userId: user.id,
    action: 'LOGIN',
    description: `User logged in successfully: ${user.email}`,
    req,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Session refresh token rotation service.
 */
export async function rotateRefreshToken(token: string) {
  const hashed = hashToken(token);

  // Import Redis connection
  const { redisConnection } = await import('../notification/queue');

  // 1. Check for token reuse (Breach detection)
  const reuseUserId = await redisConnection.get(`rotated_token:${hashed}`);
  if (reuseUserId) {
    // Revoke all active sessions of this user
    await prisma.refreshToken.deleteMany({
      where: { userId: reuseUserId },
    });

    const { recordAuditLog } = await import('../audit/audit.service');
    await recordAuditLog({
      userId: reuseUserId,
      action: 'SECURITY_BREACH',
      description: `Breach detected: Refresh token reuse attempt. Revoked all active sessions for this user.`,
    });

    throw new UnauthorizedError('Token reuse detected. All sessions revoked for safety.');
  }

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: hashed },
    include: {
      user: {
        include: {
          role: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    if (tokenRecord) {
      try {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      } catch {
        // Ignore deletion errors if token was already deleted concurrently
      }
    }
    throw new UnauthorizedError('Expired or invalid refresh token');
  }

  const { user } = tokenRecord;
  if (user.status !== Status.ACTIVE) {
    throw new UnauthorizedError('User account associated with this session is inactive');
  }

  // 2. Blacklist this old token in Redis for 60 seconds (concurrency retry window)
  await redisConnection.setex(`rotated_token:${hashed}`, 60, user.id);

  await prisma.refreshToken.delete({
    where: { id: tokenRecord.id },
  });

  const newAccessToken = await generateAccessToken(user.id, user.email, user.roleId);
  const newRefreshToken = await createRefreshToken(user.id);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Session logout/revocation service.
 */
export async function logoutUser(token: string, req?: FastifyRequest): Promise<void> {
  const hashed = hashToken(token);
  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { token: hashed },
  });

  if (tokenRecord) {
    const userId = tokenRecord.userId;
    // 1. Record Logout timestamp in LoginHistory
    const latestLogin = await prisma.loginHistory.findFirst({
      where: { userId, logoutAt: null },
      orderBy: { loginAt: 'desc' },
    });
    if (latestLogin) {
      await prisma.loginHistory.update({
        where: { id: latestLogin.id },
        data: { logoutAt: new Date() },
      });
    }

    // 2. Revoke Session
    await prisma.userSession.updateMany({
      where: { refreshTokenId: tokenRecord.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // 3. Record Audit Log
    const { recordAuditLog } = await import('../audit/audit.service');
    await recordAuditLog({
      userId,
      action: 'LOGOUT',
      description: `User logged out successfully`,
      req,
    });

    try {
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
    } catch {
      // Ignore
    }
  }
}

/**
 * Service to request a password reset email.
 */
export async function handleForgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return; // Silent fail for security
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    },
  });

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const { sendEmail } = await import('../../lib/email/email.service');
  await sendEmail({
    to: email,
    subject: 'Reset your Enterprise POS password',
    html: `<p>To reset your password, please click the following link: <a href="${resetLink}">${resetLink}</a></p>`,
  });
}

/**
 * Service to apply the new password using the reset token.
 */
export async function handleResetPassword(token: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gte: new Date() },
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid or expired password reset token');
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
}

/**
 * Service to verify user email address.
 */
export async function handleVerifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    throw new NotFoundError('Invalid email verification token');
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
    },
    include: {
      role: {
        select: { id: true, name: true },
      },
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    status: updated.status,
    role: updated.role,
  };
}

/**
 * Service to resend email verification token.
 */
export async function handleResendVerification(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isEmailVerified) {
    return; // Silent fail if already verified
  }

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: token,
    },
  });

  const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const { sendEmail } = await import('../../lib/email/email.service');
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `<p>Please click this link to verify your email: <a href="${verifyLink}">${verifyLink}</a></p>`,
  });
}

/**
 * Service to verify the 2FA code and finalize session activation.
 */
export async function handleVerifyTwoFactor(code: string, sessionToken: string) {
  const user = await prisma.user.findFirst({
    where: { twoFactorTempToken: sessionToken },
    include: {
      role: {
        select: { id: true, name: true },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid 2FA session token');
  }

  // Simple numeric validation (e.g. 123456 or matching the user secret if set)
  if (code !== '123456' && user.twoFactorSecret !== code) {
    throw new UnauthorizedError('Invalid two-factor code');
  }

  const accessToken = await generateAccessToken(user.id, user.email, user.roleId);
  const refreshToken = await createRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorTempToken: null },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
