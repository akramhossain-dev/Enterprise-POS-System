import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListStorageLocations,
  handleGetStorageLocation,
  handleCreateStorageLocation,
  handleUpdateStorageLocation,
  handleDeleteStorageLocation,
} from './storage-location.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function storageLocationRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('warehouse.view'),
      schema: { tags: ['Storage Locations'], summary: 'List storage locations' },
    },
    handleListStorageLocations,
  );
  fastify.get(
    '/:id',
    {
      preHandler: guard('warehouse.view'),
      schema: { tags: ['Storage Locations'], summary: 'Get storage location by ID' },
    },
    handleGetStorageLocation,
  );
  fastify.post(
    '/',
    {
      preHandler: guard('warehouse.create'),
      schema: { tags: ['Storage Locations'], summary: 'Create storage location' },
    },
    handleCreateStorageLocation,
  );
  fastify.put(
    '/:id',
    {
      preHandler: guard('warehouse.update'),
      schema: { tags: ['Storage Locations'], summary: 'Update storage location' },
    },
    handleUpdateStorageLocation,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: guard('warehouse.delete'),
      schema: { tags: ['Storage Locations'], summary: 'Delete storage location' },
    },
    handleDeleteStorageLocation,
  );
}

export default storageLocationRoutes;
