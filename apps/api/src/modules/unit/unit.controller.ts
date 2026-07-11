import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import { unitQuerySchema, createUnitSchema, updateUnitSchema, UnitQuery } from './unit.schema';
import { listUnits, findUnitById, createUnit, updateUnit, softDeleteUnit } from './unit.service';

export async function handleListUnits(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(unitQuerySchema, request.query) as UnitQuery;
  const result = await listUnits(query);
  reply
    .status(200)
    .send(
      sendSuccess({ message: 'Units fetched successfully', data: result.units, meta: result.meta }),
    );
}

export async function handleGetUnit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string };
  const unit = await findUnitById(id);
  reply.status(200).send(sendSuccess({ message: 'Unit fetched successfully', data: unit }));
}

export async function handleCreateUnit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createUnitSchema, request.body);
  const unit = await createUnit(body);
  reply.status(201).send(sendSuccess({ message: 'Unit created successfully', data: unit }));
}

export async function handleUpdateUnit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateUnitSchema, request.body);
  const unit = await updateUnit(id, body);
  reply.status(200).send(sendSuccess({ message: 'Unit updated successfully', data: unit }));
}

export async function handleDeleteUnit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteUnit(id);
  reply.status(200).send(sendSuccess({ message: 'Unit deleted successfully' }));
}
