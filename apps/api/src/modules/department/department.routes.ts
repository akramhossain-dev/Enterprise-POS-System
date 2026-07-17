import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleListDepartments,
  handleGetDepartment,
  handleCreateDepartment,
  handleUpdateDepartment,
  handleDeleteDepartment,
} from './department.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function departmentRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('employee.read'),
      schema: { tags: ['Departments'], summary: 'List departments' },
    },
    handleListDepartments,
  );
  fastify.get(
    '/:id',
    {
      preHandler: guard('employee.read'),
      schema: { tags: ['Departments'], summary: 'Get department by ID' },
    },
    handleGetDepartment,
  );
  fastify.post(
    '/',
    {
      preHandler: guard('employee.create'),
      schema: { tags: ['Departments'], summary: 'Create department' },
    },
    handleCreateDepartment,
  );
  fastify.put(
    '/:id',
    {
      preHandler: guard('employee.update'),
      schema: { tags: ['Departments'], summary: 'Update department' },
    },
    handleUpdateDepartment,
  );
  fastify.delete(
    '/:id',
    {
      preHandler: guard('employee.delete'),
      schema: { tags: ['Departments'], summary: 'Delete department' },
    },
    handleDeleteDepartment,
  );
}

export default departmentRoutes;
