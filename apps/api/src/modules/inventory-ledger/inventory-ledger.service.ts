import { NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import { LedgerQuery } from './inventory-ledger.schema';
import { findLedgerEntries, findLedgerById } from './inventory-ledger.repository';
import { mapLedgerEntry, mapLedgerList, MappedLedgerEntry } from './inventory-ledger.mapper';

export async function listLedgerEntries(query: LedgerQuery): Promise<{
  entries: MappedLedgerEntry[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { entries, meta } = await findLedgerEntries(query);
  return { entries: mapLedgerList(entries), meta };
}

export async function getLedgerById(id: string): Promise<MappedLedgerEntry> {
  const e = await findLedgerById(id);
  if (!e) {
    throw new NotFoundError(`Ledger entry "${id}" not found`);
  }
  return mapLedgerEntry(e);
}
