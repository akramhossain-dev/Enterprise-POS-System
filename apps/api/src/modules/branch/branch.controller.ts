import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  branchQuerySchema,
  createBranchSchema,
  updateBranchSchema,
  BranchQuery,
} from './branch.schema';
import {
  listBranches,
  findBranchById,
  createBranch,
  updateBranch,
  softDeleteBranch,
} from './branch.service';

/**
 * GET /branches
 */
export async function handleListBranches(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(branchQuerySchema, request.query);
  const result = await listBranches(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Branches fetched successfully',
      data: result.branches,
      meta: result.meta,
    }),
  );
}

/**
 * GET /branches/:id
 */
export async function handleGetBranch(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string };
  const branch = await findBranchById(id);
  reply.status(200).send(sendSuccess({ message: 'Branch fetched successfully', data: branch }));
}

/**
 * POST /branches
 */
export async function handleCreateBranch(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createBranchSchema, request.body);
  const branch = await createBranch(body);
  reply.status(201).send(sendSuccess({ message: 'Branch created successfully', data: branch }));
}

/**
 * PATCH /branches/:id
 */
export async function handleUpdateBranch(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateBranchSchema, request.body);
  const branch = await updateBranch(id, body);
  reply.status(200).send(sendSuccess({ message: 'Branch updated successfully', data: branch }));
}

/**
 * DELETE /branches/:id
 */
export async function handleDeleteBranch(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  await softDeleteBranch(id);
  reply.status(200).send(sendSuccess({ message: 'Branch deleted successfully' }));
}
