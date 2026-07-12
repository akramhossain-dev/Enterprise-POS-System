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
 * Expire time configured from REFRESH_TOKEN_EXPIRES_IN (defaults to 7d).
 */
async function createRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(rawToken);

  // Parse REFRESH_TOKEN_EXPIRES_IN (simple parsing: default 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

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
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    }
    throw new UnauthorizedError('Expired or invalid refresh token');
  }

  const { user } = tokenRecord;
  if (user.status !== Status.ACTIVE) {
    throw new UnauthorizedError('User account associated with this session is inactive');
  }

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
