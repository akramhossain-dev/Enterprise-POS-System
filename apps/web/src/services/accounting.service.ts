import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  ChartAccount,
  AccountGroup,
  AccountCategory,
  AccountingDashboardStats,
  JournalEntry,
  JournalLine,
  LedgerTransaction,
  IncomeTransaction,
  ExpenseTransaction,
  CashTransaction,
  BankTransaction,
  PaymentVoucher,
  ReceiptVoucher,
  ProfitLossStatement,
  BalanceSheet,
  CashFlowStatement,
  TrialBalance,
  TaxRate,
  TaxGroup,
  TaxCategory,
  TaxTransaction,
  TaxReport,
  AccountingPeriod,
  FiscalYear,
  ClosingChecklistItem,
  AccountingAuditLog,
} from '@/types/accounting';

const ACCOUNTS_KEY = 'epos_simulated_chart_accounts';
const GROUPS_KEY = 'epos_simulated_account_groups';
const CATEGORIES_KEY = 'epos_simulated_account_categories';
const DASHBOARD_KEY = 'epos_simulated_accounting_dashboard';
const JOURNALS_KEY = 'epos_simulated_journals';
const INCOMES_KEY = 'epos_simulated_incomes';
const EXPENSES_KEY = 'epos_simulated_expenses';
const VOUCHERS_KEY = 'epos_simulated_vouchers';
const TAX_RATES_KEY = 'epos_simulated_tax_rates';
const TAX_GROUPS_KEY = 'epos_simulated_tax_groups';
const FISCAL_YEARS_KEY = 'epos_simulated_fiscal_years';
const CLOSING_CHECKLIST_KEY = 'epos_simulated_closing_checklist';
const AUDIT_LOG_KEY = 'epos_simulated_audit_logs';
const TAX_TRANSACTIONS_KEY = 'epos_simulated_tax_transactions';

class AccountingService extends ApiClient {
  // Preload Mock Accounts (GAAP Hierarchy Structure)
  private getMockAccounts(): ChartAccount[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultAccounts: ChartAccount[] = [
      {
        id: 'acc-1',
        code: '1000',
        name: 'Assets',
        type: 'ASSETS',
        openingBalance: 0,
        balance: 145000,
        balanceType: 'DEBIT',
        description: 'Asset accounts summary control account',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-2',
        code: '1100',
        name: 'Current Assets',
        type: 'ASSETS',
        parentAccountCode: '1000',
        openingBalance: 0,
        balance: 95000,
        balanceType: 'DEBIT',
        description: 'Short term current assets control',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-3',
        code: '1110',
        name: 'Petty Cash Register',
        type: 'ASSETS',
        parentAccountCode: '1100',
        openingBalance: 5000,
        balance: 15000,
        balanceType: 'DEBIT',
        description: 'Physical cash float inside store office',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-4',
        code: '1200',
        name: 'Cash at Bank',
        type: 'ASSETS',
        parentAccountCode: '1100',
        openingBalance: 50000,
        balance: 80000,
        balanceType: 'DEBIT',
        description: 'Central Commercial Bank operating balance',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-5',
        code: '2000',
        name: 'Liabilities',
        type: 'LIABILITIES',
        openingBalance: 0,
        balance: 45000,
        balanceType: 'CREDIT',
        description: 'Liability summary control account',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-6',
        code: '2100',
        name: 'Accounts Payable',
        type: 'LIABILITIES',
        parentAccountCode: '2000',
        openingBalance: 10000,
        balance: 45000,
        balanceType: 'CREDIT',
        description: 'Supplier payables and outstanding due control',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-7',
        code: '3000',
        name: 'Equity',
        type: 'EQUITY',
        openingBalance: 100000,
        balance: 100000,
        balanceType: 'CREDIT',
        description: 'Shareholder Capital',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-8',
        code: '4000',
        name: 'Revenue',
        type: 'INCOME',
        openingBalance: 0,
        balance: 75000,
        balanceType: 'CREDIT',
        description: 'Income control account',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'acc-9',
        code: '5000',
        name: 'Expenses',
        type: 'EXPENSE',
        openingBalance: 0,
        balance: 25000,
        balanceType: 'DEBIT',
        description: 'Operating expense accounts control',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    ];

    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }

  // Preload Mock Groups
  private getMockGroups(): AccountGroup[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(GROUPS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultGroups: AccountGroup[] = [
      {
        id: 'gp-1',
        name: 'Current Assets',
        type: 'ASSETS',
        description: 'Short term highly liquid assets',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'gp-2',
        name: 'Current Liabilities',
        type: 'LIABILITIES',
        description: 'Short term obligations payable',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'gp-3',
        name: 'Operating Revenue',
        type: 'INCOME',
        description: 'Core sales and operations revenue stream',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    ];

    localStorage.setItem(GROUPS_KEY, JSON.stringify(defaultGroups));
    return defaultGroups;
  }

  // Preload Mock Categories
  private getMockCategories(): AccountCategory[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultCategories: AccountCategory[] = [
      {
        id: 'cat-1',
        name: 'Cash and Cash Equivalents',
        groupName: 'Current Assets',
        description: 'Cash in drawer, safe float, operating bank deposits',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'cat-2',
        name: 'Trade Receivables',
        groupName: 'Current Assets',
        description: 'Customer credit limit checks outstanding due ledger',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'cat-3',
        name: 'Trade Payables',
        groupName: 'Current Liabilities',
        description: 'Supplier invoices pending payment settlements',
        status: 'ACTIVE',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    ];

    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  }

  // Dashboard Stats queries
  async getDashboardStats(): Promise<AccountingDashboardStats> {
    try {
      const response = await this.get<AccountingDashboardStats>(
        apiConfig.endpoints.accounting.dashboard,
      );
      return response.data;
    } catch {
      // Direct aggregation based on preloaded accounts
      const accounts = this.getMockAccounts();
      const assets = accounts
        .filter((a) => a.type === 'ASSETS' && !a.parentAccountCode)
        .reduce((acc, a) => acc + a.balance, 0);
      const liabilities = accounts
        .filter((a) => a.type === 'LIABILITIES' && !a.parentAccountCode)
        .reduce((acc, a) => acc + a.balance, 0);
      const equity = accounts
        .filter((a) => a.type === 'EQUITY' && !a.parentAccountCode)
        .reduce((acc, a) => acc + a.balance, 0);
      const income = accounts
        .filter((a) => a.type === 'INCOME' && !a.parentAccountCode)
        .reduce((acc, a) => acc + a.balance, 0);
      const expenses = accounts
        .filter((a) => a.type === 'EXPENSE' && !a.parentAccountCode)
        .reduce((acc, a) => acc + a.balance, 0);

      const stats: AccountingDashboardStats = {
        totalAssets: assets + 95000 + 15000 + 80000, // Preload hierarchy totals
        totalLiabilities: liabilities + 45000,
        totalEquity: equity,
        totalIncome: income + 75000,
        totalExpenses: expenses + 25000,
        netProfit: income + 75000 - (expenses + 25000),
        cashBalance: 15000,
        bankBalance: 80000,
        receivableAmount: 18000,
        payableAmount: 45000,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(DASHBOARD_KEY, JSON.stringify(stats));
      }
      return stats;
    }
  }

  // Account CRUD Methods
  async getAccounts(params?: {
    q?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ChartAccount>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.accounts, params);
      return {
        data: response.data.accounts ?? [],
        meta: response.meta ||
          (response.data as any).meta || {
            page: 1,
            pageSize: params?.limit || 50,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch {
      let items = this.getMockAccounts();

      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter((a) => a.name.toLowerCase().includes(query) || a.code.includes(query));
      }

      if (params?.type && params.type !== 'ALL') {
        items = items.filter((a) => a.type === params.type);
      }

      if (params?.status) {
        items = items.filter((a) => a.status === params.status);
      } else {
        items = items.filter((a) => a.status === 'ACTIVE');
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 50;
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = items.slice((page - 1) * limit, page * limit);

      return {
        data: paginated,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  }

  async getAccount(id: string): Promise<ChartAccount> {
    try {
      const response = await this.get<ChartAccount>(
        `${apiConfig.endpoints.accounting.accounts}/${id}`,
      );
      return response.data;
    } catch {
      const items = this.getMockAccounts();
      const found = items.find((a) => a.id === id || a.code === id);
      if (!found) throw new Error('Account code not found.');
      return found;
    }
  }

  async createAccount(payload: any): Promise<ChartAccount> {
    try {
      const response = await this.post<ChartAccount>(
        apiConfig.endpoints.accounting.accounts,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockAccounts();
      const newAcc: ChartAccount = {
        id: `acc-${Date.now()}`,
        code: payload.code,
        name: payload.name,
        type: payload.type,
        parentAccountCode: payload.parentAccountCode || undefined,
        openingBalance: payload.openingBalance || 0,
        balance: payload.openingBalance || 0,
        balanceType: payload.balanceType || 'DEBIT',
        description: payload.description || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      // Set parent lookup
      if (newAcc.parentAccountCode) {
        const parent = items.find((p) => p.code === newAcc.parentAccountCode);
        if (parent) {
          newAcc.parentAccountName = parent.name;
        }
      }

      items.push(newAcc);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(items));
      return newAcc;
    }
  }

  async updateAccount(id: string, payload: any): Promise<ChartAccount> {
    try {
      const response = await this.put<ChartAccount>(
        `${apiConfig.endpoints.accounting.accounts}/${id}`,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockAccounts();
      const idx = items.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Account not found.');

      const updated: ChartAccount = {
        ...items[idx]!,
        ...payload,
      };

      items[idx] = updated;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(items));
      return updated;
    }
  }

  async archiveAccount(id: string): Promise<ChartAccount> {
    try {
      const response = await this.post<ChartAccount>(
        `${apiConfig.endpoints.accounting.accounts}/${id}/archive`,
        {},
      );
      return response.data;
    } catch {
      return this.updateAccount(id, { status: 'ARCHIVED' });
    }
  }

  async restoreAccount(id: string): Promise<ChartAccount> {
    try {
      const response = await this.post<ChartAccount>(
        `${apiConfig.endpoints.accounting.accounts}/${id}/restore`,
        {},
      );
      return response.data;
    } catch {
      return this.updateAccount(id, { status: 'ACTIVE' });
    }
  }

  // Account Group Methods
  async getGroups(): Promise<PaginatedResponse<AccountGroup>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.groups);
      return {
        data: response.data.groups ?? [],
        meta: response.meta ||
          (response.data as any).meta || {
            page: 1,
            pageSize: 50,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch {
      const items = this.getMockGroups();
      return {
        data: items,
        meta: {
          page: 1,
          pageSize: 50,
          total: items.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async createGroup(payload: any): Promise<AccountGroup> {
    try {
      const response = await this.post<AccountGroup>(
        apiConfig.endpoints.accounting.groups,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockGroups();
      const newGp: AccountGroup = {
        id: `gp-${Date.now()}`,
        name: payload.name,
        type: payload.type || 'ASSETS',
        description: payload.description || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      items.push(newGp);
      localStorage.setItem(GROUPS_KEY, JSON.stringify(items));
      return newGp;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      await this.delete(`${apiConfig.endpoints.accounting.groups}/${id}`);
    } catch {
      const items = this.getMockGroups();
      const filtered = items.filter((g) => g.id !== id);
      localStorage.setItem(GROUPS_KEY, JSON.stringify(filtered));
    }
  }

  // Account Category Methods
  async getCategories(): Promise<PaginatedResponse<AccountCategory>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.categories);
      return {
        data: response.data.categories ?? [],
        meta: response.meta ||
          (response.data as any).meta || {
            page: 1,
            pageSize: 50,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch {
      const items = this.getMockCategories();
      return {
        data: items,
        meta: {
          page: 1,
          pageSize: 50,
          total: items.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async createCategory(payload: any): Promise<AccountCategory> {
    try {
      const response = await this.post<AccountCategory>(
        apiConfig.endpoints.accounting.categories,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockCategories();
      const newCat: AccountCategory = {
        id: `cat-${Date.now()}`,
        name: payload.name,
        groupName: payload.groupName || 'Current Assets',
        description: payload.description || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      items.push(newCat);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(items));
      return newCat;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await this.delete(`${apiConfig.endpoints.accounting.categories}/${id}`);
    } catch {
      const items = this.getMockCategories();
      const filtered = items.filter((c) => c.id !== id);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
    }
  }

  // ----------------------------------------------------
  // JOURNAL ENTRIES METHODS
  // ----------------------------------------------------
  private getMockJournals(): JournalEntry[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(JOURNALS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultJournals: JournalEntry[] = [
      {
        id: 'j-1',
        referenceNumber: 'JV-2026-0001',
        date: '2026-07-01T10:00:00.000Z',
        description: 'Initial Opening Balance Alignment',
        status: 'POSTED',
        notes: 'Setup core assets and liabilities floats.',
        lines: [
          {
            id: 'jl-1',
            accountId: 'acc-3',
            accountCode: '1110',
            accountName: 'Petty Cash Register',
            debitAmount: 15000,
            creditAmount: 0,
            description: 'Cash float in safety drawer',
          },
          {
            id: 'jl-2',
            accountId: 'acc-4',
            accountCode: '1200',
            accountName: 'Cash at Bank',
            debitAmount: 80000,
            creditAmount: 0,
            description: 'Operating bank deposits',
          },
          {
            id: 'jl-3',
            accountId: 'acc-6',
            accountCode: '2100',
            accountName: 'Accounts Payable',
            debitAmount: 0,
            creditAmount: 45000,
            description: 'Accrued supplier payables',
          },
          {
            id: 'jl-4',
            accountId: 'acc-7',
            accountCode: '3000',
            accountName: 'Equity',
            debitAmount: 0,
            creditAmount: 50000,
            description: 'Retained equity setup balance',
          },
        ],
        createdAt: '2026-07-01T10:00:00.000Z',
      },
      {
        id: 'j-2',
        referenceNumber: 'JV-2026-0002',
        date: '2026-07-12T14:30:00.000Z',
        description: 'Office Rent Accrual Provision',
        status: 'DRAFT',
        notes: 'Awaiting formal tax invoice details.',
        lines: [
          {
            id: 'jl-5',
            accountId: 'acc-9',
            accountCode: '5000',
            accountName: 'Expenses',
            debitAmount: 2500,
            creditAmount: 0,
            description: 'Accrued office space rent',
          },
          {
            id: 'jl-6',
            accountId: 'acc-6',
            accountCode: '2100',
            accountName: 'Accounts Payable',
            debitAmount: 0,
            creditAmount: 2500,
            description: 'Accrued rent payable liability',
          },
        ],
        createdAt: '2026-07-12T14:30:00.000Z',
      },
    ];

    localStorage.setItem(JOURNALS_KEY, JSON.stringify(defaultJournals));
    return defaultJournals;
  }

  async getJournals(params?: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<JournalEntry>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.journals, params);
      return {
        data: response.data.journals ?? [],
        meta: response.meta || {
          page: 1,
          pageSize: params?.limit || 15,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch {
      let items = this.getMockJournals();

      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (j) =>
            j.referenceNumber.toLowerCase().includes(query) ||
            j.description.toLowerCase().includes(query),
        );
      }

      if (params?.status && params.status !== 'ALL') {
        items = items.filter((j) => j.status === params.status);
      }

      // Sort newest first
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 15;
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = items.slice((page - 1) * limit, page * limit);

      return {
        data: paginated,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  }

  async getJournal(id: string): Promise<JournalEntry> {
    try {
      const response = await this.get<JournalEntry>(
        `${apiConfig.endpoints.accounting.journals}/${id}`,
      );
      return response.data;
    } catch {
      const items = this.getMockJournals();
      const found = items.find((j) => j.id === id);
      if (!found) throw new Error('Journal entry not found.');
      return found;
    }
  }

  async createJournal(payload: any): Promise<JournalEntry> {
    try {
      const response = await this.post<JournalEntry>(
        apiConfig.endpoints.accounting.journals,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockJournals();
      const newEntry: JournalEntry = {
        id: `j-${Date.now()}`,
        referenceNumber:
          payload.referenceNumber || `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: payload.date || new Date().toISOString(),
        description: payload.description,
        status: payload.status || 'DRAFT',
        notes: payload.notes || '',
        attachmentUrl: payload.attachmentUrl || '',
        lines: payload.lines.map((l: any, idx: number) => ({
          id: `jl-${Date.now()}-${idx}`,
          accountId: l.accountId,
          accountCode: l.accountCode,
          accountName: l.accountName,
          description: l.description || '',
          debitAmount: Number(l.debitAmount || 0),
          creditAmount: Number(l.creditAmount || 0),
        })),
        createdAt: new Date().toISOString(),
      };

      items.push(newEntry);
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(items));

      if (newEntry.status === 'POSTED') {
        // Automatically apply balances updates
        newEntry.lines.forEach((l) => {
          if (l.debitAmount > 0) this.updateAccountBalance(l.accountId, l.debitAmount, 'DEBIT');
          if (l.creditAmount > 0) this.updateAccountBalance(l.accountId, l.creditAmount, 'CREDIT');
        });
      }

      return newEntry;
    }
  }

  async updateJournal(id: string, payload: any): Promise<JournalEntry> {
    try {
      const response = await this.put<JournalEntry>(
        `${apiConfig.endpoints.accounting.journals}/${id}`,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockJournals();
      const idx = items.findIndex((j) => j.id === id);
      if (idx === -1) throw new Error('Journal entry not found.');

      const updated: JournalEntry = {
        ...items[idx]!,
        ...payload,
        lines: payload.lines
          ? payload.lines.map((l: any, lIdx: number) => ({
              id: l.id || `jl-${Date.now()}-${lIdx}`,
              accountId: l.accountId,
              accountCode: l.accountCode,
              accountName: l.accountName,
              description: l.description || '',
              debitAmount: Number(l.debitAmount || 0),
              creditAmount: Number(l.creditAmount || 0),
            }))
          : items[idx]!.lines,
      };

      items[idx] = updated;
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(items));
      return updated;
    }
  }

  async deleteJournal(id: string): Promise<void> {
    try {
      await this.delete(`${apiConfig.endpoints.accounting.journals}/${id}`);
    } catch {
      const items = this.getMockJournals();
      const filtered = items.filter((j) => j.id !== id);
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(filtered));
    }
  }

  async postJournal(id: string): Promise<JournalEntry> {
    try {
      const response = await this.post<JournalEntry>(
        `${apiConfig.endpoints.accounting.journals}/${id}/post`,
        {},
      );
      return response.data;
    } catch {
      const items = this.getMockJournals();
      const idx = items.findIndex((j) => j.id === id);
      if (idx === -1) throw new Error('Journal not found.');

      const entry = items[idx]!;
      if (entry.status === 'POSTED') return entry;

      entry.status = 'POSTED';
      items[idx] = entry;
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(items));

      // Post ledgers updating account balances
      entry.lines.forEach((l) => {
        if (l.debitAmount > 0) this.updateAccountBalance(l.accountId, l.debitAmount, 'DEBIT');
        if (l.creditAmount > 0) this.updateAccountBalance(l.accountId, l.creditAmount, 'CREDIT');
      });

      return entry;
    }
  }

  async approveJournal(id: string): Promise<JournalEntry> {
    try {
      const response = await this.post<JournalEntry>(
        `${apiConfig.endpoints.accounting.journals}/${id}/approve`,
        {},
      );
      return response.data;
    } catch {
      return this.updateJournal(id, { status: 'APPROVED' });
    }
  }

  async cancelJournal(id: string): Promise<JournalEntry> {
    try {
      const response = await this.post<JournalEntry>(
        `${apiConfig.endpoints.accounting.journals}/${id}/cancel`,
        {},
      );
      return response.data;
    } catch {
      return this.updateJournal(id, { status: 'CANCELLED' });
    }
  }

  async reverseJournal(id: string): Promise<JournalEntry> {
    try {
      const response = await this.post<JournalEntry>(
        `${apiConfig.endpoints.accounting.journals}/${id}/reverse`,
        {},
      );
      return response.data;
    } catch {
      const entry = await this.getJournal(id);
      if (entry.status !== 'POSTED') throw new Error('Only posted journals can be reversed.');

      // Create counter entry
      const reversedLines = entry.lines.map((l) => ({
        accountId: l.accountId,
        accountCode: l.accountCode,
        accountName: l.accountName,
        description: `Reversal of ${entry.referenceNumber}: ${l.description || ''}`,
        debitAmount: l.creditAmount, // Swap debit/credit
        creditAmount: l.debitAmount,
      }));

      const newJournal = await this.createJournal({
        referenceNumber: `REV-${entry.referenceNumber}`,
        date: new Date().toISOString(),
        description: `Reversal entry for ${entry.referenceNumber}`,
        status: 'POSTED',
        notes: `Automatically generated to reverse Journal entry ID: ${entry.id}`,
        lines: reversedLines,
      });

      return newJournal;
    }
  }

  // ----------------------------------------------------
  // LEDGER & DOUBLE-ENTRY ENGINE
  // ----------------------------------------------------
  private updateAccountBalance(accountId: string, amount: number, actionType: 'DEBIT' | 'CREDIT') {
    const accounts = this.getMockAccounts();
    const idx = accounts.findIndex((a) => a.id === accountId || a.code === accountId);
    if (idx !== -1) {
      const acc = accounts[idx]!;
      const isDebitAcc = acc.type === 'ASSETS' || acc.type === 'EXPENSE';

      let delta = 0;
      if (actionType === 'DEBIT') {
        delta = isDebitAcc ? amount : -amount;
      } else {
        delta = isDebitAcc ? -amount : amount;
      }

      acc.balance += delta;
      accounts[idx] = acc;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  }

  private compileAllTransactions(): LedgerTransaction[] {
    const transactions: LedgerTransaction[] = [];

    // 1. Compile Posted Journals
    const journals = this.getMockJournals().filter((j) => j.status === 'POSTED');
    journals.forEach((j) => {
      j.lines.forEach((l) => {
        transactions.push({
          id: `${j.id}-${l.id}`,
          referenceNumber: j.referenceNumber,
          date: j.date,
          description: l.description || j.description,
          accountCode: l.accountCode,
          accountName: l.accountName,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
          balance: 0,
          runningBalance: 0,
          transactionType: 'JOURNAL',
        });
      });
    });

    // 2. Compile Income Transactions
    const incomes = this.getMockIncomes();
    incomes.forEach((inc) => {
      // Line A: Credit Income account
      transactions.push({
        id: `inc-cr-${inc.id}`,
        referenceNumber: inc.reference,
        date: inc.date,
        description: inc.notes || `Recorded Income: ${inc.accountName}`,
        accountCode: inc.accountCode,
        accountName: inc.accountName,
        debitAmount: 0,
        creditAmount: inc.amount,
        balance: 0,
        runningBalance: 0,
        transactionType: 'INCOME',
      });
      // Line B: Debit Cash/Bank Assets account
      const isCash = inc.paymentMethod === 'CASH';
      transactions.push({
        id: `inc-dr-${inc.id}`,
        referenceNumber: inc.reference,
        date: inc.date,
        description: inc.notes || `Cash/Bank deposit from Income`,
        accountCode: isCash ? '1110' : '1200',
        accountName: isCash ? 'Petty Cash Register' : 'Cash at Bank',
        debitAmount: inc.amount,
        creditAmount: 0,
        balance: 0,
        runningBalance: 0,
        transactionType: 'INCOME',
      });
    });

    // 3. Compile Expense Transactions
    const expenses = this.getMockExpenses();
    expenses.forEach((exp) => {
      // Line A: Debit Expense account
      transactions.push({
        id: `exp-dr-${exp.id}`,
        referenceNumber: exp.reference,
        date: exp.date,
        description: exp.notes || `Recorded Expense: ${exp.accountName}`,
        accountCode: exp.accountCode,
        accountName: exp.accountName,
        debitAmount: exp.amount,
        creditAmount: 0,
        balance: 0,
        runningBalance: 0,
        transactionType: 'EXPENSE',
      });
      // Line B: Credit Cash/Bank Assets account
      const isCash = exp.paymentMethod === 'CASH';
      transactions.push({
        id: `exp-cr-${exp.id}`,
        referenceNumber: exp.reference,
        date: exp.date,
        description: exp.notes || `Cash/Bank payout for Expense`,
        accountCode: isCash ? '1110' : '1200',
        accountName: isCash ? 'Petty Cash Register' : 'Cash at Bank',
        debitAmount: 0,
        creditAmount: exp.amount,
        balance: 0,
        runningBalance: 0,
        transactionType: 'EXPENSE',
      });
    });

    // 4. Compile Vouchers
    const vouchers = this.getMockVouchers();
    vouchers.forEach((v) => {
      if ('voucherNumber' in v) {
        // Payment Voucher (APPROVED only)
        if (v.approvalStatus !== 'APPROVED') return;
        // Debit: generic Expense account / Credit: cash/bank asset
        transactions.push({
          id: `pv-dr-${v.id}`,
          referenceNumber: v.voucherNumber,
          date: v.date,
          description: v.notes || `Voucher Payment to ${v.payee}`,
          accountCode: '5000',
          accountName: 'Expenses',
          debitAmount: v.amount,
          creditAmount: 0,
          balance: 0,
          runningBalance: 0,
          transactionType: 'VOUCHER',
        });

        const isCash = v.paymentMethod === 'CASH';
        transactions.push({
          id: `pv-cr-${v.id}`,
          referenceNumber: v.voucherNumber,
          date: v.date,
          description: v.notes || `Payment payout to ${v.payee}`,
          accountCode: isCash ? '1110' : '1200',
          accountName: isCash ? 'Petty Cash Register' : 'Cash at Bank',
          debitAmount: 0,
          creditAmount: v.amount,
          balance: 0,
          runningBalance: 0,
          transactionType: 'VOUCHER',
        });
      } else if ('receiptNumber' in v) {
        // Receipt Voucher (Inward)
        // Debit: cash/bank asset / Credit: generic Income account
        const isCash = v.paymentMethod === 'CASH';
        transactions.push({
          id: `rv-dr-${v.id}`,
          referenceNumber: v.receiptNumber,
          date: v.date,
          description: v.notes || `Voucher Receipt from ${v.receivedFrom}`,
          accountCode: isCash ? '1110' : '1200',
          accountName: isCash ? 'Petty Cash Register' : 'Cash at Bank',
          debitAmount: v.amount,
          creditAmount: 0,
          balance: 0,
          runningBalance: 0,
          transactionType: 'VOUCHER',
        });

        transactions.push({
          id: `rv-cr-${v.id}`,
          referenceNumber: v.receiptNumber,
          date: v.date,
          description: v.notes || `Receipt inflow from ${v.receivedFrom}`,
          accountCode: '4000',
          accountName: 'Revenue',
          debitAmount: 0,
          creditAmount: v.amount,
          balance: 0,
          runningBalance: 0,
          transactionType: 'VOUCHER',
        });
      }
    });

    // Sort chronologically ascending
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return transactions;
  }

  async getGeneralLedger(params?: {
    q?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<LedgerTransaction[]> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.ledger, params);
      return response.data;
    } catch {
      const allTx = this.compileAllTransactions();
      const accounts = this.getMockAccounts();

      let filtered = [...allTx];

      if (params?.startDate) {
        const start = new Date(params.startDate).getTime();
        filtered = filtered.filter((t) => new Date(t.date).getTime() >= start);
      }

      if (params?.endDate) {
        const end = new Date(params.endDate).getTime();
        filtered = filtered.filter((t) => new Date(t.date).getTime() <= end);
      }

      if (params?.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.accountName.toLowerCase().includes(query) ||
            t.accountCode.includes(query) ||
            t.referenceNumber.toLowerCase().includes(query),
        );
      }

      // Calculate running balances per account
      const accountRunning: Record<string, number> = {};
      accounts.forEach((a) => {
        accountRunning[a.code] = a.openingBalance;
      });

      filtered.forEach((t) => {
        const acc = accounts.find((a) => a.code === t.accountCode);
        const opening = accountRunning[t.accountCode] || 0;

        let delta = 0;
        if (acc) {
          const isDebitType = acc.type === 'ASSETS' || acc.type === 'EXPENSE';
          if (isDebitType) {
            delta = t.debitAmount - t.creditAmount;
          } else {
            delta = t.creditAmount - t.debitAmount;
          }
        } else {
          delta = t.debitAmount - t.creditAmount; // default
        }

        const newBal = opening + delta;
        t.balance = newBal;
        t.runningBalance = newBal;
        accountRunning[t.accountCode] = newBal;
      });

      return filtered;
    }
  }

  async getAccountLedger(
    accountId: string,
    params?: { startDate?: string; endDate?: string; type?: string },
  ): Promise<{
    transactions: LedgerTransaction[];
    summary: {
      openingBalance: number;
      totalDebit: number;
      totalCredit: number;
      closingBalance: number;
    };
  }> {
    try {
      const response = await this.get<any>(
        `${apiConfig.endpoints.accounting.ledger}/${accountId}`,
        params,
      );
      return response.data;
    } catch {
      const account = await this.getAccount(accountId);
      const allTx = this.compileAllTransactions();
      const code = account.code;

      let filtered = allTx.filter((t) => t.accountCode === code);

      if (params?.startDate) {
        const start = new Date(params.startDate).getTime();
        filtered = filtered.filter((t) => new Date(t.date).getTime() >= start);
      }

      if (params?.endDate) {
        const end = new Date(params.endDate).getTime();
        filtered = filtered.filter((t) => new Date(t.date).getTime() <= end);
      }

      if (params?.type && params.type !== 'ALL') {
        filtered = filtered.filter((t) => t.transactionType === params.type);
      }

      // Compute running balance chronologically
      let running = account.openingBalance;
      let totalDebit = 0;
      let totalCredit = 0;

      const isDebitType = account.type === 'ASSETS' || account.type === 'EXPENSE';

      filtered.forEach((t) => {
        totalDebit += t.debitAmount;
        totalCredit += t.creditAmount;

        let delta = 0;
        if (isDebitType) {
          delta = t.debitAmount - t.creditAmount;
        } else {
          delta = t.creditAmount - t.debitAmount;
        }
        running += delta;
        t.runningBalance = running;
      });

      return {
        transactions: filtered,
        summary: {
          openingBalance: account.openingBalance,
          totalDebit,
          totalCredit,
          closingBalance: running,
        },
      };
    }
  }

  // ----------------------------------------------------
  // INCOME MANAGEMENT METHODS
  // ----------------------------------------------------
  private getMockIncomes(): IncomeTransaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(INCOMES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultIncomes: IncomeTransaction[] = [
      {
        id: 'inc-1',
        accountId: 'acc-8',
        accountCode: '4000',
        accountName: 'Revenue',
        amount: 3500,
        paymentMethod: 'CASH',
        reference: 'POS-SALE-2026-9021',
        date: '2026-07-02T11:00:00.000Z',
        notes: 'End of day cash registers consolidation',
        createdAt: '2026-07-02T11:00:00.000Z',
      },
      {
        id: 'inc-2',
        accountId: 'acc-8',
        accountCode: '4000',
        accountName: 'Revenue',
        amount: 12000,
        paymentMethod: 'BANK',
        reference: 'B2B-INV-00921',
        date: '2026-07-08T15:20:00.000Z',
        notes: 'Corporate client bank invoice settlement',
        createdAt: '2026-07-08T15:20:00.000Z',
      },
    ];

    localStorage.setItem(INCOMES_KEY, JSON.stringify(defaultIncomes));
    return defaultIncomes;
  }

  async getIncomes(params?: {
    q?: string;
    categoryId?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<IncomeTransaction>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.income, params);
      return {
        data: response.data.incomes ?? [],
        meta: response.meta || {
          page: 1,
          pageSize: params?.limit || 15,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch {
      let items = this.getMockIncomes();

      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (i) =>
            i.reference.toLowerCase().includes(query) ||
            (i.notes && i.notes.toLowerCase().includes(query)),
        );
      }

      if (params?.categoryId && params.categoryId !== 'ALL') {
        items = items.filter((i) => i.accountId === params.categoryId);
      }

      if (params?.paymentMethod && params.paymentMethod !== 'ALL') {
        items = items.filter((i) => i.paymentMethod === params.paymentMethod);
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 15;
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = items.slice((page - 1) * limit, page * limit);

      return {
        data: paginated,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  }

  async createIncome(payload: any): Promise<IncomeTransaction> {
    try {
      const response = await this.post<IncomeTransaction>(
        apiConfig.endpoints.accounting.income,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockIncomes();
      const accounts = this.getMockAccounts();
      const cat = accounts.find((a) => a.id === payload.accountId);

      const newIncome: IncomeTransaction = {
        id: `inc-${Date.now()}`,
        accountId: payload.accountId,
        accountCode: cat?.code || '4000',
        accountName: cat?.name || 'Revenue',
        amount: Number(payload.amount),
        paymentMethod: payload.paymentMethod || 'CASH',
        reference: payload.reference || `INC-${Date.now()}`,
        date: payload.date || new Date().toISOString(),
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
      };

      items.push(newIncome);
      localStorage.setItem(INCOMES_KEY, JSON.stringify(items));

      // Update balances double-entry style
      // Credit selected income category account
      this.updateAccountBalance(payload.accountId, newIncome.amount, 'CREDIT');
      // Debit Asset (Petty Cash: acc-3/1110, or Bank: acc-4/1200)
      const assetAccId = newIncome.paymentMethod === 'CASH' ? 'acc-3' : 'acc-4';
      this.updateAccountBalance(assetAccId, newIncome.amount, 'DEBIT');

      return newIncome;
    }
  }

  // ----------------------------------------------------
  // EXPENSE MANAGEMENT METHODS
  // ----------------------------------------------------
  private getMockExpenses(): ExpenseTransaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(EXPENSES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultExpenses: ExpenseTransaction[] = [
      {
        id: 'exp-1',
        accountId: 'acc-9',
        accountCode: '5000',
        accountName: 'Expenses',
        amount: 850,
        paymentMethod: 'CASH',
        reference: 'EXP-90021-STAT',
        date: '2026-07-03T10:00:00.000Z',
        notes: 'Office stationeries and cleaning detergents',
        createdAt: '2026-07-03T10:00:00.000Z',
      },
      {
        id: 'exp-2',
        accountId: 'acc-9',
        accountCode: '5000',
        accountName: 'Expenses',
        amount: 4500,
        paymentMethod: 'BANK',
        reference: 'EXP-90022-ELEC',
        date: '2026-07-07T16:45:00.000Z',
        notes: 'Warehouse monthly electric utilities',
        createdAt: '2026-07-07T16:45:00.000Z',
      },
    ];

    localStorage.setItem(EXPENSES_KEY, JSON.stringify(defaultExpenses));
    return defaultExpenses;
  }

  async getExpenses(params?: {
    q?: string;
    categoryId?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ExpenseTransaction>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.expenses, params);
      return {
        data: response.data.expenses ?? [],
        meta: response.meta || {
          page: 1,
          pageSize: params?.limit || 15,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch {
      let items = this.getMockExpenses();

      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (e) =>
            e.reference.toLowerCase().includes(query) ||
            (e.notes && e.notes.toLowerCase().includes(query)),
        );
      }

      if (params?.categoryId && params.categoryId !== 'ALL') {
        items = items.filter((e) => e.accountId === params.categoryId);
      }

      if (params?.paymentMethod && params.paymentMethod !== 'ALL') {
        items = items.filter((e) => e.paymentMethod === params.paymentMethod);
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 15;
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = items.slice((page - 1) * limit, page * limit);

      return {
        data: paginated,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  }

  async createExpense(payload: any): Promise<ExpenseTransaction> {
    try {
      const response = await this.post<ExpenseTransaction>(
        apiConfig.endpoints.accounting.expenses,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockExpenses();
      const accounts = this.getMockAccounts();
      const cat = accounts.find((a) => a.id === payload.accountId);

      const newExpense: ExpenseTransaction = {
        id: `exp-${Date.now()}`,
        accountId: payload.accountId,
        accountCode: cat?.code || '5000',
        accountName: cat?.name || 'Expenses',
        amount: Number(payload.amount),
        paymentMethod: payload.paymentMethod || 'CASH',
        reference: payload.reference || `EXP-${Date.now()}`,
        date: payload.date || new Date().toISOString(),
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
      };

      items.push(newExpense);
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(items));

      // Update balances double-entry style
      // Debit selected expense category account
      this.updateAccountBalance(payload.accountId, newExpense.amount, 'DEBIT');
      // Credit Asset (Petty Cash: acc-3/1110, or Bank: acc-4/1200)
      const assetAccId = newExpense.paymentMethod === 'CASH' ? 'acc-3' : 'acc-4';
      this.updateAccountBalance(assetAccId, newExpense.amount, 'CREDIT');

      return newExpense;
    }
  }

  // ----------------------------------------------------
  // CASH BOOK METHODS
  // ----------------------------------------------------
  async getCashBook(params?: { startDate?: string; endDate?: string }): Promise<{
    transactions: CashTransaction[];
    summary: {
      openingBalance: number;
      totalCashIn: number;
      totalCashOut: number;
      currentBalance: number;
    };
  }> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.cash, params);
      return response.data;
    } catch {
      const allTx = this.compileAllTransactions();
      const cashAccount = await this.getAccount('acc-3'); // 1110 Petty Cash

      // Filter transactions matching Petty Cash code
      let cashTx = allTx.filter((t) => t.accountCode === '1110');

      if (params?.startDate) {
        const start = new Date(params.startDate).getTime();
        cashTx = cashTx.filter((t) => new Date(t.date).getTime() >= start);
      }

      if (params?.endDate) {
        const end = new Date(params.endDate).getTime();
        cashTx = cashTx.filter((t) => new Date(t.date).getTime() <= end);
      }

      let running = cashAccount.openingBalance;
      let totalCashIn = 0;
      let totalCashOut = 0;

      const results: CashTransaction[] = cashTx.map((t) => {
        // Petty cash is Asset (Debit increases, Credit decreases)
        const cashIn = t.debitAmount;
        const cashOut = t.creditAmount;

        totalCashIn += cashIn;
        totalCashOut += cashOut;
        running += cashIn - cashOut;

        return {
          id: t.id,
          date: t.date,
          description: t.description,
          reference: t.referenceNumber,
          cashIn,
          cashOut,
          runningBalance: running,
          createdAt: t.date,
        };
      });

      // Reverse order to show latest first in transactions log
      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        transactions: results,
        summary: {
          openingBalance: cashAccount.openingBalance,
          totalCashIn,
          totalCashOut,
          currentBalance: running,
        },
      };
    }
  }

  // ----------------------------------------------------
  // BANK BOOK METHODS
  // ----------------------------------------------------
  async getBankBook(params?: { startDate?: string; endDate?: string }): Promise<{
    transactions: BankTransaction[];
    summary: {
      openingBalance: number;
      totalDeposits: number;
      totalWithdrawals: number;
      currentBalance: number;
    };
  }> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.bank, params);
      return response.data;
    } catch {
      const allTx = this.compileAllTransactions();
      const bankAccount = await this.getAccount('acc-4'); // 1200 Cash at Bank

      let bankTx = allTx.filter((t) => t.accountCode === '1200');

      if (params?.startDate) {
        const start = new Date(params.startDate).getTime();
        bankTx = bankTx.filter((t) => new Date(t.date).getTime() >= start);
      }

      if (params?.endDate) {
        const end = new Date(params.endDate).getTime();
        bankTx = bankTx.filter((t) => new Date(t.date).getTime() <= end);
      }

      let running = bankAccount.openingBalance;
      let totalDeposits = 0;
      let totalWithdrawals = 0;

      const results: BankTransaction[] = bankTx.map((t) => {
        const deposits = t.debitAmount;
        const withdrawals = t.creditAmount;

        totalDeposits += deposits;
        totalWithdrawals += withdrawals;
        running += deposits - withdrawals;

        return {
          id: t.id,
          date: t.date,
          description: t.description,
          reference: t.referenceNumber,
          deposits,
          withdrawals,
          runningBalance: running,
          createdAt: t.date,
        };
      });

      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        transactions: results,
        summary: {
          openingBalance: bankAccount.openingBalance,
          totalDeposits,
          totalWithdrawals,
          currentBalance: running,
        },
      };
    }
  }

  // ----------------------------------------------------
  // VOUCHER METHODS
  // ----------------------------------------------------
  private getMockVouchers(): (PaymentVoucher | ReceiptVoucher)[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(VOUCHERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultVouchers: (PaymentVoucher | ReceiptVoucher)[] = [
      {
        id: 'v-1',
        voucherNumber: 'PV-2026-0001',
        payee: 'Apex Wholesale Suppliers',
        amount: 15000,
        paymentMethod: 'BANK',
        reference: 'SUP-INV-891',
        date: '2026-07-04T09:00:00.000Z',
        approvalStatus: 'APPROVED',
        notes: 'Settlement for invoice #SUP-INV-891 inventory deliveries.',
        createdAt: '2026-07-04T09:00:00.000Z',
      },
      {
        id: 'v-2',
        receiptNumber: 'RV-2026-0001',
        receivedFrom: 'Global Retailers Ltd',
        amount: 8500,
        paymentMethod: 'BANK',
        reference: 'ADV-SALES-21',
        date: '2026-07-06T14:15:00.000Z',
        notes: 'Advance booking float deposit for custom bulk orders.',
        createdAt: '2026-07-06T14:15:00.000Z',
      },
      {
        id: 'v-3',
        voucherNumber: 'PV-2026-0002',
        payee: 'City Rent Estates',
        amount: 2500,
        paymentMethod: 'CASH',
        reference: 'RENT-JULY',
        date: '2026-07-10T11:00:00.000Z',
        approvalStatus: 'DRAFT',
        notes: 'Monthly retail outlet rental fee.',
        createdAt: '2026-07-10T11:00:00.000Z',
      },
    ];

    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(defaultVouchers));
    return defaultVouchers;
  }

  async getVouchers(params?: {
    q?: string;
    type?: 'PAYMENT' | 'RECEIPT';
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PaymentVoucher | ReceiptVoucher>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.accounting.vouchers, params);
      return {
        data: response.data.vouchers ?? [],
        meta: response.meta || {
          page: 1,
          pageSize: params?.limit || 15,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch {
      const items = this.getMockVouchers();
      let filtered = [...items];

      if (params?.type) {
        if (params.type === 'PAYMENT') {
          filtered = filtered.filter((v) => 'voucherNumber' in v);
        } else {
          filtered = filtered.filter((v) => 'receiptNumber' in v);
        }
      }

      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter((v) => {
          if ('approvalStatus' in v) {
            return v.approvalStatus === params.status;
          }
          return true; // Receipts do not have approval status in the simplified checklist
        });
      }

      if (params?.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter((v) => {
          if ('voucherNumber' in v) {
            return (
              v.voucherNumber.toLowerCase().includes(query) ||
              v.payee.toLowerCase().includes(query) ||
              v.reference.toLowerCase().includes(query)
            );
          } else {
            return (
              v.receiptNumber.toLowerCase().includes(query) ||
              v.receivedFrom.toLowerCase().includes(query) ||
              v.reference.toLowerCase().includes(query)
            );
          }
        });
      }

      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 15;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = filtered.slice((page - 1) * limit, page * limit);

      return {
        data: paginated,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  }

  async createPaymentVoucher(payload: any): Promise<PaymentVoucher> {
    try {
      const response = await this.post<PaymentVoucher>(
        `${apiConfig.endpoints.accounting.vouchers}/payment`,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockVouchers();
      const newVoucher: PaymentVoucher = {
        id: `pv-${Date.now()}`,
        voucherNumber:
          payload.voucherNumber || `PV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        payee: payload.payee,
        amount: Number(payload.amount),
        paymentMethod: payload.paymentMethod || 'CASH',
        reference: payload.reference || `REF-${Date.now()}`,
        date: payload.date || new Date().toISOString(),
        approvalStatus: payload.approvalStatus || 'DRAFT',
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
      };

      items.push(newVoucher);
      localStorage.setItem(VOUCHERS_KEY, JSON.stringify(items));

      if (newVoucher.approvalStatus === 'APPROVED') {
        // Automatically deduct asset balance
        const assetAccId = newVoucher.paymentMethod === 'CASH' ? 'acc-3' : 'acc-4';
        this.updateAccountBalance(assetAccId, newVoucher.amount, 'CREDIT');
        // Increase Expense balance
        this.updateAccountBalance('acc-9', newVoucher.amount, 'DEBIT');
      }

      return newVoucher;
    }
  }

  async createReceiptVoucher(payload: any): Promise<ReceiptVoucher> {
    try {
      const response = await this.post<ReceiptVoucher>(
        `${apiConfig.endpoints.accounting.vouchers}/receipt`,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockVouchers();
      const newVoucher: ReceiptVoucher = {
        id: `rv-${Date.now()}`,
        receiptNumber:
          payload.receiptNumber || `RV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        receivedFrom: payload.receivedFrom,
        amount: Number(payload.amount),
        paymentMethod: payload.paymentMethod || 'CASH',
        reference: payload.reference || `REF-${Date.now()}`,
        date: payload.date || new Date().toISOString(),
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
      };

      items.push(newVoucher);
      localStorage.setItem(VOUCHERS_KEY, JSON.stringify(items));

      // Receipt vouchers are automatically posting inflows
      const assetAccId = newVoucher.paymentMethod === 'CASH' ? 'acc-3' : 'acc-4';
      this.updateAccountBalance(assetAccId, newVoucher.amount, 'DEBIT');
      // Increase Income account
      this.updateAccountBalance('acc-8', newVoucher.amount, 'CREDIT');

      return newVoucher;
    }
  }

  async approveVoucher(id: string): Promise<PaymentVoucher> {
    try {
      const response = await this.post<PaymentVoucher>(
        `${apiConfig.endpoints.accounting.vouchers}/${id}/approve`,
        {},
      );
      return response.data;
    } catch {
      const items = this.getMockVouchers();
      const idx = items.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error('Voucher not found.');

      const v = items[idx]! as PaymentVoucher;
      if (v.approvalStatus === 'APPROVED') return v;

      v.approvalStatus = 'APPROVED';
      items[idx] = v;
      localStorage.setItem(VOUCHERS_KEY, JSON.stringify(items));

      // Payout ledger deducts asset and increases expense
      const assetAccId = v.paymentMethod === 'CASH' ? 'acc-3' : 'acc-4';
      this.updateAccountBalance(assetAccId, v.amount, 'CREDIT');
      this.updateAccountBalance('acc-9', v.amount, 'DEBIT');

      return v;
    }
  }

  async cancelVoucher(id: string): Promise<PaymentVoucher> {
    try {
      const response = await this.post<PaymentVoucher>(
        `${apiConfig.endpoints.accounting.vouchers}/${id}/cancel`,
        {},
      );
      return response.data;
    } catch {
      const items = this.getMockVouchers();
      const idx = items.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error('Voucher not found.');

      const v = items[idx]! as PaymentVoucher;
      v.approvalStatus = 'CANCELLED';
      items[idx] = v;
      localStorage.setItem(VOUCHERS_KEY, JSON.stringify(items));
      return v;
    }
  }

  // ----------------------------------------------------
  // FINANCIAL STATEMENTS & TAX METHODS (Phase F9.3)
  // ----------------------------------------------------
  private getMockTaxRates(): TaxRate[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TAX_RATES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    const defaultRates: TaxRate[] = [
      {
        id: 'tr-1',
        name: 'Standard VAT (15%)',
        rate: 15,
        type: 'VAT',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tr-2',
        name: 'Zero-Rated GST (0%)',
        rate: 0,
        type: 'GST',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tr-3',
        name: 'Sales Tax (8%)',
        rate: 8,
        type: 'SALES',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tr-4',
        name: 'Purchase Tax (5%)',
        rate: 5,
        type: 'PURCHASE',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(TAX_RATES_KEY, JSON.stringify(defaultRates));
    return defaultRates;
  }

  private getMockTaxGroups(): TaxGroup[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TAX_GROUPS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    const defaultGroups: TaxGroup[] = [
      {
        id: 'tg-1',
        name: 'Standard VAT Group',
        rates: ['tr-1'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tg-2',
        name: 'Combined State & Federal',
        rates: ['tr-3', 'tr-4'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(TAX_GROUPS_KEY, JSON.stringify(defaultGroups));
    return defaultGroups;
  }

  private getMockTaxTransactions(): TaxTransaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TAX_TRANSACTIONS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    const defaultTx: TaxTransaction[] = [
      {
        id: 'tt-1',
        date: '2026-07-01T10:00:00Z',
        reference: 'INV-2026-001',
        type: 'SALES',
        amount: 5000,
        taxAmount: 750,
        taxRate: 15,
        taxRateName: 'Standard VAT (15%)',
      },
      {
        id: 'tt-2',
        date: '2026-07-03T11:30:00Z',
        reference: 'BILL-2026-002',
        type: 'PURCHASE',
        amount: 2000,
        taxAmount: 100,
        taxRate: 5,
        taxRateName: 'Purchase Tax (5%)',
      },
      {
        id: 'tt-3',
        date: '2026-07-05T14:15:00Z',
        reference: 'INV-2026-002',
        type: 'SALES',
        amount: 1500,
        taxAmount: 120,
        taxRate: 8,
        taxRateName: 'Sales Tax (8%)',
      },
      {
        id: 'tt-4',
        date: '2026-07-07T16:45:00Z',
        reference: 'BILL-2026-004',
        type: 'PURCHASE',
        amount: 1200,
        taxAmount: 60,
        taxRate: 5,
        taxRateName: 'Purchase Tax (5%)',
      },
    ];
    localStorage.setItem(TAX_TRANSACTIONS_KEY, JSON.stringify(defaultTx));
    return defaultTx;
  }

  private getMockFiscalYears(): FiscalYear[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(FISCAL_YEARS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    const defaultYears: FiscalYear[] = [
      {
        id: 'fy-2026',
        year: 2026,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'OPEN',
        periods: [
          {
            id: 'p-1',
            name: 'Q1 - Jan-Mar',
            startDate: '2026-01-01',
            endDate: '2026-03-31',
            status: 'CLOSED',
          },
          {
            id: 'p-2',
            name: 'Q2 - Apr-Jun',
            startDate: '2026-04-01',
            endDate: '2026-06-30',
            status: 'CLOSED',
          },
          {
            id: 'p-3',
            name: 'July 2026',
            startDate: '2026-07-01',
            endDate: '2026-07-31',
            status: 'OPEN',
          },
          {
            id: 'p-4',
            name: 'August 2026',
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            status: 'OPEN',
          },
          {
            id: 'p-5',
            name: 'September 2026',
            startDate: '2026-09-01',
            endDate: '2026-09-31',
            status: 'OPEN',
          },
          {
            id: 'p-6',
            name: 'Q4 - Oct-Dec',
            startDate: '2026-10-01',
            endDate: '2026-12-31',
            status: 'OPEN',
          },
        ],
      },
    ];
    localStorage.setItem(FISCAL_YEARS_KEY, JSON.stringify(defaultYears));
    return defaultYears;
  }

  private getMockClosingChecklist(periodId: string): ClosingChecklistItem[] {
    if (typeof window === 'undefined') return [];
    const key = `${CLOSING_CHECKLIST_KEY}_${periodId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    const defaultChecklist: ClosingChecklistItem[] = [
      {
        id: 'cc-1',
        task: 'Reconcile Cash Registers',
        description: 'Count physical petty cash float and match against cash book balance.',
        checked: true,
        checkedBy: 'Akram Hossain',
        checkedAt: new Date().toISOString(),
      },
      {
        id: 'cc-2',
        task: 'Reconcile Bank Accounts',
        description: 'Import bank statement feed and check off outstanding deposits/checks.',
        checked: false,
      },
      {
        id: 'cc-3',
        task: 'Verify Accounts Receivable',
        description: 'Review outstanding customer invoices and confirm matching payments.',
        checked: false,
      },
      {
        id: 'cc-4',
        task: 'Verify Accounts Payable',
        description: 'Review supplier unpaid invoices and verify voucher matching.',
        checked: false,
      },
      {
        id: 'cc-5',
        task: 'Approve Pending Journal Entries',
        description: 'Ensure all adjustment journals in DRAFT state are posted or voided.',
        checked: true,
        checkedBy: 'Akram Hossain',
        checkedAt: new Date().toISOString(),
      },
      {
        id: 'cc-6',
        task: 'Verify Trial Balance Equals Zero',
        description: 'Perform double-entry ledger balance check.',
        checked: false,
      },
    ];
    localStorage.setItem(key, JSON.stringify(defaultChecklist));
    return defaultChecklist;
  }

  private getMockAuditLogs(): AccountingAuditLog[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    const defaultLogs: AccountingAuditLog[] = [
      {
        id: 'al-1',
        userId: 'usr-1',
        userName: 'Akram Hossain',
        action: 'CREATE_JOURNAL',
        module: 'JOURNAL',
        description: 'Created journal entry JV-2026-0041 for inventory adjustment.',
        timestamp: '2026-07-16T10:15:00Z',
        ipAddress: '192.168.1.55',
      },
      {
        id: 'al-2',
        userId: 'usr-1',
        userName: 'Akram Hossain',
        action: 'POST_JOURNAL',
        module: 'JOURNAL',
        description: 'Posted journal entry JV-2026-0041 to account ledger.',
        timestamp: '2026-07-16T10:20:00Z',
        ipAddress: '192.168.1.55',
      },
      {
        id: 'al-3',
        userId: 'usr-2',
        userName: 'S. Cashier',
        action: 'RECORD_INCOME',
        module: 'INCOME',
        description: 'Logged cash sales receipt of $150.00 from POS Terminal.',
        timestamp: '2026-07-16T12:45:00Z',
        ipAddress: '192.168.1.100',
      },
      {
        id: 'al-4',
        userId: 'usr-1',
        userName: 'Akram Hossain',
        action: 'APPROVE_VOUCHER',
        module: 'VOUCHER',
        description: 'Approved Payment Voucher PV-2026-8941 for vendor payout.',
        timestamp: '2026-07-16T14:30:00Z',
        ipAddress: '192.168.1.55',
      },
    ];
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(defaultLogs));
    return defaultLogs;
  }

  async logAuditEvent(action: string, module: string, description: string): Promise<void> {
    const logs = this.getMockAuditLogs();
    const newLog: AccountingAuditLog = {
      id: `al-${Date.now()}`,
      userId: 'usr-1',
      userName: 'Akram Hossain',
      action,
      module,
      description,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  }

  async getProfitLoss(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ProfitLossStatement> {
    try {
      const response = await this.get<ProfitLossStatement>(
        `${apiConfig.endpoints.accounting.statements}/profit-loss`,
        params,
      );
      return response.data;
    } catch {
      const accounts = this.getMockAccounts();
      const revenue = accounts
        .filter((a) => a.type === 'INCOME')
        .map((a) => ({ code: a.code, name: a.name, balance: a.balance }));

      const expenseList = accounts.filter((a) => a.type === 'EXPENSE');

      const cogsAccs = expenseList.filter(
        (a) =>
          a.code.startsWith('50') ||
          a.name.toLowerCase().includes('cogs') ||
          a.name.toLowerCase().includes('cost of goods'),
      );
      const cogs = cogsAccs.map((a) => ({ code: a.code, name: a.name, balance: a.balance }));

      const expenses = expenseList
        .filter((a) => !cogsAccs.some((c) => c.id === a.id))
        .map((a) => ({ code: a.code, name: a.name, balance: a.balance }));

      const totalRevenue = revenue.reduce((sum, r) => sum + r.balance, 0);
      const totalCOGS = cogs.reduce((sum, c) => sum + c.balance, 0);
      const grossProfit = totalRevenue - totalCOGS;
      const totalExpenses = expenses.reduce((sum, e) => sum + e.balance, 0);
      const operatingProfit = grossProfit - totalExpenses;
      const netProfit = operatingProfit;

      return {
        revenue,
        cogs,
        grossProfit,
        expenses,
        operatingProfit,
        netProfit,
      };
    }
  }

  async getBalanceSheet(params?: { date?: string }): Promise<BalanceSheet> {
    try {
      const response = await this.get<BalanceSheet>(
        `${apiConfig.endpoints.accounting.statements}/balance-sheet`,
        params,
      );
      return response.data;
    } catch {
      const accounts = this.getMockAccounts();
      const assets = accounts
        .filter((a) => a.type === 'ASSETS')
        .map((a) => ({ code: a.code, name: a.name, balance: a.balance }));
      const liabilities = accounts
        .filter((a) => a.type === 'LIABILITIES')
        .map((a) => ({ code: a.code, name: a.name, balance: a.balance }));
      const equity = accounts
        .filter((a) => a.type === 'EQUITY')
        .map((a) => ({ code: a.code, name: a.name, balance: a.balance }));

      const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
      const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
      const totalEquity = equity.reduce((sum, e) => sum + e.balance, 0);

      return {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
      };
    }
  }

  async getCashFlow(params?: { startDate?: string; endDate?: string }): Promise<CashFlowStatement> {
    try {
      const response = await this.get<CashFlowStatement>(
        `${apiConfig.endpoints.accounting.statements}/cash-flow`,
        params,
      );
      return response.data;
    } catch {
      const operating = [
        { name: 'Operating Net Profit', balance: 12500 },
        { name: 'Accounts Receivable Adjustment', balance: -1500 },
        { name: 'Accounts Payable Adjustment', balance: 2200 },
        { name: 'Inventory Asset Valuation Offset', balance: -3000 },
      ];
      const investing = [
        { name: 'Purchase of POS Terminal hardware', balance: -1800 },
        { name: 'Warehouse Equipment Setup', balance: -2500 },
      ];
      const financing = [
        { name: 'Owner Equity Capital Cash Deposit', balance: 10000 },
        { name: 'Payment of Long-term Loan Debt', balance: -2000 },
      ];

      const opTotal = operating.reduce((sum, o) => sum + o.balance, 0);
      const invTotal = investing.reduce((sum, i) => sum + i.balance, 0);
      const finTotal = financing.reduce((sum, f) => sum + f.balance, 0);
      const netCashFlow = opTotal + invTotal + finTotal;

      return {
        operating,
        investing,
        financing,
        netCashFlow,
      };
    }
  }

  async getTrialBalance(): Promise<TrialBalance> {
    try {
      const response = await this.get<TrialBalance>(
        `${apiConfig.endpoints.accounting.statements}/trial-balance`,
      );
      return response.data;
    } catch {
      const accounts = this.getMockAccounts();
      const items = accounts.map((a) => {
        const isDebitAccount = a.type === 'ASSETS' || a.type === 'EXPENSE';
        return {
          accountId: a.id,
          code: a.code,
          name: a.name,
          debit: isDebitAccount ? a.balance : 0,
          credit: !isDebitAccount ? a.balance : 0,
        };
      });

      const totalDebit = items.reduce((sum, i) => sum + i.debit, 0);
      const totalCredit = items.reduce((sum, i) => sum + i.credit, 0);
      const difference = Math.abs(totalDebit - totalCredit);

      return {
        items,
        totalDebit,
        totalCredit,
        difference,
      };
    }
  }

  async getTaxRates(): Promise<TaxRate[]> {
    try {
      const response = await this.get<TaxRate[]>(`${apiConfig.endpoints.accounting.tax}/rates`);
      return response.data;
    } catch {
      return this.getMockTaxRates();
    }
  }

  async createTaxRate(payload: any): Promise<TaxRate> {
    try {
      const response = await this.post<TaxRate>(
        `${apiConfig.endpoints.accounting.tax}/rates`,
        payload,
      );
      return response.data;
    } catch {
      const rates = this.getMockTaxRates();
      const newRate: TaxRate = {
        id: `tr-${Date.now()}`,
        name: payload.name,
        rate: Number(payload.rate),
        type: payload.type || 'VAT',
        notes: payload.notes || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      rates.push(newRate);
      localStorage.setItem(TAX_RATES_KEY, JSON.stringify(rates));
      void this.logAuditEvent(
        'CREATE_TAX_RATE',
        'TAX',
        `Created tax rate: ${newRate.name} (${newRate.rate}%)`,
      );
      return newRate;
    }
  }

  async getTaxGroups(): Promise<TaxGroup[]> {
    try {
      const response = await this.get<TaxGroup[]>(`${apiConfig.endpoints.accounting.tax}/groups`);
      return response.data;
    } catch {
      return this.getMockTaxGroups();
    }
  }

  async getTaxReport(params?: { startDate?: string; endDate?: string }): Promise<TaxReport> {
    try {
      const response = await this.get<TaxReport>(
        `${apiConfig.endpoints.accounting.tax}/report`,
        params,
      );
      return response.data;
    } catch {
      const txs = this.getMockTaxTransactions();
      const totalSalesTax = txs
        .filter((t) => t.type === 'SALES')
        .reduce((sum, t) => sum + t.taxAmount, 0);
      const totalPurchaseTax = txs
        .filter((t) => t.type === 'PURCHASE')
        .reduce((sum, t) => sum + t.taxAmount, 0);
      const netLiability = totalSalesTax - totalPurchaseTax;

      return {
        transactions: txs,
        totalSalesTax,
        totalPurchaseTax,
        netLiability,
      };
    }
  }

  async getFiscalYears(): Promise<FiscalYear[]> {
    try {
      const response = await this.get<FiscalYear[]>(
        `${apiConfig.endpoints.accounting.periods}/years`,
      );
      return response.data;
    } catch {
      return this.getMockFiscalYears();
    }
  }

  async createFiscalYear(payload: any): Promise<FiscalYear> {
    try {
      const response = await this.post<FiscalYear>(
        `${apiConfig.endpoints.accounting.periods}/years`,
        payload,
      );
      return response.data;
    } catch {
      const years = this.getMockFiscalYears();
      const yearInt = Number(payload.year) || 2026;
      const newYear: FiscalYear = {
        id: `fy-${yearInt}`,
        year: yearInt,
        startDate: `${yearInt}-01-01`,
        endDate: `${yearInt}-12-31`,
        status: 'OPEN',
        periods: [
          {
            id: `p-${yearInt}-1`,
            name: 'Q1 - Jan-Mar',
            startDate: `${yearInt}-01-01`,
            endDate: `${yearInt}-03-31`,
            status: 'OPEN',
          },
          {
            id: `p-${yearInt}-2`,
            name: 'Q2 - Apr-Jun',
            startDate: `${yearInt}-04-01`,
            endDate: `${yearInt}-06-30`,
            status: 'OPEN',
          },
          {
            id: `p-${yearInt}-3`,
            name: 'Q3 - Jul-Sep',
            startDate: `${yearInt}-07-01`,
            endDate: `${yearInt}-09-30`,
            status: 'OPEN',
          },
          {
            id: `p-${yearInt}-4`,
            name: 'Q4 - Oct-Dec',
            startDate: `${yearInt}-10-01`,
            endDate: `${yearInt}-12-31`,
            status: 'OPEN',
          },
        ],
      };
      years.push(newYear);
      localStorage.setItem(FISCAL_YEARS_KEY, JSON.stringify(years));
      void this.logAuditEvent('CREATE_FISCAL_YEAR', 'PERIOD', `Opened fiscal year ${yearInt}`);
      return newYear;
    }
  }

  async togglePeriodStatus(
    yearId: string,
    periodId: string,
    status: 'OPEN' | 'CLOSED' | 'LOCKED',
  ): Promise<AccountingPeriod> {
    try {
      const response = await this.post<AccountingPeriod>(
        `${apiConfig.endpoints.accounting.periods}/years/${yearId}/periods/${periodId}/status`,
        { status },
      );
      return response.data;
    } catch {
      const years = this.getMockFiscalYears();
      const yearIdx = years.findIndex((y) => y.id === yearId);
      if (yearIdx === -1) throw new Error('Fiscal year not found.');

      const pIdx = years[yearIdx]!.periods.findIndex((p) => p.id === periodId);
      if (pIdx === -1) throw new Error('Period not found.');

      years[yearIdx]!.periods[pIdx]!.status = status;
      localStorage.setItem(FISCAL_YEARS_KEY, JSON.stringify(years));

      void this.logAuditEvent(
        'TOGGLE_PERIOD_STATUS',
        'PERIOD',
        `Toggled period ${years[yearIdx]!.periods[pIdx]!.name} to status: ${status}`,
      );

      return years[yearIdx]!.periods[pIdx]!;
    }
  }

  async getClosingChecklist(periodId: string): Promise<ClosingChecklistItem[]> {
    try {
      const response = await this.get<ClosingChecklistItem[]>(
        `${apiConfig.endpoints.accounting.closing}/checklist`,
        { periodId },
      );
      return response.data;
    } catch {
      return this.getMockClosingChecklist(periodId);
    }
  }

  async toggleChecklistItem(periodId: string, itemId: string): Promise<ClosingChecklistItem> {
    try {
      const response = await this.post<ClosingChecklistItem>(
        `${apiConfig.endpoints.accounting.closing}/checklist/${itemId}/toggle`,
        { periodId },
      );
      return response.data;
    } catch {
      const items = this.getMockClosingChecklist(periodId);
      const idx = items.findIndex((i) => i.id === itemId);
      if (idx === -1) throw new Error('Checklist item not found.');

      items[idx]!.checked = !items[idx]!.checked;
      items[idx]!.checkedBy = items[idx]!.checked ? 'Akram Hossain' : undefined;
      items[idx]!.checkedAt = items[idx]!.checked ? new Date().toISOString() : undefined;

      const key = `${CLOSING_CHECKLIST_KEY}_${periodId}`;
      localStorage.setItem(key, JSON.stringify(items));

      void this.logAuditEvent(
        'TOGGLE_CHECKLIST_ITEM',
        'CLOSING',
        `Checklist item: "${items[idx]!.task}" updated in closing board.`,
      );

      return items[idx]!;
    }
  }

  async performClosing(periodId: string): Promise<void> {
    try {
      await this.post(`${apiConfig.endpoints.accounting.closing}/close`, { periodId });
    } catch {
      void this.logAuditEvent(
        'CLOSE_PERIOD',
        'CLOSING',
        `Executed fiscal period close settlement for period ID ${periodId}`,
      );
    }
  }

  async getAuditTrail(params?: {
    q?: string;
    module?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AccountingAuditLog>> {
    try {
      const response = await this.get<PaginatedResponse<AccountingAuditLog>>(
        `${apiConfig.endpoints.accounting.audit}/trail`,
        params,
      );
      return response.data;
    } catch {
      let filtered = this.getMockAuditLogs();
      if (params?.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.userName.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q),
        );
      }
      if (params?.module && params.module !== 'ALL') {
        filtered = filtered.filter((l) => l.module === params.module);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 15;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = filtered.slice((page - 1) * limit, page * limit);

      return {
        data: paginated,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  }
}

export const accountingService = new AccountingService();
