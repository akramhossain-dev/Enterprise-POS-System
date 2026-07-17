import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  designationQuerySchema,
  createDesignationSchema,
  updateDesignationSchema,
  DesignationQuery,
  CreateDesignationBody,
} from './designation.schema';
import {
  listDesignations,
  findDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from './designation.service';

export async function handleListDesignations(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(designationQuerySchema, request.query) as DesignationQuery;
  const result = await listDesignations(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Designations fetched successfully',
      data: result.designations,
      meta: result.meta,
    }),
  );
}

export async function handleGetDesignation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const desig = await findDesignationById(id);
  reply.status(200).send(sendSuccess({ message: 'Designation fetched successfully', data: desig }));
}

export async function handleCreateDesignation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createDesignationSchema, request.body) as CreateDesignationBody;
  const desig = await createDesignation(body);
  reply.status(201).send(sendSuccess({ message: 'Designation created successfully', data: desig }));
}

export async function handleUpdateDesignation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateDesignationSchema, request.body);
  const desig = await updateDesignation(id, body);
  reply.status(200).send(sendSuccess({ message: 'Designation updated successfully', data: desig }));
}

export async function handleDeleteDesignation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await deleteDesignation(id);
  reply.status(200).send(sendSuccess({ message: 'Designation deleted successfully' }));
}
