import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateExpenseCategory,
  handleListExpenseCategories,
  handleUpdateExpenseCategory,
  handleCreateExpense,
  handleListExpenses,
  handleGetExpense,
  handleUpdateExpense,
  handleDeleteExpense,
} from './expense.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function expenseRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // ── Expense Categories ────────────────────────────────────────────────────
  fastify.post(
    '/expense-categories',
    {
      preHandler: guard('expense.create'),
      schema: { tags: ['Expenses'], summary: 'Create a new expense category' },
    },
    handleCreateExpenseCategory,
  );

  fastify.get(
    '/expense-categories',
    {
      preHandler: guard('expense.view'),
      schema: { tags: ['Expenses'], summary: 'List all expense categories' },
    },
    handleListExpenseCategories,
  );

  fastify.patch(
    '/expense-categories/:id',
    {
      preHandler: guard('expense.update'),
      schema: { tags: ['Expenses'], summary: 'Update an expense category' },
    },
    handleUpdateExpenseCategory,
  );

  // ── Expenses ──────────────────────────────────────────────────────────────
  fastify.post(
    '/expenses',
    {
      preHandler: guard('expense.create'),
      schema: { tags: ['Expenses'], summary: 'Create a new expense' },
    },
    handleCreateExpense,
  );

  fastify.get(
    '/expenses',
    {
      preHandler: guard('expense.view'),
      schema: { tags: ['Expenses'], summary: 'List all expenses with filters' },
    },
    handleListExpenses,
  );

  fastify.get(
    '/expenses/:id',
    {
      preHandler: guard('expense.view'),
      schema: { tags: ['Expenses'], summary: 'Get details of a specific expense' },
    },
    handleGetExpense,
  );

  fastify.patch(
    '/expenses/:id',
    {
      preHandler: guard('expense.update'),
      schema: { tags: ['Expenses'], summary: 'Update/Cancel an expense' },
    },
    handleUpdateExpense,
  );

  fastify.delete(
    '/expenses/:id',
    {
      preHandler: guard('expense.delete'),
      schema: { tags: ['Expenses'], summary: 'Delete and reverse an expense' },
    },
    handleDeleteExpense,
  );
}
