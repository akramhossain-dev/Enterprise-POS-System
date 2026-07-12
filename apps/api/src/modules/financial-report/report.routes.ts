import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  getGeneralLedgerHandler,
  getAccountStatementHandler,
  getTrialBalanceHandler,
  getFinancialSummaryHandler,
} from './report.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function reportRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Financial Reports ──────────────────────────────────────────────────────
  fastify.get(
    '/reports/general-ledger',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get General Ledger transactions' },
    },
    getGeneralLedgerHandler,
  );

  fastify.get(
    '/reports/account-statement/:accountId',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Account Statement' },
    },
    getAccountStatementHandler,
  );

  fastify.get(
    '/reports/trial-balance',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Trial Balance report' },
    },
    getTrialBalanceHandler,
  );

  fastify.get(
    '/reports/financial-summary',
    {
      preHandler: guard('financial.report.view'),
      schema: { tags: ['Reports'], summary: 'Get Financial Summary report' },
    },
    getFinancialSummaryHandler,
  );
}
