import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  createReceiptHandler,
  listReceiptsHandler,
  getReceiptDetailsHandler,
  createVoucherHandler,
  listVouchersHandler,
  getVoucherDetailsHandler,
} from './transaction.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function transactionRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Payment Receipts ───────────────────────────────────────────────────────
  fastify.post(
    '/receipts',
    {
      preHandler: guard('financial.transaction.create'),
      schema: { tags: ['Financial Transactions'], summary: 'Create a new payment receipt' },
    },
    createReceiptHandler,
  );

  fastify.get(
    '/receipts',
    {
      preHandler: guard('financial.transaction.view'),
      schema: { tags: ['Financial Transactions'], summary: 'List payment receipts with filters' },
    },
    listReceiptsHandler,
  );

  fastify.get(
    '/receipts/:id',
    {
      preHandler: guard('financial.transaction.view'),
      schema: { tags: ['Financial Transactions'], summary: 'Get details of a payment receipt' },
    },
    getReceiptDetailsHandler,
  );

  // ── Payment Vouchers ───────────────────────────────────────────────────────
  fastify.post(
    '/vouchers',
    {
      preHandler: guard('financial.transaction.create'),
      schema: { tags: ['Financial Transactions'], summary: 'Create a new payment voucher' },
    },
    createVoucherHandler,
  );

  fastify.get(
    '/vouchers',
    {
      preHandler: guard('financial.transaction.view'),
      schema: { tags: ['Financial Transactions'], summary: 'List payment vouchers with filters' },
    },
    listVouchersHandler,
  );

  fastify.get(
    '/vouchers/:id',
    {
      preHandler: guard('financial.transaction.view'),
      schema: { tags: ['Financial Transactions'], summary: 'Get details of a payment voucher' },
    },
    getVoucherDetailsHandler,
  );
}
