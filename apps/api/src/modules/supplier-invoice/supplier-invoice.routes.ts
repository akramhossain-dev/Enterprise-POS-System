import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateInvoice,
  handleListInvoices,
  handleGetInvoiceById,
} from './supplier-invoice.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function supplierInvoiceRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.post(
    '/',
    { preHandler: guard('supplier.invoice.create'), schema: { tags: ['Supplier Invoices'] } },
    handleCreateInvoice,
  );

  fastify.get(
    '/',
    { preHandler: guard('supplier.invoice.view'), schema: { tags: ['Supplier Invoices'] } },
    handleListInvoices,
  );

  fastify.get(
    '/:id',
    { preHandler: guard('supplier.invoice.view'), schema: { tags: ['Supplier Invoices'] } },
    handleGetInvoiceById,
  );
}

export default supplierInvoiceRoutes;
