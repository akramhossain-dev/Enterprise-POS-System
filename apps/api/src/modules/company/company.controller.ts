import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  companyQuerySchema,
  createCompanySchema,
  updateCompanySchema,
  CompanyQuery,
  CreateCompanyBody,
} from './company.schema';
import {
  listCompanies,
  findCompanyById,
  createCompany,
  updateCompany,
  softDeleteCompany,
} from './company.service';

/**
 * GET /companies
 */
export async function handleListCompanies(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(companyQuerySchema, request.query);
  const result = await listCompanies(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Companies fetched successfully',
      data: result.companies,
      meta: result.meta,
    }),
  );
}

/**
 * GET /companies/:id
 */
export async function handleGetCompany(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const company = await findCompanyById(id);
  reply.status(200).send(sendSuccess({ message: 'Company fetched successfully', data: company }));
}

/**
 * POST /companies
 */
export async function handleCreateCompany(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createCompanySchema, request.body);
  const company = await createCompany(body);
  reply.status(201).send(sendSuccess({ message: 'Company created successfully', data: company }));
}

/**
 * PATCH /companies/:id
 */
export async function handleUpdateCompany(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateCompanySchema, request.body);
  const company = await updateCompany(id, body);
  reply.status(200).send(sendSuccess({ message: 'Company updated successfully', data: company }));
}

/**
 * DELETE /companies/:id
 */
export async function handleDeleteCompany(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteCompany(id);
  reply.status(200).send(sendSuccess({ message: 'Company deleted successfully' }));
}
