import { CustomerLedgerEntryType } from '@prisma/client';

export interface MappedCustomerLedgerEntry {
  id: string;
  companyId: string;
  customerId: string;
  entryType: CustomerLedgerEntryType;
  amount: string;
  runningBalance: string;
  referenceId: string;
  referenceNo: string;
  description: string | null;
  createdAt: string;
}

export interface CustomerBalanceResponse {
  customerId: string;
  fullName: string;
  customerCode: string;
  currentBalance: string;
  creditLimit: string;
}

export interface CustomerLedgerQuery {
  page?: number;
  limit?: number;
  entryType?: CustomerLedgerEntryType;
  dateFrom?: Date;
  dateTo?: Date;
}
