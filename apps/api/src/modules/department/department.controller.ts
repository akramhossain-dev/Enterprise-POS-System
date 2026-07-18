import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  departmentQuerySchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  DepartmentQuery,
  CreateDepartmentBody,
} from './department.schema';
import {
  listDepartments,
  findDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from './department.service';

export async function handleListDepartments(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(departmentQuerySchema, request.query);
  const result = await listDepartments(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Departments fetched successfully',
      data: result.departments,
      meta: result.meta,
    }),
  );
}

export async function handleGetDepartment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const dept = await findDepartmentById(id);
  reply.status(200).send(sendSuccess({ message: 'Department fetched successfully', data: dept }));
}

export async function handleCreateDepartment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createDepartmentSchema, request.body);
  const dept = await createDepartment(body);
  reply.status(201).send(sendSuccess({ message: 'Department created successfully', data: dept }));
}

export async function handleUpdateDepartment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateDepartmentSchema, request.body);
  const dept = await updateDepartment(id, body);
  reply.status(200).send(sendSuccess({ message: 'Department updated successfully', data: dept }));
}

export async function handleDeleteDepartment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await deleteDepartment(id);
  reply.status(200).send(sendSuccess({ message: 'Department deleted successfully' }));
}
