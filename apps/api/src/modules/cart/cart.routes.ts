import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateCart,
  handleGetCart,
  handleAddCartItem,
  handleUpdateCartItem,
  handleRemoveCartItem,
  handleClearCart,
} from './cart.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function cartRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    {
      preHandler: guard('pos.cart.create'),
      schema: { tags: ['Cart'], summary: 'Create a new POS cart' },
    },
    handleCreateCart,
  );

  fastify.get(
    '/:id',
    {
      preHandler: guard('pos.cart.update'),
      schema: { tags: ['Cart'], summary: 'Get POS cart by ID with items' },
    },
    handleGetCart,
  );

  fastify.post(
    '/:id/items',
    {
      preHandler: guard('pos.cart.update'),
      schema: { tags: ['Cart'], summary: 'Add product item to POS cart' },
    },
    handleAddCartItem,
  );

  fastify.patch(
    '/:id/items/:itemId',
    {
      preHandler: guard('pos.cart.update'),
      schema: { tags: ['Cart'], summary: 'Update cart item quantity/pricing' },
    },
    handleUpdateCartItem,
  );

  fastify.delete(
    '/:id/items/:itemId',
    {
      preHandler: guard('pos.cart.update'),
      schema: { tags: ['Cart'], summary: 'Remove item from POS cart' },
    },
    handleRemoveCartItem,
  );

  fastify.delete(
    '/:id/items',
    {
      preHandler: guard('pos.cart.update'),
      schema: { tags: ['Cart'], summary: 'Clear all items in POS cart' },
    },
    handleClearCart,
  );
}

export default cartRoutes;
