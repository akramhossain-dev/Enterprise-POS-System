export type AccountType = 'ASSETS' | 'LIABILITIES' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type AccountBalanceType = 'DEBIT' | 'CREDIT';

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentAccountCode?: string;
  parentAccountName?: string;
  openingBalance: number;
  balance: number;
  balanceType: AccountBalanceType;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface AccountGroup {
  id: string;
  name: string;
  type: AccountType;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface AccountCategory {
  id: string;
  name: string;
  groupName: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface AccountingDashboardStats {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  cashBalance: number;
  bankBalance: number;
  receivableAmount: number;
  payableAmount: number;
}
