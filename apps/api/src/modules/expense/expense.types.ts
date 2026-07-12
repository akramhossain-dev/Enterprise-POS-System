import { ExpenseCategoryStatus, ExpenseStatus, PaymentMethod } from '@prisma/client';

export interface ExpenseCategoryQuery {
  status?: ExpenseCategoryStatus;
}

export interface MappedExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  status: ExpenseCategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseQuery {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

export interface MappedExpense {
  id: string;
  expenseNumber: string;
  category: {
    id: string;
    name: string;
  };
  account: {
    id: string;
    accountCode: string;
    name: string;
  };
  date: string;
  amount: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  description: string | null;
  attachment: string | null;
  status: ExpenseStatus;
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
