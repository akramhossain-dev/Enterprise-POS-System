import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { handleGetInvoiceDetails, handlePrintInvoice } from './invoice.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function invoiceRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Get invoice details by saleId (GET /invoices/:saleId)
  fastify.get(
    '/:saleId',
    {
      preHandler: guard('invoice.view'),
      schema: { tags: ['Invoices'], summary: 'Get invoice details for a sale' },
    },
    handleGetInvoiceDetails,
  );

  // Print invoice / record printing (POST /invoices/:saleId/print)
  fastify.post(
    '/:saleId/print',
    {
      preHandler: guard('invoice.print'),
      schema: { tags: ['Invoices'], summary: 'Record printing of an invoice' },
    },
    handlePrintInvoice,
  );
}

export default invoiceRoutes;
