import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { parseUserAgent } from '../audit/audit.service';

export async function createUserSession(
  userId: string,
  sessionId: string | null,
  refreshTokenId: string | null,
  expiresAt: Date,
  req?: FastifyRequest,
) {
  let ipAddress = req?.ip ?? null;
  const userAgent = req?.headers['user-agent'] ?? null;

  if (req?.headers['x-forwarded-for']) {
    const header = req.headers['x-forwarded-for'];
    ipAddress = Array.isArray(header) ? (header[0] ?? null) : (header.split(',')[0] ?? null);
  }

  const { device } = parseUserAgent(userAgent ?? undefined);

  return prisma.userSession.create({
    data: {
      userId,
      sessionId,
      refreshTokenId,
      expiresAt,
      ipAddress,
      device,
    },
  });
}

export async function getUserSession(id: string) {
  return prisma.userSession.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function revokeUserSession(id: string) {
  return prisma.userSession.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function revokeUserSessionByToken(refreshTokenId: string) {
  return prisma.userSession.updateMany({
    where: { refreshTokenId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function listUserSessions(
  page = 1,
  limit = 20,
  filters: {
    userId?: string;
  } = {},
) {
  const skip = (page - 1) * limit;
  const where: Prisma.UserSessionWhereInput = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  const [items, total] = await Promise.all([
    prisma.userSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.userSession.count({ where }),
  ]);

  return { items, total };
}
