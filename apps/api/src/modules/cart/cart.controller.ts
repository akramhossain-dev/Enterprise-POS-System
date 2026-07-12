import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import { createCartSchema, addCartItemSchema, updateCartItemSchema } from './cart.schema';
import {
  createNewCart,
  getCartById,
  addCartProduct,
  updateCartProduct,
  removeCartProduct,
  clearCartProducts,
} from './cart.service';

export async function handleCreateCart(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = req.user as { id: string };
  const body = validateBody(createCartSchema, req.body);
  const data = await createNewCart(body.sessionId, body.customerId, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Cart created successfully', data }));
}

export async function handleGetCart(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };
  const data = await getCartById(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Cart retrieved successfully', data }));
}

export async function handleAddCartItem(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };
  const body = validateBody(addCartItemSchema, req.body);
  const data = await addCartProduct(id, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Cart item added/updated successfully', data }));
}

export async function handleUpdateCartItem(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = req.user as { id: string };
  const { id, itemId } = req.params as { id: string; itemId: string };
  const body = validateBody(updateCartItemSchema, req.body);
  const data = await updateCartProduct(id, itemId, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Cart item updated successfully', data }));
}

export async function handleRemoveCartItem(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = req.user as { id: string };
  const { id, itemId } = req.params as { id: string; itemId: string };
  const data = await removeCartProduct(id, itemId, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Cart item removed successfully', data }));
}

export async function handleClearCart(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };
  const data = await clearCartProducts(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Cart items cleared successfully', data }));
}
