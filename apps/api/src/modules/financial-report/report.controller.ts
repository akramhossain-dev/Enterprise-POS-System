import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { BadRequestError } from '../../common/errors/AppError';
import {
  getGeneralLedgerReport,
  getAccountStatementReport,
  getTrialBalanceReport,
  getFinancialSummaryReport,
  getProfitLossReport,
} from './report.service';

export async function getGeneralLedgerHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { accountId, startDate, endDate } = req.query as {
    accountId?: string;
    startDate?: string;
    endDate?: string;
  };

  if (!accountId) {
    throw new BadRequestError('accountId query parameter is required');
  }

  const sDate = startDate ? new Date(startDate) : undefined;
  const eDate = endDate ? new Date(endDate) : undefined;

  const data = await getGeneralLedgerReport(actor.id, accountId, sDate, eDate);
  reply
    .status(200)
    .send(sendSuccess({ message: 'General Ledger report generated successfully', data }));
}

export async function getAccountStatementHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { accountId } = req.params as { accountId: string };
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const sDate = startDate ? new Date(startDate) : undefined;
  const eDate = endDate ? new Date(endDate) : undefined;

  const data = await getAccountStatementReport(actor.id, accountId, sDate, eDate);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Account Statement generated successfully', data }));
}

export async function getTrialBalanceHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const data = await getTrialBalanceReport(actor.id);
  reply.status(200).send(sendSuccess({ message: 'Trial Balance generated successfully', data }));
}

export async function getFinancialSummaryHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const sDate = startDate ? new Date(startDate) : undefined;
  const eDate = endDate ? new Date(endDate) : undefined;

  const data = await getFinancialSummaryReport(actor.id, sDate, eDate);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Financial Summary generated successfully', data }));
}

export async function getProfitLossHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const sDate = startDate ? new Date(startDate) : undefined;
  const eDate = endDate ? new Date(endDate) : undefined;

  const data = await getProfitLossReport(actor.id, sDate, eDate);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Profit & Loss report generated successfully', data }));
}
