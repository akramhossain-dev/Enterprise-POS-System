import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { handleListLedger, handleGetLedgerById } from './inventory-ledger.controller';

export async function inventoryLedgerRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('inventory.ledger')],
      schema: { tags: ['Inventory Ledger'], summary: 'List ledger entries' },
    },
    handleListLedger,
  );
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('inventory.ledger')],
      schema: { tags: ['Inventory Ledger'], summary: 'Get ledger entry by ID' },
    },
    handleGetLedgerById,
  );
}

export default inventoryLedgerRoutes;
