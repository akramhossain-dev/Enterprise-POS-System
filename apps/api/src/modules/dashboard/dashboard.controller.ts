import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { dateFilterSchema } from './dashboard.schema';
import {
  getDashboardOverview,
  getSalesSummary,
  getSalesTrend,
  getPurchaseSummary,
  getInventorySummary,
  getCustomerSummary,
  getSupplierSummary,
  getFinancialSummary,
  getTopProducts,
  getTopCustomers,
} from './dashboard.service';

export async function getOverviewHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);

  const data = await getDashboardOverview(actor.id, query.startDate, query.endDate);
  reply.status(200).send(sendSuccess({ message: 'Dashboard Overview fetched successfully', data }));
}

export async function getSalesSummaryHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const data = await getSalesSummary(actor.id);
  reply.status(200).send(sendSuccess({ message: 'Sales Summary fetched successfully', data }));
}

export async function getSalesTrendHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);
  const { trend } = req.query as { trend?: string };

  const trendType = trend === 'Weekly' || trend === 'Monthly' ? trend : 'Daily';

  const data = await getSalesTrend(actor.id, trendType, query.startDate, query.endDate);
  reply.status(200).send(sendSuccess({ message: 'Sales Trend fetched successfully', data }));
}

export async function getPurchaseSummaryHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);

  const data = await getPurchaseSummary(actor.id, query.startDate, query.endDate);
  reply.status(200).send(sendSuccess({ message: 'Purchase Summary fetched successfully', data }));
}

export async function getInventorySummaryHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const data = await getInventorySummary(actor.id);
  reply.status(200).send(sendSuccess({ message: 'Inventory Summary fetched successfully', data }));
}

export async function getCustomerSummaryHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);

  const data = await getCustomerSummary(actor.id, query.startDate, query.endDate);
  reply.status(200).send(sendSuccess({ message: 'Customer Summary fetched successfully', data }));
}

export async function getSupplierSummaryHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);

  const data = await getSupplierSummary(actor.id, query.startDate, query.endDate);
  reply.status(200).send(sendSuccess({ message: 'Supplier Summary fetched successfully', data }));
}

export async function getFinancialSummaryHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);

  const data = await getFinancialSummary(actor.id, query.startDate, query.endDate);
  reply.status(200).send(sendSuccess({ message: 'Financial Summary fetched successfully', data }));
}

export async function getTopProductsHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);
  const { limit } = req.query as { limit?: string };

  const limitVal = limit ? parseInt(limit, 10) : 5;

  const data = await getTopProducts(actor.id, query.startDate, query.endDate, limitVal);
  reply.status(200).send(sendSuccess({ message: 'Top Products fetched successfully', data }));
}

export async function getTopCustomersHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(dateFilterSchema, req.query);
  const { limit } = req.query as { limit?: string };

  const limitVal = limit ? parseInt(limit, 10) : 5;

  const data = await getTopCustomers(actor.id, query.startDate, query.endDate, limitVal);
  reply.status(200).send(sendSuccess({ message: 'Top Customers fetched successfully', data }));
}
