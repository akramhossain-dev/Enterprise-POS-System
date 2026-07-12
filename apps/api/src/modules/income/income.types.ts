import { IncomeStatus, PaymentMethod } from '@prisma/client';

export interface IncomeQuery {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  paymentMethod?: PaymentMethod;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

export interface MappedIncome {
  id: string;
  incomeNumber: string;
  account: {
    id: string;
    accountCode: string;
    name: string;
  };
  date: string;
  amount: string;
  source: string | null;
  paymentMethod: PaymentMethod;
  reference: string | null;
  description: string | null;
  status: IncomeStatus;
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
