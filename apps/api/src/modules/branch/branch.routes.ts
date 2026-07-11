import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListBranches,
  handleGetBranch,
  handleCreateBranch,
  handleUpdateBranch,
  handleDeleteBranch,
} from './branch.controller';

/**
 * Route definitions for /branches endpoints.
 */
export async function branchRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // GET /branches
  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('branch.read')],
      schema: { tags: ['Branches'], summary: 'List all branches' },
    },
    handleListBranches,
  );

  // GET /branches/:id
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('branch.read')],
      schema: { tags: ['Branches'], summary: 'Get branch by ID' },
    },
    handleGetBranch,
  );

  // POST /branches
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('branch.create')],
      schema: { tags: ['Branches'], summary: 'Create a new branch' },
    },
    handleCreateBranch,
  );

  // PATCH /branches/:id
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('branch.update')],
      schema: { tags: ['Branches'], summary: 'Update branch' },
    },
    handleUpdateBranch,
  );

  // DELETE /branches/:id
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('branch.delete')],
      schema: { tags: ['Branches'], summary: 'Soft-delete branch' },
    },
    handleDeleteBranch,
  );
}

export default branchRoutes;
