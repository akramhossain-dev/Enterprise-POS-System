import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  employeeQuerySchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  EmployeeQuery,
} from './employee.schema';
import {
  listEmployees,
  findEmployeeById,
  createEmployee,
  updateEmployee,
  softDeleteEmployee,
} from './employee.service';

/**
 * GET /employees
 */
export async function handleListEmployees(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(employeeQuerySchema, request.query) as EmployeeQuery;
  const result = await listEmployees(query);
  reply
    .status(200)
    .send(
      sendSuccess({
        message: 'Employees fetched successfully',
        data: result.employees,
        meta: result.meta,
      }),
    );
}

/**
 * GET /employees/:id
 */
export async function handleGetEmployee(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const employee = await findEmployeeById(id);
  reply.status(200).send(sendSuccess({ message: 'Employee fetched successfully', data: employee }));
}

/**
 * POST /employees
 */
export async function handleCreateEmployee(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createEmployeeSchema, request.body);
  const employee = await createEmployee(body);
  reply.status(201).send(sendSuccess({ message: 'Employee created successfully', data: employee }));
}

/**
 * PATCH /employees/:id
 */
export async function handleUpdateEmployee(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateEmployeeSchema, request.body);
  const employee = await updateEmployee(id, body);
  reply.status(200).send(sendSuccess({ message: 'Employee updated successfully', data: employee }));
}

/**
 * DELETE /employees/:id
 */
export async function handleDeleteEmployee(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteEmployee(id);
  reply.status(200).send(sendSuccess({ message: 'Employee deleted successfully' }));
}
