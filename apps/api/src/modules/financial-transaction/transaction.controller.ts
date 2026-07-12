import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import { createPaymentReceiptSchema, createPaymentVoucherSchema } from './transaction.schema';
import {
  createPaymentReceipt,
  createPaymentVoucher,
  listPaymentReceipts,
  getPaymentReceiptDetails,
  listPaymentVouchers,
  getPaymentVoucherDetails,
} from './transaction.service';
import { PaymentReceiptQuery, PaymentVoucherQuery } from './transaction.types';

export async function createReceiptHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const payload = validateBody(createPaymentReceiptSchema, req.body);
  const data = await createPaymentReceipt(payload, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Payment Receipt created successfully', data }));
}

export async function listReceiptsHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = req.query as PaymentReceiptQuery;
  const data = await listPaymentReceipts(actor.id, query);
  reply.status(200).send(sendSuccess({ message: 'Payment Receipts fetched successfully', data }));
}

export async function getReceiptDetailsHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };
  const data = await getPaymentReceiptDetails(id, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Payment Receipt details fetched successfully', data }));
}

export async function createVoucherHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const payload = validateBody(createPaymentVoucherSchema, req.body);
  const data = await createPaymentVoucher(payload, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Payment Voucher created successfully', data }));
}

export async function listVouchersHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = req.query as PaymentVoucherQuery;
  const data = await listPaymentVouchers(actor.id, query);
  reply.status(200).send(sendSuccess({ message: 'Payment Vouchers fetched successfully', data }));
}

export async function getVoucherDetailsHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };
  const data = await getPaymentVoucherDetails(id, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Payment Voucher details fetched successfully', data }));
}
