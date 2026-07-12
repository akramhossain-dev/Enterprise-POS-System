import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  handleCreateAccountCategory,
  handleListAccountCategories,
  handleCreateAccount,
  handleListAccounts,
  handleGetAccount,
  handleUpdateAccount,
  handleDeleteAccount,
  handleGetAccountLedger,
} from './account.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function accountRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Category routes
  fastify.post(
    '/account-categories',
    {
      preHandler: guard('account.create'),
      schema: { tags: ['Accounts'], summary: 'Create a new account category' },
    },
    handleCreateAccountCategory,
  );

  fastify.get(
    '/account-categories',
    {
      preHandler: guard('account.view'),
      schema: { tags: ['Accounts'], summary: 'List all account categories' },
    },
    handleListAccountCategories,
  );

  // Account routes
  fastify.post(
    '/accounts',
    {
      preHandler: guard('account.create'),
      schema: { tags: ['Accounts'], summary: 'Create a new ledger account' },
    },
    handleCreateAccount,
  );

  fastify.get(
    '/accounts',
    {
      preHandler: guard('account.view'),
      schema: { tags: ['Accounts'], summary: 'List accounts' },
    },
    handleListAccounts,
  );

  fastify.get(
    '/accounts/:id',
    {
      preHandler: guard('account.view'),
      schema: { tags: ['Accounts'], summary: 'Get details of an account' },
    },
    handleGetAccount,
  );

  fastify.patch(
    '/accounts/:id',
    {
      preHandler: guard('account.update'),
      schema: { tags: ['Accounts'], summary: 'Update an account' },
    },
    handleUpdateAccount,
  );

  fastify.delete(
    '/accounts/:id',
    {
      preHandler: guard('account.delete'),
      schema: { tags: ['Accounts'], summary: 'Delete an account' },
    },
    handleDeleteAccount,
  );

  fastify.get(
    '/accounts/:id/ledger',
    {
      preHandler: guard('ledger.view'),
      schema: { tags: ['Accounts'], summary: 'Get general ledger transactions for an account' },
    },
    handleGetAccountLedger,
  );
}

export default accountRoutes;
