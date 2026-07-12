import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import { createIncomeSchema, updateIncomeSchema } from './income.schema';
import {
  createIncome,
  listIncomes,
  getIncomeDetails,
  updateIncome,
  deleteIncome,
} from './income.service';
import { IncomeQuery } from './income.types';
import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export async function handleCreateIncome(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createIncomeSchema, req.body);
  const actor = req.user as { id: string };

  const data = await createIncome(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Income created successfully', data }));
}

export async function handleListIncomes(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const querySchema = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    amountMin: z.coerce.number().optional(),
    amountMax: z.coerce.number().optional(),
    search: z.string().optional(),
  });

  const parsed = querySchema.parse(req.query);
  const actor = req.user as { id: string };

  const query: IncomeQuery = {};
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

  const data = await listIncomes(actor.id, query);
  reply
    .status(200)
    .send(
      sendSuccess({ message: 'Incomes fetched successfully', data: data.incomes, meta: data.meta }),
    );
}

export async function handleGetIncome(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await getIncomeDetails(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Income details fetched successfully', data }));
}

export async function handleUpdateIncome(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const body = validateBody(updateIncomeSchema, req.body);
  const actor = req.user as { id: string };

  const data = await updateIncome(id, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Income updated successfully', data }));
}

export async function handleDeleteIncome(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  await deleteIncome(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Income deleted successfully' }));
}
