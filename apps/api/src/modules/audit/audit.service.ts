import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export function parseUserAgent(uaString?: string) {
  if (!uaString) {
    return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  }
  let device = 'Desktop';
  if (/mobile/i.test(uaString)) {
    device = 'Mobile';
  } else if (/tablet/i.test(uaString)) {
    device = 'Tablet';
  }

  let os = 'Unknown OS';
  if (/windows/i.test(uaString)) {
    os = 'Windows';
  } else if (/macintosh|mac os/i.test(uaString)) {
    os = 'macOS';
  } else if (/android/i.test(uaString)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(uaString)) {
    os = 'iOS';
  } else if (/linux/i.test(uaString)) {
    os = 'Linux';
  }

  let browser = 'Unknown Browser';
  if (/chrome|crios/i.test(uaString)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(uaString)) {
    browser = 'Firefox';
  } else if (/safari/i.test(uaString) && !/chrome|crios/i.test(uaString)) {
    browser = 'Safari';
  } else if (/msie|trident/i.test(uaString)) {
    browser = 'Internet Explorer';
  } else if (/edge|edg/i.test(uaString)) {
    browser = 'Edge';
  }

  return { device, browser, os };
}

export function sanitizeAuditPayload(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }
  try {
    const clone = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apikey',
      'key',
      'refresh_token',
      'refreshtoken',
      'client_secret',
    ];

    const mask = (obj: Record<string, unknown>) => {
      for (const k of Object.keys(obj)) {
        const val = obj[k];
        if (typeof val === 'object' && val !== null) {
          mask(val as Record<string, unknown>);
        } else {
          const lowerK = k.toLowerCase();
          if (sensitiveKeys.some((sk) => lowerK.includes(sk))) {
            obj[k] = '[REDACTED]';
          }
        }
      }
    };

    mask(clone);
    return clone;
  } catch {
    return '[UNPARSABLE]';
  }
}

export async function recordAuditLog(params: {
  companyId?: string | null;
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  referenceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  description?: string;
  req?: FastifyRequest | undefined;
}) {
  const {
    companyId,
    userId,
    action,
    entityType,
    entityId,
    referenceId,
    oldValue,
    newValue,
    description,
    req,
  } = params;

  let ipAddress = req?.ip ?? null;
  const userAgent = req?.headers['user-agent'] ?? null;
  const requestId = req?.id ?? null;

  // Resolve headers for proxies
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

  return prisma.auditLog.create({
    data: {
      companyId: companyId ?? null,
      userId: userId ?? null,
      action,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      referenceId: referenceId ?? null,
      oldValue: oldValue
        ? (sanitizeAuditPayload(oldValue) as Prisma.InputJsonValue)
        : Prisma.DbNull,
      newValue: newValue
        ? (sanitizeAuditPayload(newValue) as Prisma.InputJsonValue)
        : Prisma.DbNull,
      description: description ?? null,
      ipAddress,
      userAgent,
      device,
      browser,
      operatingSystem: os,
      requestId,
    },
  });
}

export async function listAuditLogs(
  userIdFilter?: string,
  companyId?: string,
  page = 1,
  limit = 20,
  filters: {
    startDate?: string;
    endDate?: string;
    action?: string;
    entityType?: string;
    ipAddress?: string;
    user?: string; // search by user ID or user name
    search?: string;
  } = {},
) {
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  if (companyId) {
    where.companyId = companyId;
  }

  if (userIdFilter) {
    where.userId = userIdFilter;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.ipAddress) {
    where.ipAddress = filters.ipAddress;
  }

  // Date range filters
  if (filters.startDate || filters.endDate) {
    const createdAtFilter: { gte?: Date; lte?: Date } = {};
    if (filters.startDate) {
      createdAtFilter.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      createdAtFilter.lte = new Date(filters.endDate);
    }
    where.createdAt = createdAtFilter;
  }

  // Search filter matching user/entityType/action/entityId/referenceId
  if (filters.search) {
    where.OR = [
      { action: { contains: filters.search, mode: 'insensitive' } },
      { entityType: { contains: filters.search, mode: 'insensitive' } },
      { entityId: { contains: filters.search, mode: 'insensitive' } },
      { referenceId: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { user: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
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
    prisma.auditLog.count({ where }),
  ]);

  return { items, total };
}

export async function getAuditLogById(id: string) {
  return prisma.auditLog.findUnique({
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
