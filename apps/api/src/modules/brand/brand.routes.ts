import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListBrands,
  handleGetBrand,
  handleCreateBrand,
  handleUpdateBrand,
  handleDeleteBrand,
} from './brand.controller';

export async function brandRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('brand.read')],
      schema: { tags: ['Brands'], summary: 'List brands' },
    },
    handleListBrands,
  );
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('brand.read')],
      schema: { tags: ['Brands'], summary: 'Get brand by ID' },
    },
    handleGetBrand,
  );
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('brand.create')],
      schema: { tags: ['Brands'], summary: 'Create brand' },
    },
    handleCreateBrand,
  );
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('brand.update')],
      schema: { tags: ['Brands'], summary: 'Update brand' },
    },
    handleUpdateBrand,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('brand.delete')],
      schema: { tags: ['Brands'], summary: 'Delete brand' },
    },
    handleDeleteBrand,
  );
}

export default brandRoutes;
