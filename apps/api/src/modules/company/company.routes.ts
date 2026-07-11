import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListCompanies,
  handleGetCompany,
  handleCreateCompany,
  handleUpdateCompany,
  handleDeleteCompany,
} from './company.controller';

/**
 * Route definitions for /companies endpoints.
 */
export async function companyRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // GET /companies
  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('company.read')],
      schema: { tags: ['Companies'], summary: 'List all companies' },
    },
    handleListCompanies,
  );

  // GET /companies/:id
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('company.read')],
      schema: { tags: ['Companies'], summary: 'Get company by ID' },
    },
    handleGetCompany,
  );

  // POST /companies
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('company.create')],
      schema: { tags: ['Companies'], summary: 'Create a new company' },
    },
    handleCreateCompany,
  );

  // PATCH /companies/:id
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('company.update')],
      schema: { tags: ['Companies'], summary: 'Update company' },
    },
    handleUpdateCompany,
  );

  // DELETE /companies/:id
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('company.delete')],
      schema: { tags: ['Companies'], summary: 'Soft-delete company' },
    },
    handleDeleteCompany,
  );
}

export default companyRoutes;
