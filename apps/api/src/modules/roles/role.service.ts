import { prisma } from '../../lib/prisma';
import { getOrSetCache } from '../analytics/analytics.service';

/**
 * List all security roles.
 */
export async function listRoles() {
  return getOrSetCache(
    'roles:list',
    async () => {
      return prisma.role.findMany({
        orderBy: { name: 'asc' },
      });
    },
    86400,
  ); // 24 hours TTL
}
