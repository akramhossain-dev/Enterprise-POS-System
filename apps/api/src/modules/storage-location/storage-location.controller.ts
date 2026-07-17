import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  storageLocationQuerySchema,
  createStorageLocationSchema,
  updateStorageLocationSchema,
  StorageLocationQuery,
  CreateStorageLocationBody,
} from './storage-location.schema';
import {
  listStorageLocations,
  findStorageLocationById,
  createStorageLocation,
  updateStorageLocation,
  deleteStorageLocation,
} from './storage-location.service';

export async function handleListStorageLocations(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(storageLocationQuerySchema, request.query) as StorageLocationQuery;
  const result = await listStorageLocations(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Storage Locations fetched successfully',
      data: result.locations,
      meta: result.meta,
    }),
  );
}

export async function handleGetStorageLocation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const loc = await findStorageLocationById(id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Storage Location fetched successfully', data: loc }));
}

export async function handleCreateStorageLocation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createStorageLocationSchema, request.body) as CreateStorageLocationBody;
  const loc = await createStorageLocation(body);
  reply
    .status(201)
    .send(sendSuccess({ message: 'Storage Location created successfully', data: loc }));
}

export async function handleUpdateStorageLocation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateStorageLocationSchema, request.body);
  const loc = await updateStorageLocation(id, body);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Storage Location updated successfully', data: loc }));
}

export async function handleDeleteStorageLocation(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await deleteStorageLocation(id);
  reply.status(200).send(sendSuccess({ message: 'Storage Location deleted successfully' }));
}
