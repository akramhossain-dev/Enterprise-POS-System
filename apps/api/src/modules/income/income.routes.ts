import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateIncome,
  handleListIncomes,
  handleGetIncome,
  handleUpdateIncome,
  handleDeleteIncome,
} from './income.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function incomeRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Incomes ───────────────────────────────────────────────────────────────
  fastify.post(
    '/incomes',
    {
      preHandler: guard('income.create'),
      schema: { tags: ['Incomes'], summary: 'Create a new income entry' },
    },
    handleCreateIncome,
  );

  fastify.post(
    '/income',
    {
      preHandler: guard('income.create'),
      schema: { tags: ['Incomes'], summary: 'Create a new income entry' },
    },
    handleCreateIncome,
  );

  fastify.get(
    '/incomes',
    {
      preHandler: guard('income.view'),
      schema: { tags: ['Incomes'], summary: 'List all incomes with filters' },
    },
    handleListIncomes,
  );

  fastify.get(
    '/income',
    {
      preHandler: guard('income.view'),
      schema: { tags: ['Incomes'], summary: 'List all incomes with filters' },
    },
    handleListIncomes,
  );

  fastify.get(
    '/incomes/:id',
    {
      preHandler: guard('income.view'),
      schema: { tags: ['Incomes'], summary: 'Get details of a specific income' },
    },
    handleGetIncome,
  );

  fastify.get(
    '/income/:id',
    {
      preHandler: guard('income.view'),
      schema: { tags: ['Incomes'], summary: 'Get details of a specific income' },
    },
    handleGetIncome,
  );

  fastify.patch(
    '/incomes/:id',
    {
      preHandler: guard('income.update'),
      schema: { tags: ['Incomes'], summary: 'Update/Cancel an income entry' },
    },
    handleUpdateIncome,
  );

  fastify.patch(
    '/income/:id',
    {
      preHandler: guard('income.update'),
      schema: { tags: ['Incomes'], summary: 'Update/Cancel an income entry' },
    },
    handleUpdateIncome,
  );

  fastify.delete(
    '/incomes/:id',
    {
      preHandler: guard('income.delete'),
      schema: { tags: ['Incomes'], summary: 'Delete and reverse an income entry' },
    },
    handleDeleteIncome,
  );

  fastify.delete(
    '/income/:id',
    {
      preHandler: guard('income.delete'),
      schema: { tags: ['Incomes'], summary: 'Delete and reverse an income entry' },
    },
    handleDeleteIncome,
  );
}
