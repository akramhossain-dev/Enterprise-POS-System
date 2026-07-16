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

// ----------------------------------------------------
// FINANCIAL STATEMENTS & TAX TYPES (Phase F9.3)
// ----------------------------------------------------

export interface ProfitLossStatement {
  revenue: { code: string; name: string; balance: number }[];
  cogs: { code: string; name: string; balance: number }[];
  grossProfit: number;
  expenses: { code: string; name: string; balance: number }[];
  operatingProfit: number;
  netProfit: number;
}

export interface BalanceSheet {
  assets: { code: string; name: string; balance: number }[];
  liabilities: { code: string; name: string; balance: number }[];
  equity: { code: string; name: string; balance: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface CashFlowStatement {
  operating: { name: string; balance: number }[];
  investing: { name: string; balance: number }[];
  financing: { name: string; balance: number }[];
  netCashFlow: number;
}

export interface TrialBalanceItem {
  accountId: string;
  code: string;
  name: string;
  debit: number;
  credit: number;
}

export interface TrialBalance {
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number; // percentage, e.g. 15 for 15%
  type: 'VAT' | 'GST' | 'SALES' | 'PURCHASE';
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface TaxGroup {
  id: string;
  name: string;
  rates: string[]; // list of tax rate IDs
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface TaxCategory {
  id: string;
  name: string;
  code: string;
  taxRateId: string;
  notes?: string;
}

export interface TaxTransaction {
  id: string;
  date: string;
  reference: string;
  type: 'SALES' | 'PURCHASE';
  amount: number;
  taxAmount: number;
  taxRate: number;
  taxRateName: string;
}

export interface TaxReport {
  transactions: TaxTransaction[];
  totalSalesTax: number;
  totalPurchaseTax: number;
  netLiability: number;
}

export interface AccountingPeriod {
  id: string;
  name: string; // e.g. "January 2026"
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
}

export interface FiscalYear {
  id: string;
  year: number; // e.g. 2026
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED';
  periods: AccountingPeriod[];
}

export interface ClosingChecklistItem {
  id: string;
  task: string;
  description: string;
  checked: boolean;
  checkedBy?: string;
  checkedAt?: string;
}

export interface AccountingAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}
