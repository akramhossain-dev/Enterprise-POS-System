import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { redisConnection } from '../../modules/notification/queue';
import { prisma } from '../../lib/prisma';
import { Status } from '@prisma/client';

interface DecodedToken {
  sub: string;
  email: string;
  roleId: string;
  permissions: string[];
}

/**
 * Fastify preHandler hook to verify access token JWT and attach user context.
 * Now performs Redis-cached status and scope lookups.
 */
export async function authGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError('Authorization header is missing');
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedError('Invalid authorization header format. Use "Bearer <token>"');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    // 1. Verify User is ACTIVE (using Redis cache to avoid excessive DB lookups)
    const statusCacheKey = `user:status:${decoded.sub}`;
    let isUserActive = await redisConnection.get(statusCacheKey);
    if (isUserActive === null) {
      const dbUser = await prisma.user.findFirst({
        where: { id: decoded.sub },
        select: { status: true },
      });
      isUserActive = dbUser?.status === Status.ACTIVE ? 'ACTIVE' : 'INACTIVE';
      await redisConnection.setex(statusCacheKey, 300, isUserActive); // Cache status for 5 mins
    }

    if (isUserActive !== 'ACTIVE') {
      throw new UnauthorizedError('User account is inactive or has been blocked');
    }

    // 2. Fetch/Cache Employee companyId and branchId
    const employeeCacheKey = `user:employee:${decoded.sub}`;
    const employeeData = await redisConnection.get(employeeCacheKey);
    let companyId: string | null = null;
    let branchId: string | null = null;

    if (employeeData) {
      const parsed = JSON.parse(employeeData) as {
        companyId: string | null;
        branchId: string | null;
      };
      companyId = parsed.companyId;
      branchId = parsed.branchId;
    } else {
      const emp = await prisma.employee.findFirst({
        where: { userId: decoded.sub },
        select: { companyId: true, branchId: true },
      });
      if (emp) {
        companyId = emp.companyId;
        branchId = emp.branchId;
        await redisConnection.setex(employeeCacheKey, 300, JSON.stringify({ companyId, branchId }));
      }
    }

    request.user = {
      id: decoded.sub,
      email: decoded.email,
      roleId: decoded.roleId,
      permissions: decoded.permissions,
      companyId,
      branchId,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired');
    }
    throw new UnauthorizedError('Invalid access token');
  }
}

/**
 * Fastify preHandler hook factory to restrict endpoint access by permissions.
 * Now logs security audit records on permission failures.
 */
export function permissionGuard(requiredPermissions: string | string[]) {
  const permissionsNeeded = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('User authentication context is missing');
    }

    const { permissions } = request.user;

    // Check if the user has ALL of the required permissions
    const hasAll = permissionsNeeded.every((perm) => permissions.includes(perm));

    if (!hasAll) {
      const { recordAuditLog } = await import('../../modules/audit/audit.service');
      await recordAuditLog({
        companyId: request.user.companyId ?? null,
        userId: request.user.id,
        action: 'PERMISSION_DENIED',
        description: `Permission check failed for action(s): ${permissionsNeeded.join(', ')}`,
        req: request,
      });

      throw new ForbiddenError('You do not have the required permissions to access this resource');
    }
  };
}

/**
 * Validates that the authenticated user has access to the target company scope.
 * If the user's role is not ADMIN, their companyId must match the target companyId.
 */
export async function verifyTenantScope(
  request: FastifyRequest,
  targetCompanyId?: string | null,
): Promise<void> {
  if (!request.user) {
    throw new ForbiddenError('Access denied: Authentication context missing');
  }

  // 1. Resolve user role
  const role = await prisma.role.findUnique({
    where: { id: request.user.roleId },
    select: { name: true },
  });

  // 2. Admins are permitted system-wide access
  if (role?.name === 'ADMIN') {
    return;
  }

  // 3. Otherwise, targetCompanyId must be provided and match the user's companyId
  if (!targetCompanyId || request.user.companyId !== targetCompanyId) {
    throw new ForbiddenError('Access denied: You do not have access to this company scope');
  }
}
