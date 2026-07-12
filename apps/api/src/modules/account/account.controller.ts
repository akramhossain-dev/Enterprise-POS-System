import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  createAccountCategorySchema,
  createAccountSchema,
  updateAccountSchema,
  accountQuerySchema,
} from './account.schema';
import { AccountQuery } from './account.types';
import {
  createAccountCategory,
  listAccountCategories,
  createAccount,
  listAccounts,
  getAccountDetails,
  updateAccount,
  deleteAccount,
} from './account.service';

export async function handleCreateAccountCategory(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createAccountCategorySchema, req.body);
  const actor = req.user as { id: string };

  const data = await createAccountCategory(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Account Category created successfully', data }));
}

export async function handleListAccountCategories(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const actor = req.user as { id: string };
  const data = await listAccountCategories(actor.id);
  reply.status(200).send(sendSuccess({ message: 'Account Categories fetched successfully', data }));
}

export async function handleCreateAccount(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = validateBody(createAccountSchema, req.body);
  const actor = req.user as { id: string };

  const data = await createAccount(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Account created successfully', data }));
}

export async function handleListAccounts(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(
    accountQuerySchema as unknown as import('zod').ZodSchema<AccountQuery>,
    req.query,
  );
  const actor = req.user as { id: string };

  const result = await listAccounts(actor.id, query);
  reply
    .status(200)
    .send(
      sendSuccess({
        message: 'Accounts fetched successfully',
        data: result.accounts,
        meta: result.meta,
      }),
    );
}

export async function handleGetAccount(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await getAccountDetails(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Account details fetched successfully', data }));
}

export async function handleUpdateAccount(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const body = validateBody(updateAccountSchema, req.body);
  const actor = req.user as { id: string };

  const data = await updateAccount(id, body, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Account updated successfully', data }));
}

export async function handleDeleteAccount(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  await deleteAccount(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Account deleted successfully' }));
}

import { getAccountLedger } from '../ledger/ledger.service';
import { GeneralLedgerQuery } from '../ledger/ledger.types';
import { z } from 'zod';

export async function handleGetAccountLedger(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const querySchema = z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  });

  const parsed = querySchema.parse(req.query);
  const query: GeneralLedgerQuery = {};
  if (parsed.dateFrom !== undefined) {
    query.dateFrom = parsed.dateFrom;
  }
  if (parsed.dateTo !== undefined) {
    query.dateTo = parsed.dateTo;
  }
  const data = await getAccountLedger(id, query, actor.id);

  reply.status(200).send(sendSuccess({ message: 'General Ledger history retrieved', data }));
}
