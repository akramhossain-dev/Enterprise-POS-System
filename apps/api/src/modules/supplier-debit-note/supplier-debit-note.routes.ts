import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListSupplierDebitNotes,
  handleGetSupplierDebitNote,
  handleCreateSupplierDebitNote,
  handleUpdateSupplierDebitNote,
  handleDeleteSupplierDebitNote,
} from './supplier-debit-note.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function supplierDebitNoteRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('purchase.read'),
      schema: { tags: ['Supplier Debit Notes'], summary: 'List supplier debit notes' },
    },
    handleListSupplierDebitNotes,
  );
  fastify.get(
    '/:id',
    {
      preHandler: guard('purchase.read'),
      schema: { tags: ['Supplier Debit Notes'], summary: 'Get supplier debit note by ID' },
    },
    handleGetSupplierDebitNote,
  );
  fastify.post(
    '/',
    {
      preHandler: guard('purchase.create'),
      schema: { tags: ['Supplier Debit Notes'], summary: 'Create supplier debit note' },
    },
    handleCreateSupplierDebitNote,
  );
  fastify.put(
    '/:id',
    {
      preHandler: guard('purchase.update'),
      schema: { tags: ['Supplier Debit Notes'], summary: 'Update supplier debit note' },
    },
    handleUpdateSupplierDebitNote,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: guard('purchase.delete'),
      schema: { tags: ['Supplier Debit Notes'], summary: 'Delete supplier debit note' },
    },
    handleDeleteSupplierDebitNote,
  );
}
