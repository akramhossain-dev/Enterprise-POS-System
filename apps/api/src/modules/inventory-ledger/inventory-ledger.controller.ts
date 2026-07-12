import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { ledgerQuerySchema, LedgerQuery } from './inventory-ledger.schema';
import { listLedgerEntries, getLedgerById } from './inventory-ledger.service';

export async function handleListLedger(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = validateQuery(
    ledgerQuerySchema as unknown as import('zod').ZodSchema<LedgerQuery>,
    req.query,
  );
  const { entries, meta } = await listLedgerEntries(query);
  reply.status(200).send(sendSuccess({ message: 'Inventory ledger fetched', data: entries, meta }));
}

export async function handleGetLedgerById(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string };
  const entry = await getLedgerById(id);
  reply.status(200).send(sendSuccess({ message: 'Ledger entry fetched', data: entry }));
}
