import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  purchaseRequisitionQuerySchema,
  createPurchaseRequisitionSchema,
  updatePurchaseRequisitionSchema,
  PurchaseRequisitionQuery,
  CreatePurchaseRequisitionBody,
} from './purchase-requisition.schema';
import {
  listPurchaseRequisitions,
  findPurchaseRequisitionById,
  createPurchaseRequisition,
  updatePurchaseRequisition,
  deletePurchaseRequisition,
} from './purchase-requisition.service';

export async function handleListPurchaseRequisitions(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(
    purchaseRequisitionQuerySchema,
    request.query,
  ) as PurchaseRequisitionQuery;
  const result = await listPurchaseRequisitions(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Purchase Requisitions fetched successfully',
      data: result.requisitions,
      meta: result.meta,
    }),
  );
}

export async function handleGetPurchaseRequisition(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const pr = await findPurchaseRequisitionById(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Purchase Requisition fetched successfully', data: pr }));
}

export async function handleCreatePurchaseRequisition(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(
    createPurchaseRequisitionSchema,
    request.body,
  ) as CreatePurchaseRequisitionBody;
  const pr = await createPurchaseRequisition(body);
  reply
    .status(201)
    .send(sendSuccess({ message: 'Purchase Requisition created successfully', data: pr }));
}

export async function handleUpdatePurchaseRequisition(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updatePurchaseRequisitionSchema, request.body);
  const pr = await updatePurchaseRequisition(id, body);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Purchase Requisition updated successfully', data: pr }));
}

export async function handleDeletePurchaseRequisition(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await deletePurchaseRequisition(id);
  reply.status(200).send(sendSuccess({ message: 'Purchase Requisition deleted successfully' }));
}
