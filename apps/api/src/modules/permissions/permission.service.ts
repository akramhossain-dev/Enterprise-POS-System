import { prisma } from '../../lib/prisma';
import { getOrSetCache } from '../analytics/analytics.service';

/**
 * List all security permissions.
 */
export async function listPermissions() {
  return getOrSetCache(
    'permissions:list',
    async () => {
      return prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
      });
    },
    86400,
  ); // 24 hours TTL
}
