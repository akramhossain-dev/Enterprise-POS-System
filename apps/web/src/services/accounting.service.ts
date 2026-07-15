import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  ChartAccount,
  AccountGroup,
  AccountCategory,
  AccountingDashboardStats,
} from '@/types/accounting';

const ACCOUNTS_KEY = 'epos_simulated_chart_accounts';
const GROUPS_KEY = 'epos_simulated_account_groups';
const CATEGORIES_KEY = 'epos_simulated_account_categories';
const DASHBOARD_KEY = 'epos_simulated_accounting_dashboard';

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
}

export const accountingService = new AccountingService();
