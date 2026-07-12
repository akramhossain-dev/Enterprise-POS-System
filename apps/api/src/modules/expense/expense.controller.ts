import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  createExpenseSchema,
  updateExpenseSchema,
} from './expense.schema';
import {
  createExpenseCategory,
  listExpenseCategories,
  updateExpenseCategory,
  createExpense,
  listExpenses,
  getExpenseDetails,
  updateExpense,
  deleteExpense,
} from './expense.service';
import { ExpenseQuery, ExpenseCategoryQuery } from './expense.types';
import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

// ── Expense Category Handlers ───────────────────────────────────────────────
export async function handleCreateExpenseCategory(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createExpenseCategorySchema, req.body);
  const actor = req.user as { id: string };

  const data = await createExpenseCategory(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Expense Category created successfully', data }));
}

export async function handleListExpenseCategories(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const querySchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  });
  const parsed = querySchema.parse(req.query);
  const actor = req.user as { id: string };

  const query: ExpenseCategoryQuery = {};
  if (parsed.status !== undefined) {
    query.status = parsed.status;
  }

  const data = await listExpenseCategories(actor.id, query);
  reply.status(200).send(sendSuccess({ message: 'Expense Categories fetched successfully', data }));
}

export async function handleUpdateExpenseCategory(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const body = validateBody(updateExpenseCategorySchema, req.body);
  const actor = req.user as { id: string };

  const data = await updateExpenseCategory(id, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Expense Category updated successfully', data }));
}

// ── Expense Handlers ────────────────────────────────────────────────────────
export async function handleCreateExpense(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createExpenseSchema, req.body);
  const actor = req.user as { id: string };

  const data = await createExpense(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Expense created successfully', data }));
}

export async function handleListExpenses(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const querySchema = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    categoryId: z.string().uuid().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    amountMin: z.coerce.number().optional(),
    amountMax: z.coerce.number().optional(),
    search: z.string().optional(),
  });

  const parsed = querySchema.parse(req.query);
  const actor = req.user as { id: string };

  const query: ExpenseQuery = {};
  if (parsed.page !== undefined) {
    query.page = parsed.page;
  }
  if (parsed.limit !== undefined) {
    query.limit = parsed.limit;
  }
  if (parsed.dateFrom !== undefined) {
    query.dateFrom = parsed.dateFrom;
  }
  if (parsed.dateTo !== undefined) {
    query.dateTo = parsed.dateTo;
  }
  if (parsed.categoryId !== undefined) {
    query.categoryId = parsed.categoryId;
  }
  if (parsed.paymentMethod !== undefined) {
    query.paymentMethod = parsed.paymentMethod;
  }
  if (parsed.amountMin !== undefined) {
    query.amountMin = parsed.amountMin;
  }
  if (parsed.amountMax !== undefined) {
    query.amountMax = parsed.amountMax;
  }
  if (parsed.search !== undefined) {
    query.search = parsed.search;
  }

  const data = await listExpenses(actor.id, query);
  reply
    .status(200)
    .send(
      sendSuccess({
        message: 'Expenses fetched successfully',
        data: data.expenses,
        meta: data.meta,
      }),
    );
}

export async function handleGetExpense(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await getExpenseDetails(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Expense details fetched successfully', data }));
}

export async function handleUpdateExpense(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const body = validateBody(updateExpenseSchema, req.body);
  const actor = req.user as { id: string };

  const data = await updateExpense(id, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Expense updated successfully', data }));
}

export async function handleDeleteExpense(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  await deleteExpense(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Expense deleted successfully' }));
}
