import { prisma } from '../../lib/prisma';

/**
 * List all security roles.
 */
export async function listRoles() {
  return prisma.role.findMany({
    orderBy: { name: 'asc' },
  });
}
