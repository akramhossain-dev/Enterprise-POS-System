import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  getDetailedSalesReportHandler,
  getSalesSummaryReportHandler,
  getProductSalesReportHandler,
  getCustomerSalesReportHandler,
  getDetailedPurchasesReportHandler,
  getPurchaseSummaryReportHandler,
  getSupplierPurchasesReportHandler,
  getProfitAnalysisReportHandler,
  getInventoryReportHandler,
  getLowStockReportHandler,
  getOutOfStockReportHandler,
  getStockMovementReportHandler,
  getBatchReportHandler,
  getExpiryReportHandler,
  getWarehouseReportHandler,
  getInventoryValuationReportHandler,
  getGeneralLedgerReportHandler,
  getTrialBalanceReportHandler,
  getProfitLossReportHandler,
} from './reports.controller';
import {
  getAccountStatementHandler,
  getFinancialSummaryHandler,
} from '../financial-report/report.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function reportsRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Sales Reports ──────────────────────────────────────────────────────────
  fastify.get(
    '/sales',
    {
      preHandler: guard('report.sales.view'),
      schema: { tags: ['Reports'], summary: 'Get detailed sales list report' },
    },
    getDetailedSalesReportHandler,
  );

  fastify.get(
    '/sales-summary',
    {
      preHandler: guard('report.sales.view'),
      schema: { tags: ['Reports'], summary: 'Get sales summary aggregates' },
    },
    getSalesSummaryReportHandler,
  );

  fastify.get(
    '/product-sales',
    {
      preHandler: guard('report.sales.view'),
      schema: { tags: ['Reports'], summary: 'Get product sales and profit margin report' },
    },
    getProductSalesReportHandler,
  );

  // ── Customer Reports ───────────────────────────────────────────────────────
  fastify.get(
    '/customer-sales',
    {
      preHandler: guard('report.customer.view'),
      schema: { tags: ['Reports'], summary: 'Get customer sales statistics' },
    },
    getCustomerSalesReportHandler,
  );

  // ── Purchase Reports ───────────────────────────────────────────────────────
  fastify.get(
    '/purchases',
    {
      preHandler: guard('report.purchase.view'),
      schema: { tags: ['Reports'], summary: 'Get detailed purchase order report' },
    },
    getDetailedPurchasesReportHandler,
  );

  fastify.get(
    '/purchase-summary',
    {
      preHandler: guard('report.purchase.view'),
      schema: { tags: ['Reports'], summary: 'Get purchase summary metrics' },
    },
    getPurchaseSummaryReportHandler,
  );

  // ── Supplier Reports ───────────────────────────────────────────────────────
  fastify.get(
    '/supplier-purchases',
    {
      preHandler: guard('report.supplier.view'),
      schema: { tags: ['Reports'], summary: 'Get supplier purchase stats' },
    },
    getSupplierPurchasesReportHandler,
  );

  // ── Profit Analysis ────────────────────────────────────────────────────────
  fastify.get(
    '/profit-analysis',
    {
      preHandler: guard('report.profit.view'),
      schema: { tags: ['Reports'], summary: 'Get profit analysis summary' },
    },
    getProfitAnalysisReportHandler,
  );

  // ── Inventory Reports (B11.3) ──────────────────────────────────────────────
  fastify.get(
    '/inventory',
    {
      preHandler: guard('report.inventory.view'),
      schema: { tags: ['Reports'], summary: 'Get product stock levels inventory report' },
    },
    getInventoryReportHandler,
  );

  fastify.get(
    '/low-stock',
    {
      preHandler: guard('report.inventory.view'),
      schema: { tags: ['Reports'], summary: 'Get low stock products report' },
    },
    getLowStockReportHandler,
  );

  fastify.get(
    '/out-of-stock',
    {
      preHandler: guard('report.inventory.view'),
      schema: { tags: ['Reports'], summary: 'Get out of stock products report' },
    },
    getOutOfStockReportHandler,
  );

  fastify.get(
    '/stock-movements',
    {
      preHandler: guard('report.stock.view'),
      schema: { tags: ['Reports'], summary: 'Get stock movement ledger transactions' },
    },
    getStockMovementReportHandler,
  );

  fastify.get(
    '/batches',
    {
      preHandler: guard('report.inventory.view'),
      schema: { tags: ['Reports'], summary: 'Get batch status report' },
    },
    getBatchReportHandler,
  );

  fastify.get(
    '/expiry',
    {
      preHandler: guard('report.inventory.view'),
      schema: { tags: ['Reports'], summary: 'Get product expiry batch warnings' },
    },
    getExpiryReportHandler,
  );

  fastify.get(
    '/warehouses',
    {
      preHandler: guard('report.inventory.view'),
      schema: { tags: ['Reports'], summary: 'Get warehouse wise stock count summary' },
    },
    getWarehouseReportHandler,
  );

  fastify.get(
    '/inventory-valuation',
    {
      preHandler: guard('report.inventory.view'),
      schema: { tags: ['Reports'], summary: 'Get weighted average inventory valuation' },
    },
    getInventoryValuationReportHandler,
  );

  // ── Financial Reports (B11.3) ──────────────────────────────────────────────
  fastify.get(
    '/general-ledger',
    {
      preHandler: guard('report.ledger.view'),
      schema: { tags: ['Reports'], summary: 'Get General Ledger transactions' },
    },
    getGeneralLedgerReportHandler,
  );

  fastify.get(
    '/trial-balance',
    {
      preHandler: guard('report.financial.view'),
      schema: { tags: ['Reports'], summary: 'Get Trial Balance sheet report' },
    },
    getTrialBalanceReportHandler,
  );

  fastify.get(
    '/profit-loss',
    {
      preHandler: guard('report.financial.view'),
      schema: { tags: ['Reports'], summary: 'Get Profit & Loss dynamic report' },
    },
    getProfitLossReportHandler,
  );

  fastify.get(
    '/account-statement/:accountId',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Account Statement' },
    },
    getAccountStatementHandler,
  );

  fastify.get(
    '/financial-summary',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Financial Summary report' },
    },
    getFinancialSummaryHandler,
  );
}
