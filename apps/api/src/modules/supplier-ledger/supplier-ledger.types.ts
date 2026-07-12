import { SupplierLedgerEntryType } from '@prisma/client';

export interface MappedSupplierLedgerEntry {
  id: string;
  companyId: string;
  supplierId: string;
  entryType: SupplierLedgerEntryType;
  amount: string;
  runningBalance: string;
  referenceId: string;
  referenceNo: string;
  description: string | null;
  createdAt: string;
}

export interface SupplierLedgerQuery {
  page?: number | undefined;
  limit?: number | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  entryType?: SupplierLedgerEntryType | undefined;
}

export interface SupplierBalanceResponse {
  supplierId: string;
  companyName: string;
  supplierCode: string;
  currentBalance: string;
  creditLimit: string;
}
