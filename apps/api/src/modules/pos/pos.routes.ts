import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleOpenSession,
  handleCloseSession,
  handleGetActiveSession,
  handleProductSearch,
} from './pos.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function posRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/session/open',
    {
      preHandler: guard('pos.open'),
      schema: { tags: ['POS'], summary: 'Open a new POS session' },
    },
    handleOpenSession,
  );

  fastify.post(
    '/session/close',
    {
      preHandler: guard('pos.close'),
      schema: { tags: ['POS'], summary: 'Close active POS session' },
    },
    handleCloseSession,
  );

  fastify.get(
    '/session/current',
    {
      preHandler: guard('pos.view'),
      schema: { tags: ['POS'], summary: 'Get current active POS session' },
    },
    handleGetActiveSession,
  );

  fastify.get(
    '/products/search',
    {
      preHandler: guard('pos.view'),
      schema: { tags: ['POS'], summary: 'Search products by Name/SKU/Barcode' },
    },
    handleProductSearch,
  );
}

export default posRoutes;
