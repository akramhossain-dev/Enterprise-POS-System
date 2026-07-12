import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  getOverviewHandler,
  getSalesSummaryHandler,
  getSalesTrendHandler,
  getPurchaseSummaryHandler,
  getInventorySummaryHandler,
  getCustomerSummaryHandler,
  getSupplierSummaryHandler,
  getFinancialSummaryHandler,
  getTopProductsHandler,
  getTopCustomersHandler,
} from './dashboard.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function dashboardRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Main Overview ──────────────────────────────────────────────────────────
  fastify.get(
    '/overview',
    {
      preHandler: guard('dashboard.view'),
      schema: { tags: ['Dashboard'], summary: 'Get overview indicators' },
    },
    getOverviewHandler,
  );

  // ── Sales Analytics ────────────────────────────────────────────────────────
  fastify.get(
    '/sales-summary',
    {
      preHandler: guard('dashboard.view'),
      schema: { tags: ['Dashboard'], summary: 'Get sales summaries' },
    },
    getSalesSummaryHandler,
  );

  fastify.get(
    '/sales-trend',
    {
      preHandler: guard('analytics.view'),
      schema: { tags: ['Dashboard'], summary: 'Get sales trends (Daily/Weekly/Monthly)' },
    },
    getSalesTrendHandler,
  );

  // ── Purchase Analytics ─────────────────────────────────────────────────────
  fastify.get(
    '/purchase-summary',
    {
      preHandler: guard('dashboard.view'),
      schema: { tags: ['Dashboard'], summary: 'Get purchase summaries' },
    },
    getPurchaseSummaryHandler,
  );

  // ── Inventory Analytics ───────────────────────────────────────────────────
  fastify.get(
    '/inventory-summary',
    {
      preHandler: guard('dashboard.view'),
      schema: { tags: ['Dashboard'], summary: 'Get stock inventory summary' },
    },
    getInventorySummaryHandler,
  );

  // ── Customer & Supplier Analytics ──────────────────────────────────────────
  fastify.get(
    '/customer-summary',
    {
      preHandler: guard('dashboard.view'),
      schema: { tags: ['Dashboard'], summary: 'Get customer analytics summary' },
    },
    getCustomerSummaryHandler,
  );

  fastify.get(
    '/supplier-summary',
    {
      preHandler: guard('dashboard.view'),
      schema: { tags: ['Dashboard'], summary: 'Get supplier analytics summary' },
    },
    getSupplierSummaryHandler,
  );

  // ── Financial Analytics ────────────────────────────────────────────────────
  fastify.get(
    '/financial-summary',
    {
      preHandler: guard('analytics.view'),
      schema: { tags: ['Dashboard'], summary: 'Get financial summary balance totals' },
    },
    getFinancialSummaryHandler,
  );

  // ── Top Performing Lists ───────────────────────────────────────────────────
  fastify.get(
    '/top-products',
    {
      preHandler: guard('analytics.view'),
      schema: { tags: ['Dashboard'], summary: 'Get top products by quantity and revenue' },
    },
    getTopProductsHandler,
  );

  fastify.get(
    '/top-customers',
    {
      preHandler: guard('analytics.view'),
      schema: { tags: ['Dashboard'], summary: 'Get top customers by sales total' },
    },
    getTopCustomersHandler,
  );
}
