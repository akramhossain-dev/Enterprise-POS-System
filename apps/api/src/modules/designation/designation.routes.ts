import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListDesignations,
  handleGetDesignation,
  handleCreateDesignation,
  handleUpdateDesignation,
  handleDeleteDesignation,
} from './designation.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function designationRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('employee.read'),
      schema: { tags: ['Designations'], summary: 'List designations' },
    },
    handleListDesignations,
  );
  fastify.get(
    '/:id',
    {
      preHandler: guard('employee.read'),
      schema: { tags: ['Designations'], summary: 'Get designation by ID' },
    },
    handleGetDesignation,
  );
  fastify.post(
    '/',
    {
      preHandler: guard('employee.create'),
      schema: { tags: ['Designations'], summary: 'Create designation' },
    },
    handleCreateDesignation,
  );
  fastify.put(
    '/:id',
    {
      preHandler: guard('employee.update'),
      schema: { tags: ['Designations'], summary: 'Update designation' },
    },
    handleUpdateDesignation,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: guard('employee.delete'),
      schema: { tags: ['Designations'], summary: 'Delete designation' },
    },
    handleDeleteDesignation,
  );
}

export default designationRoutes;
