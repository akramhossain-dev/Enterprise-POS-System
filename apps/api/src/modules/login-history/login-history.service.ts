import { prisma } from '../../lib/prisma';
import { Prisma, LoginStatus } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { parseUserAgent } from '../audit/audit.service';

export async function recordLogin(
  userId: string | null,
  status: 'SUCCESS' | 'FAILED',
  req?: FastifyRequest,
) {
  let ipAddress = req?.ip ?? null;
  const userAgent = req?.headers['user-agent'] ?? null;

  if (req?.headers['x-forwarded-for']) {
    const headerVal = req.headers['x-forwarded-for'];
    if (typeof headerVal === 'string') {
      const parts = headerVal.split(',');
      const firstPart = parts[0];
      if (firstPart) {
        ipAddress = firstPart.trim() || null;
      }
    } else if (Array.isArray(headerVal) && headerVal.length > 0) {
      const firstVal = headerVal[0];
      if (firstVal) {
        ipAddress = firstVal || null;
      }
    }
  }

  const { device, browser, os } = parseUserAgent(userAgent ?? undefined);

  return prisma.loginHistory.create({
    data: {
      userId,
      ipAddress,
      userAgent,
      device,
      browser,
      operatingSystem: os,
      status,
    },
  });
}

export async function recordLogout(userId: string) {
  const latest = await prisma.loginHistory.findFirst({
    where: { userId, logoutAt: null },
    orderBy: { loginAt: 'desc' },
  });

  if (latest) {
    return prisma.loginHistory.update({
      where: { id: latest.id },
      data: { logoutAt: new Date() },
    });
  }
  return null;
}

export async function listLoginHistories(
  page = 1,
  limit = 20,
  filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    status?: string;
    ipAddress?: string;
  } = {},
) {
  const skip = (page - 1) * limit;
  const where: Prisma.LoginHistoryWhereInput = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.status) {
    where.status = filters.status as LoginStatus;
  }

  if (filters.ipAddress) {
    where.ipAddress = filters.ipAddress;
  }

  if (filters.startDate || filters.endDate) {
    const loginAtFilter: { gte?: Date; lte?: Date } = {};
    if (filters.startDate) {
      loginAtFilter.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      loginAtFilter.lte = new Date(filters.endDate);
    }
    where.loginAt = loginAtFilter;
  }

  const [items, total] = await Promise.all([
    prisma.loginHistory.findMany({
      where,
      orderBy: { loginAt: 'desc' },
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
    prisma.loginHistory.count({ where }),
  ]);

  return { items, total };
}
