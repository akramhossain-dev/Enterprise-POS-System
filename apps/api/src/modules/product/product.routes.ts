import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListProducts,
  handleSearchProducts,
  handleGetProduct,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
} from './product.controller';

/**
 * Product routes.
 * IMPORTANT: /search must be registered BEFORE /:id to prevent Fastify matching
 * the literal string "search" as a UUID parameter.
 */
export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Search (must come BEFORE /:id) ───────────────────
  fastify.get(
    '/search',
    {
      preHandler: [authGuard, permissionGuard('product.read')],
      schema: { tags: ['Products'], summary: 'Search products by name, SKU, or barcode' },
    },
    handleSearchProducts,
  );

  // ── List ─────────────────────────────────────────────
  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('product.read')],
      schema: { tags: ['Products'], summary: 'List products with filters' },
    },
    handleListProducts,
  );

  // ── Get by ID ─────────────────────────────────────────
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('product.read')],
      schema: { tags: ['Products'], summary: 'Get product by ID' },
    },
    handleGetProduct,
  );

  // ── Create ────────────────────────────────────────────
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('product.create')],
      schema: { tags: ['Products'], summary: 'Create product' },
    },
    handleCreateProduct,
  );

  // ── Update ────────────────────────────────────────────
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('product.update')],
      schema: { tags: ['Products'], summary: 'Update product' },
    },
    handleUpdateProduct,
  );

  // ── Delete (soft) ─────────────────────────────────────
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('product.delete')],
      schema: { tags: ['Products'], summary: 'Soft-delete product (marks as DISCONTINUED)' },
    },
    handleDeleteProduct,
  );
}

export default productRoutes;
