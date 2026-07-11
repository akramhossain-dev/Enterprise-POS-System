import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  CategoryQuery,
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
  const category = await findCategoryById(id);
  reply.status(200).send(sendSuccess({ message: 'Category fetched successfully', data: category }));
}

export async function handleCreateCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createCategorySchema, request.body);
  const category = await createCategory(body);
  reply.status(201).send(sendSuccess({ message: 'Category created successfully', data: category }));
}

export async function handleUpdateCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateCategorySchema, request.body);
  const category = await updateCategory(id, body);
  reply.status(200).send(sendSuccess({ message: 'Category updated successfully', data: category }));
}

export async function handleDeleteCategory(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteCategory(id);
  reply.status(200).send(sendSuccess({ message: 'Category deleted successfully' }));
}
