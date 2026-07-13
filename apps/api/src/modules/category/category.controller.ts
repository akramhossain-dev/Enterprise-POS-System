import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import { verifyTenantScope } from '../../common/middleware/auth';
import {
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  CategoryQuery,
  CreateCategoryBody,
} from './category.schema';
import {
  listCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  softDeleteCategory,
} from './category.service';

export async function handleListCategories(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(categoryQuerySchema, request.query) as CategoryQuery;
  await verifyTenantScope(request, query.companyId);
  const result = await listCategories(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Categories fetched successfully',
      data: result.categories,
      meta: result.meta,
    }),
  );
}

export async function handleGetCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const category = await findCategoryById(id, true);
  await verifyTenantScope(request, category.companyId);
  reply.status(200).send(sendSuccess({ message: 'Category fetched successfully', data: category }));
}

export async function handleCreateCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createCategorySchema, request.body) as CreateCategoryBody;
  await verifyTenantScope(request, body.companyId);
  const category = await createCategory(body);
  reply.status(201).send(sendSuccess({ message: 'Category created successfully', data: category }));
}

export async function handleUpdateCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const category = await findCategoryById(id);
  await verifyTenantScope(request, category.companyId);
  const body = validateBody(updateCategorySchema, request.body);
  const updated = await updateCategory(id, body);
  reply.status(200).send(sendSuccess({ message: 'Category updated successfully', data: updated }));
}

export async function handleDeleteCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const category = await findCategoryById(id);
  await verifyTenantScope(request, category.companyId);
  await softDeleteCategory(id);
  reply.status(200).send(sendSuccess({ message: 'Category deleted successfully' }));
}
