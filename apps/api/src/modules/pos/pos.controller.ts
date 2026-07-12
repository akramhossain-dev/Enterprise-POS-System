import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import { openSessionSchema, closeSessionSchema, productSearchQuerySchema } from './pos.schema';
import {
  openPOSSession,
  closePOSSession,
  getActivePOSSession,
  searchPOSProducts,
} from './pos.service';

export async function handleOpenSession(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = req.user as { id: string };
  const body = validateBody(openSessionSchema, req.body);
  const data = await openPOSSession(
    body.companyId,
    body.branchId,
    body.warehouseId,
    actor.id,
    body.openingCash,
  );
  reply.status(201).send(sendSuccess({ message: 'POS Session opened successfully', data }));
}

export async function handleCloseSession(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = req.user as { id: string };
  const body = validateBody(closeSessionSchema, req.body);
  const data = await closePOSSession(actor.id, body.closingCash);
  reply.status(200).send(sendSuccess({ message: 'POS Session closed successfully', data }));
}

export async function handleGetActiveSession(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = req.user as { id: string };
  const data = await getActivePOSSession(actor.id);
  reply.status(200).send(sendSuccess({ message: 'Active POS Session retrieved', data }));
}

export async function handleProductSearch(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(productSearchQuerySchema, req.query);
  const data = await searchPOSProducts(query.q, query.warehouseId);
  reply.status(200).send(sendSuccess({ message: 'POS products search completed', data }));
}
