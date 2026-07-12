import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import { createJournalEntrySchema } from './journal.schema';
import { createJournalEntry, getJournalEntryDetails } from './journal.service';

export async function handleCreateJournalEntry(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createJournalEntrySchema, req.body);
  const actor = req.user as { id: string };

  const data = await createJournalEntry(body, actor.id);
  reply.status(201).send(sendSuccess({ message: 'Journal Entry created successfully', data }));
}

export async function handleGetJournalEntry(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = req.params as { id: string };
  const actor = req.user as { id: string };

  const data = await getJournalEntryDetails(id, actor.id);
  reply.status(200).send(sendSuccess({ message: 'Journal Entry details fetched', data }));
}
