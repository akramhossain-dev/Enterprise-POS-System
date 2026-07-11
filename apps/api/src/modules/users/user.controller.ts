import { FastifyReply, FastifyRequest } from 'fastify';
import { listUsers, findUserById, modifyUser, softDeleteUser } from './user.service';
import { sendSuccess } from '../../common/responses/success';
import {
  validateBody,
  validateQuery,
  validateParams,
  UuidParamSchema,
} from '../../common/utils/validate';
import { updateUserBodySchema, userQuerySchema, UserQuery } from './user.schema';

/**
 * Get paginated list of users.
 */
export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  const query = validateQuery(userQuerySchema, request.query) as UserQuery;
  const { users, meta } = await listUsers(query);
  return reply.status(200).send(
    sendSuccess({
      message: 'Users fetched successfully',
      data: users,
      meta,
    }),
  );
}

/**
 * Get user profile details by ID.
 */
export async function getUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = validateParams(UuidParamSchema, request.params);
  const user = await findUserById(id);
  return reply.status(200).send(
    sendSuccess({
      message: 'User profile fetched successfully',
      data: user,
    }),
  );
}

/**
 * Update user details.
 */
export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { id } = validateParams(UuidParamSchema, request.params);
  const body = validateBody(updateUserBodySchema, request.body);
  const updatedUser = await modifyUser(id, body);
  return reply.status(200).send(
    sendSuccess({
      message: 'User profile updated successfully',
      data: updatedUser,
    }),
  );
}

/**
 * Soft delete a user.
 */
export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { id } = validateParams(UuidParamSchema, request.params);
  await softDeleteUser(id);
  return reply.status(200).send(
    sendSuccess({
      message: 'User profile deleted successfully',
      data: {},
    }),
  );
}
