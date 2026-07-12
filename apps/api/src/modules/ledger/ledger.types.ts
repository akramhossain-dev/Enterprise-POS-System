import { AccountType } from '@prisma/client';

export interface GeneralLedgerLine {
  id: string;
  date: string;
  entryNumber: string;
  description: string | null;
  debit: string;
  credit: string;
  runningBalance: string;
}

export interface GeneralLedgerResponse {
  accountId: string;
  accountName: string;
  accountCode: string;
  accountType: AccountType;
  openingBalance: string;
  currentBalance: string;
  entries: GeneralLedgerLine[];
}

export interface GeneralLedgerQuery {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
}
