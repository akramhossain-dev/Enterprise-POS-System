import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

interface DecodedToken {
  sub: string;
  email: string;
  roleId: string;
  permissions: string[];
}

/**
 * Fastify preHandler hook to verify access token JWT and attach user context.
 */
export async function authGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  await Promise.resolve();
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
    request.user = {
      id: decoded.sub,
      email: decoded.email,
      roleId: decoded.roleId,
      permissions: decoded.permissions,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired');
    }
    throw new UnauthorizedError('Invalid access token');
  }
}

/**
 * Fastify preHandler hook factory to restrict endpoint access by permissions.
 *
 * @param requiredPermissions - A single permission or an array of permissions (requires ALL of them).
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
      throw new ForbiddenError('You do not have the required permissions to access this resource');
    }
  };
}
