import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListUnits,
  handleGetUnit,
  handleCreateUnit,
  handleUpdateUnit,
  handleDeleteUnit,
} from './unit.controller';

export async function unitRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('unit.read')],
      schema: { tags: ['Units'], summary: 'List units' },
    },
    handleListUnits,
  );
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('unit.read')],
      schema: { tags: ['Units'], summary: 'Get unit by ID' },
    },
    handleGetUnit,
  );
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('unit.create')],
      schema: { tags: ['Units'], summary: 'Create unit' },
    },
    handleCreateUnit,
  );
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('unit.update')],
      schema: { tags: ['Units'], summary: 'Update unit' },
    },
    handleUpdateUnit,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('unit.delete')],
      schema: { tags: ['Units'], summary: 'Delete unit' },
    },
    handleDeleteUnit,
  );
}

export default unitRoutes;
