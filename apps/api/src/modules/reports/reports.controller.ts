import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { reportsFilterSchema } from './reports.schema';
import {
  getDetailedSalesReport,
  getSalesSummaryReport,
  getProductSalesReport,
  getCustomerSalesReport,
  getDetailedPurchasesReport,
  getPurchaseSummaryReport,
  getSupplierPurchasesReport,
  getProfitAnalysisReport,
  getInventoryReportData,
  getLowStockReportData,
  getOutOfStockReportData,
  getStockMovementReportData,
  getBatchReportData,
  getExpiryReportData,
  getWarehouseReportData,
  getInventoryValuationReportData,
  getGeneralLedgerReportData,
  getTrialBalanceReportData,
  getProfitLossReportData,
} from './reports.service';
import { BadRequestError } from '../../common/errors/AppError';

function sendPaginatedResponse(
  reply: FastifyReply,
  payload: { items: unknown[]; total: number },
  page: number,
  limit: number,
  message: string,
) {
  reply.status(200).send(
    sendSuccess({
      message,
      data: payload.items,
      meta: {
        page,
        limit,
        total: payload.total,
        totalPages: Math.ceil(payload.total / limit),
      },
    }),
  );
}

export async function getDetailedSalesReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getDetailedSalesReport(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Detailed Sales Report fetched successfully',
  );
}

export async function getSalesSummaryReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const data = await getSalesSummaryReport(actor.id, filter);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Sales Summary Report fetched successfully', data }));
}

export async function getProductSalesReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getProductSalesReport(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Product Sales Report fetched successfully',
  );
}

export async function getCustomerSalesReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getCustomerSalesReport(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Customer Sales Report fetched successfully',
  );
}

export async function getDetailedPurchasesReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getDetailedPurchasesReport(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Detailed Purchases Report fetched successfully',
  );
}

export async function getPurchaseSummaryReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const data = await getPurchaseSummaryReport(actor.id, filter);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Purchase Summary Report fetched successfully', data }));
}

export async function getSupplierPurchasesReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getSupplierPurchasesReport(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Supplier Purchase Report fetched successfully',
  );
}

export async function getProfitAnalysisReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const data = await getProfitAnalysisReport(actor.id, filter);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Profit Analysis Report fetched successfully', data }));
}

export async function getInventoryReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getInventoryReportData(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Inventory Report fetched successfully',
  );
}

export async function getLowStockReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getLowStockReportData(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Low Stock Report fetched successfully',
  );
}

export async function getOutOfStockReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getOutOfStockReportData(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Out of Stock Report fetched successfully',
  );
}

export async function getStockMovementReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getStockMovementReportData(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Stock Movement Report fetched successfully',
  );
}

export async function getBatchReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getBatchReportData(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Batch Report fetched successfully',
  );
}

export async function getExpiryReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getExpiryReportData(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Expiry Report fetched successfully',
  );
}

export async function getWarehouseReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const res = await getWarehouseReportData(actor.id, filter);
  sendPaginatedResponse(
    reply,
    res,
    filter.page ?? 1,
    filter.limit ?? 20,
    'Warehouse Report fetched successfully',
  );
}

export async function getInventoryValuationReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const data = await getInventoryValuationReportData(actor.id, filter);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Inventory Valuation Report fetched successfully', data }));
}

export async function getGeneralLedgerReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);
  const { accountId } = req.query as { accountId?: string };

  if (!accountId) {
    throw new BadRequestError('accountId is required');
  }

  const data = await getGeneralLedgerReportData(
    actor.id,
    accountId,
    filter.startDate,
    filter.endDate,
  );
  reply
    .status(200)
    .send(sendSuccess({ message: 'General Ledger Report fetched successfully', data }));
}

export async function getTrialBalanceReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };

  const data = await getTrialBalanceReportData(actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Trial Balance Report fetched successfully', data }));
}

export async function getProfitLossReportHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const filter = validateQuery(reportsFilterSchema, req.query);

  const data = await getProfitLossReportData(actor.id, filter.startDate, filter.endDate);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Profit & Loss Statement fetched successfully', data }));
}
