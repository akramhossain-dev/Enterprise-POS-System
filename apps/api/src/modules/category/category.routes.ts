import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListCategories,
  handleGetCategory,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
} from './category.controller';

export async function categoryRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('category.read')],
      schema: { tags: ['Categories'], summary: 'List categories' },
    },
    handleListCategories,
  );
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('category.read')],
      schema: { tags: ['Categories'], summary: 'Get category by ID' },
    },
    handleGetCategory,
  );
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('category.create')],
      schema: { tags: ['Categories'], summary: 'Create category' },
    },
    handleCreateCategory,
  );
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('category.update')],
      schema: { tags: ['Categories'], summary: 'Update category' },
    },
    handleUpdateCategory,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('category.delete')],
      schema: { tags: ['Categories'], summary: 'Delete category' },
    },
    handleDeleteCategory,
  );
}

export default categoryRoutes;
