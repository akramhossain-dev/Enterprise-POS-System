import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCheckoutCart,
  handleGetSaleDetails,
  handleListSales,
  handleGetReceiptData,
  handleRecordInvoicePrint,
} from './sales.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function salesRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // POS Checkout (POST /pos/checkout)
  fastify.post(
    '/pos/checkout',
    {
      preHandler: guard('sale.create'),
      schema: { tags: ['POS'], summary: 'Checkout cart and create sale' },
    },
    handleCheckoutCart,
  );

  // List Sales (GET /sales)
  fastify.get(
    '/sales',
    {
      preHandler: guard('sale.view'),
      schema: { tags: ['Sales'], summary: 'List paginated sales' },
    },
    handleListSales,
  );

  // Sale Details (GET /sales/:id)
  fastify.get(
    '/sales/:id',
    {
      preHandler: guard('sale.view'),
      schema: { tags: ['Sales'], summary: 'Get details of a specific sale' },
    },
    handleGetSaleDetails,
  );

  // Invoice / Receipt print data (GET /sales/:id/invoice)
  fastify.get(
    '/sales/:id/invoice',
    {
      preHandler: guard('invoice.view'),
      schema: { tags: ['Sales'], summary: 'Get receipt/invoice print data' },
    },
    handleGetReceiptData,
  );

  // Record Invoice print count (POST /sales/:id/invoice/print)
  fastify.post(
    '/sales/:id/invoice/print',
    {
      preHandler: guard('invoice.print'),
      schema: { tags: ['Sales'], summary: 'Increment invoice print count' },
    },
    handleRecordInvoicePrint,
  );
}

export default salesRoutes;
