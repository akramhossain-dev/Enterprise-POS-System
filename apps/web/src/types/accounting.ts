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

export type JournalStatus = 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntry {
  id: string;
  referenceNumber: string;
  date: string;
  description: string;
  status: JournalStatus;
  notes?: string;
  attachmentUrl?: string;
  lines: JournalLine[];
  createdAt: string;
}

export interface LedgerTransaction {
  id: string;
  referenceNumber: string;
  date: string;
  description: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  runningBalance: number;
  transactionType: 'JOURNAL' | 'INCOME' | 'EXPENSE' | 'CASH' | 'BANK' | 'VOUCHER';
}

export interface IncomeTransaction {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK' | 'CARD' | 'MOBILE';
  reference: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface ExpenseTransaction {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK' | 'CARD' | 'MOBILE';
  reference: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  cashIn: number;
  cashOut: number;
  runningBalance: number;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  deposits: number;
  withdrawals: number;
  runningBalance: number;
  createdAt: string;
}

export type VoucherStatus = 'DRAFT' | 'APPROVED' | 'CANCELLED';

export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  payee: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK' | 'CARD' | 'MOBILE';
  reference: string;
  date: string;
  approvalStatus: VoucherStatus;
  notes?: string;
  createdAt: string;
}

export interface ReceiptVoucher {
  id: string;
  receiptNumber: string;
  receivedFrom: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK' | 'CARD' | 'MOBILE';
  reference: string;
  date: string;
  notes?: string;
  createdAt: string;
}
