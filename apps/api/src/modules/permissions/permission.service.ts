import { prisma } from '../../lib/prisma';

/**
 * List all security permissions.
 */
export async function listPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
  });
}
