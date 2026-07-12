// ─────────────────────────────────────────────
// Supplier Module — Routes
// ─────────────────────────────────────────────

import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListSuppliers,
  handleGetSupplier,
  handleCreateSupplier,
  handleUpdateSupplier,
  handleDeleteSupplier,
  handleAddSupplierAddress,
  handleListSupplierAddresses,
} from './supplier.controller';

export async function supplierRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Core CRUD ──────────────────────────────────────────────────────────────

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('supplier.view')],
      schema: { tags: ['Suppliers'], summary: 'List suppliers with search, filter & pagination' },
    },
    handleListSuppliers,
  );

  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('supplier.view')],
      schema: { tags: ['Suppliers'], summary: 'Get supplier by ID' },
    },
    handleGetSupplier,
  );

  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('supplier.create')],
      schema: { tags: ['Suppliers'], summary: 'Create supplier' },
    },
    handleCreateSupplier,
  );

  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('supplier.update')],
      schema: { tags: ['Suppliers'], summary: 'Update supplier' },
    },
    handleUpdateSupplier,
  );

  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('supplier.delete')],
      schema: { tags: ['Suppliers'], summary: 'Soft delete supplier' },
    },
    handleDeleteSupplier,
  );

  // ── Address sub-resource ───────────────────────────────────────────────────

  fastify.get(
    '/:id/addresses',
    {
      preHandler: [authGuard, permissionGuard('supplier.view')],
      schema: { tags: ['Suppliers'], summary: 'List supplier addresses' },
    },
    handleListSupplierAddresses,
  );

  fastify.post(
    '/:id/addresses',
    {
      preHandler: [authGuard, permissionGuard('supplier.update')],
      schema: { tags: ['Suppliers'], summary: 'Add address to supplier' },
    },
    handleAddSupplierAddress,
  );
}

export default supplierRoutes;
