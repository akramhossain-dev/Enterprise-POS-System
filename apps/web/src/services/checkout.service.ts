import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { CheckoutTransaction } from '@/types/checkout';

const STORAGE_KEY = 'epos_simulated_checkout_transactions';

class CheckoutService extends ApiClient {
  private getMockTransactions(): CheckoutTransaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    // Default mock transactions
    const defaultTx: CheckoutTransaction[] = [
      {
        id: 'tx-1',
        invoiceNumber: 'INV-2026-07-0001',
        cartName: 'Cart 1',
        customerId: 'walk-in',
        customerName: 'Walk-in Customer',
        itemsCount: 3,
        subtotal: 150,
        discount: 10,
        discountType: 'FIXED',
        tax: 14,
        grandTotal: 154,
        payments: [{ method: 'CASH', amount: 154 }],
        paymentStatus: 'PAID',
        changeAmount: 0,
        cashierName: 'Cashier Admin',
        completedAt: '2026-07-15T12:00:00.000Z',
      },
      {
        id: 'tx-2',
        invoiceNumber: 'INV-2026-07-0002',
        cartName: 'Cart 2',
        customerId: 'cust-1',
        customerName: 'Alice Smith',
        itemsCount: 5,
        subtotal: 320,
        discount: 32,
        discountType: 'PERCENT',
        tax: 28.8,
        grandTotal: 316.8,
        payments: [
          { method: 'CASH', amount: 200 },
          { method: 'CARD', amount: 116.8, reference: 'REF-CARD-9912' },
        ],
        paymentStatus: 'PAID',
        changeAmount: 0,
        cashierName: 'Cashier Admin',
        completedAt: '2026-07-15T14:30:00.000Z',
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTx));
    return defaultTx;
  }

  private saveMockTransactions(txs: CheckoutTransaction[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    }
  }

  async getTransactions(params?: {
    q?: string;
    cashier?: string;
    method?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CheckoutTransaction>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.pos.payments, params);
      return {
        data: response.data.transactions ?? [],
        meta: response.meta ||
          (response.data as any).meta || {
            page: 1,
            pageSize: params?.limit || 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch {
      // SIMULATION FALLBACK
      let items = this.getMockTransactions();

      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (tx) =>
            tx.invoiceNumber.toLowerCase().includes(query) ||
            tx.customerName.toLowerCase().includes(query) ||
            tx.id.toLowerCase().includes(query),
        );
      }

      if (params?.cashier) {
        items = items.filter(
          (tx) => tx.cashierName.toLowerCase() === params.cashier?.toLowerCase(),
        );
      }

      if (params?.method && params.method !== 'ALL') {
        items = items.filter((tx) => tx.payments.some((p) => p.method === params.method));
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      return {
        data: paginatedItems,
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

  async getTransaction(id: string): Promise<CheckoutTransaction> {
    try {
      const response = await this.get<CheckoutTransaction>(
        `${apiConfig.endpoints.pos.checkout}/${id}`,
      );
      return response.data;
    } catch {
      const items = this.getMockTransactions();
      const found = items.find((tx) => tx.id === id || tx.invoiceNumber === id);
      if (!found) throw new Error(`Transaction with ID ${id} not found.`);
      return found;
    }
  }

  async createTransaction(payload: any): Promise<CheckoutTransaction> {
    try {
      const response = await this.post<CheckoutTransaction>(
        apiConfig.endpoints.pos.checkout,
        payload,
      );
      return response.data;
    } catch {
      const items = this.getMockTransactions();
      const newTx: CheckoutTransaction = {
        id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(items.length + 1).padStart(4, '0')}`,
        cartName: payload.cartName || 'POS Checkout',
        customerId: payload.customerId || 'walk-in',
        customerName: payload.customerName || 'Walk-in Customer',
        itemsCount: payload.itemsCount || 1,
        subtotal: payload.subtotal || 0,
        discount: payload.discount || 0,
        discountType: payload.discountType || 'FIXED',
        discountCode: payload.discountCode || '',
        tax: payload.tax || 0,
        grandTotal: payload.grandTotal || 0,
        payments: payload.payments || [],
        paymentStatus: payload.paymentStatus || 'PAID',
        changeAmount: payload.changeAmount || 0,
        cashierName: payload.cashierName || 'Cashier Admin',
        completedAt: new Date().toISOString(),
      };

      items.unshift(newTx);
      this.saveMockTransactions(items);

      // Add to Cash Drawer shift balance dynamically
      const activeShiftStr = localStorage.getItem('epos_simulated_active_shift');
      if (activeShiftStr) {
        try {
          const shift = JSON.parse(activeShiftStr);
          shift.currentBalance += newTx.grandTotal;
          shift.shiftBalance += newTx.grandTotal;
          shift.logs.push({
            id: `log-${Date.now()}`,
            type: 'IN',
            amount: newTx.grandTotal,
            notes: `POS Transaction: ${newTx.invoiceNumber}`,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('epos_simulated_active_shift', JSON.stringify(shift));
        } catch {}
      }

      return newTx;
    }
  }
}

export const checkoutService = new CheckoutService();
