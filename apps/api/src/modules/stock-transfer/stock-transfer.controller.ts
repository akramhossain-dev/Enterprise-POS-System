// ─────────────────────────────────────────────
// Stock Transfer Module — Controller
// ─────────────────────────────────────────────

import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import { createTransferSchema, transferQuerySchema, TransferQuery } from './stock-transfer.schema';
import {
  createStockTransfer,
  listTransfers,
  getTransferById,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
} from './stock-transfer.service';

export async function handleCreateTransfer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createTransferSchema, request.body);
  const actor = request.user as { id: string };
  const transfer = await createStockTransfer(body, actor.id);
  reply
    .status(201)
    .send(sendSuccess({ message: 'Stock transfer created successfully', data: transfer }));
}

export async function handleListTransfers(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    transferQuerySchema as unknown as import('zod').ZodSchema<TransferQuery>,
    request.query,
  );
  const { transfers, meta } = await listTransfers(query);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Stock transfers fetched successfully', data: transfers, meta }));
}

export async function handleGetTransfer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const transfer = await getTransferById(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Stock transfer fetched successfully', data: transfer }));
}

export async function handleApproveTransfer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };
  const transfer = await approveTransfer(id, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Stock transfer approved successfully', data: transfer }));
}

export async function handleRejectTransfer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };
  const transfer = await rejectTransfer(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Stock transfer rejected', data: transfer }));
}

export async function handleCompleteTransfer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const actor = request.user as { id: string };
  const transfer = await completeTransfer(id, actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Stock transfer completed successfully', data: transfer }));
}
