import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { handleCreateJournalEntry, handleGetJournalEntry } from './journal.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function journalRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Create journal entry (POST /journals)
  fastify.post(
    '/',
    {
      preHandler: guard('account.create'),
      schema: { tags: ['Journals'], summary: 'Post a new balanced double-entry journal' },
    },
    handleCreateJournalEntry,
  );

  // Get details (GET /journals/:id)
  fastify.get(
    '/:id',
    {
      preHandler: guard('account.view'),
      schema: { tags: ['Journals'], summary: 'Get details of a journal entry' },
    },
    handleGetJournalEntry,
  );
}

export default journalRoutes;
