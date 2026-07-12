import { AccountType, AccountStatus } from '@prisma/client';

export interface MappedAccountCategory {
  id: string;
  companyId: string;
  name: string;
  type: AccountType;
  createdAt: string;
}

export interface MappedAccount {
  id: string;
  companyId: string;
  categoryId: string;
  categoryName?: string;
  parentId: string | null;
  parentName?: string | null;
  accountCode: string;
  name: string;
  type: AccountType;
  openingBalance: string;
  currentBalance: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  children?: MappedAccount[];
}

export interface AccountQuery {
  page?: number;
  limit?: number;
  type?: AccountType;
  status?: AccountStatus;
  search?: string;
}
