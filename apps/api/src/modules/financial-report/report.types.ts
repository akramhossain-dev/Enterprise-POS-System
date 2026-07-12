export interface GeneralLedgerRow {
  date: string;
  reference: string;
  debit: string;
  credit: string;
  balance: string;
}

export interface AccountStatementReport {
  accountId: string;
  accountName: string;
  accountCode: string;
  openingBalance: string;
  transactions: GeneralLedgerRow[];
  closingBalance: string;
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  type: string;
  debitTotal: string;
  creditTotal: string;
}

export interface FinancialSummaryReport {
  totalIncome: string;
  totalExpense: string;
  netProfit: string;
}
