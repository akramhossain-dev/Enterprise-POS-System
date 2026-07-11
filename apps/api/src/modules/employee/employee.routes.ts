import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListEmployees,
  handleGetEmployee,
  handleCreateEmployee,
  handleUpdateEmployee,
  handleDeleteEmployee,
} from './employee.controller';

/**
 * Route definitions for /employees endpoints.
 */
export async function employeeRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // GET /employees
  fastify.get(
    '/',
    {
      preHandler: [authGuard, permissionGuard('employee.read')],
      schema: { tags: ['Employees'], summary: 'List all employees' },
    },
    handleListEmployees,
  );

  // GET /employees/:id
  fastify.get(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('employee.read')],
      schema: { tags: ['Employees'], summary: 'Get employee by ID' },
    },
    handleGetEmployee,
  );

  // POST /employees
  fastify.post(
    '/',
    {
      preHandler: [authGuard, permissionGuard('employee.create')],
      schema: { tags: ['Employees'], summary: 'Create a new employee' },
    },
    handleCreateEmployee,
  );

  // PATCH /employees/:id
  fastify.patch(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('employee.update')],
      schema: { tags: ['Employees'], summary: 'Update employee' },
    },
    handleUpdateEmployee,
  );

  // DELETE /employees/:id
  fastify.delete(
    '/:id',
    {
      preHandler: [authGuard, permissionGuard('employee.delete')],
      schema: { tags: ['Employees'], summary: 'Soft-delete employee' },
    },
    handleDeleteEmployee,
  );
}

export default employeeRoutes;
