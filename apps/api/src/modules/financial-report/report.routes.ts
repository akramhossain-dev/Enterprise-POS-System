import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  getGeneralLedgerHandler,
  getAccountStatementHandler,
  getTrialBalanceHandler,
  getFinancialSummaryHandler,
  getProfitLossHandler,
} from './report.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function reportRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Align general ledger and statements with frontend config under /accounting prefix
  fastify.get(
    '/ledger',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get General Ledger transactions' },
    },
    getGeneralLedgerHandler,
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
    '/statements/trial-balance',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Trial Balance report' },
    },
    getTrialBalanceHandler,
  );

  fastify.get(
    '/statements/profit-loss',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Profit & Loss report' },
    },
    getProfitLossHandler,
  );

  fastify.get(
    '/statements/balance-sheet',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Balance Sheet' },
    },
    getFinancialSummaryHandler, // Fallback to financial summary
  );

  fastify.get(
    '/statements/cash-flow',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Cash Flow Statement' },
    },
    getFinancialSummaryHandler, // Fallback to financial summary
  );

  fastify.get(
    '/dashboard',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Financial Summary report' },
    },
    getFinancialSummaryHandler,
  );
}
