import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import { brandQuerySchema, createBrandSchema, updateBrandSchema, BrandQuery } from './brand.schema';
import {
  listBrands,
  findBrandById,
  createBrand,
  updateBrand,
  softDeleteBrand,
} from './brand.service';

export async function handleListBrands(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(brandQuerySchema, request.query) as BrandQuery;
  const result = await listBrands(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Brands fetched successfully',
      data: result.brands,
      meta: result.meta,
    }),
  );
}

export async function handleGetBrand(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string };
  const brand = await findBrandById(id, true);
  reply.status(200).send(sendSuccess({ message: 'Brand fetched successfully', data: brand }));
}

export async function handleCreateBrand(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createBrandSchema, request.body);
  const brand = await createBrand(body);
  reply.status(201).send(sendSuccess({ message: 'Brand created successfully', data: brand }));
}

export async function handleUpdateBrand(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateBrandSchema, request.body);
  const brand = await updateBrand(id, body);
  reply.status(200).send(sendSuccess({ message: 'Brand updated successfully', data: brand }));
}

export async function handleDeleteBrand(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteBrand(id);
  reply.status(200).send(sendSuccess({ message: 'Brand deleted successfully' }));
}
