import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  productQuerySchema,
  productSearchSchema,
  createProductSchema,
  updateProductSchema,
  ProductQuery,
  ProductSearchQuery,
} from './product.schema';
import {
  listProducts,
  searchProducts,
  findProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
} from './product.service';

export async function handleListProducts(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(productQuerySchema, request.query) as ProductQuery;
  const result = await listProducts(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Products fetched successfully',
      data: result.products,
      meta: result.meta,
    }),
  );
}

export async function handleSearchProducts(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(productSearchSchema, request.query) as ProductSearchQuery;
  const result = await searchProducts(query);
  reply
    .status(200)
    .send(
      sendSuccess({ message: 'Product search results', data: result.products, meta: result.meta }),
    );
}

export async function handleGetProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const product = await findProductById(id);
  reply.status(200).send(sendSuccess({ message: 'Product fetched successfully', data: product }));
}

export async function handleCreateProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createProductSchema, request.body);
  const product = await createProduct(body);
  reply.status(201).send(sendSuccess({ message: 'Product created successfully', data: product }));
}

export async function handleUpdateProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateProductSchema, request.body);
  const product = await updateProduct(id, body);
  reply.status(200).send(sendSuccess({ message: 'Product updated successfully', data: product }));
}

export async function handleDeleteProduct(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteProduct(id);
  reply.status(200).send(sendSuccess({ message: 'Product deleted successfully' }));
}
