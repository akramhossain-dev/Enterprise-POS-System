import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListSupplierCreditNotes,
  handleGetSupplierCreditNote,
  handleCreateSupplierCreditNote,
  handleUpdateSupplierCreditNote,
  handleDeleteSupplierCreditNote,
} from './supplier-credit-note.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function supplierCreditNoteRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('purchase.read'),
      schema: { tags: ['Supplier Credit Notes'], summary: 'List supplier credit notes' },
    },
    handleListSupplierCreditNotes,
  );
  fastify.get(
    '/:id',
    {
      preHandler: guard('purchase.read'),
      schema: { tags: ['Supplier Credit Notes'], summary: 'Get supplier credit note by ID' },
    },
    handleGetSupplierCreditNote,
  );
  fastify.post(
    '/',
    {
      preHandler: guard('purchase.create'),
      schema: { tags: ['Supplier Credit Notes'], summary: 'Create supplier credit note' },
    },
    handleCreateSupplierCreditNote,
  );
  fastify.put(
    '/:id',
    {
      preHandler: guard('purchase.update'),
      schema: { tags: ['Supplier Credit Notes'], summary: 'Update supplier credit note' },
    },
    handleUpdateSupplierCreditNote,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: guard('purchase.delete'),
      schema: { tags: ['Supplier Credit Notes'], summary: 'Delete supplier credit note' },
    },
    handleDeleteSupplierCreditNote,
  );
}
