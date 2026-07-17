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
      const response = await this.get<any>('/sales', {
        page: params?.page,
        limit: params?.limit,
      });

      const sales = response.data || [];
      const mappedTransactions: CheckoutTransaction[] = sales.map((sale: any) => ({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        cartName: 'POS Cart',
        customerId: sale.customerId || 'walk-in',
        customerName: sale.customerName || 'Walk-in Customer',
        itemsCount: 1,
        subtotal: parseFloat(sale.subtotal),
        discount: parseFloat(sale.discount),
        discountType: 'FIXED',
        tax: parseFloat(sale.tax),
        grandTotal: parseFloat(sale.grandTotal),
        payments: [{ method: 'CASH', amount: parseFloat(sale.paidAmount) }],
        paymentStatus: sale.paymentStatus,
        changeAmount: 0,
        cashierName: 'Cashier Admin',
        completedAt: sale.createdAt,
      }));

      return {
        data: mappedTransactions,
        meta: response.meta || {
          page: params?.page ?? 1,
          pageSize: params?.limit ?? 20,
          total: mappedTransactions.length,
          totalPages: 1,
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
      const response = await this.get<any>(`/sales/${id}`);
      const sale = response.data;
      return {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        cartName: 'POS Cart',
        customerId: sale.customerId || 'walk-in',
        customerName: sale.customerName || 'Walk-in Customer',
        itemsCount: 1,
        subtotal: parseFloat(sale.subtotal),
        discount: parseFloat(sale.discount),
        discountType: 'FIXED',
        tax: parseFloat(sale.tax),
        grandTotal: parseFloat(sale.grandTotal),
        payments: [{ method: 'CASH', amount: parseFloat(sale.paidAmount) }],
        paymentStatus: sale.paymentStatus,
        changeAmount: 0,
        cashierName: 'Cashier Admin',
        completedAt: sale.createdAt,
      };
    } catch {
      const items = this.getMockTransactions();
      const found = items.find((tx) => tx.id === id || tx.invoiceNumber === id);
      if (!found) throw new Error(`Transaction with ID ${id} not found.`);
      return found;
    }
  }

  async createTransaction(payload: any): Promise<CheckoutTransaction> {
    try {
      const { usePOSStore } = await import('@/stores/pos.store');
      const { carts, activeCartId } = usePOSStore.getState();
      const activeCart = carts.find((c) => c.id === activeCartId);

      if (!activeCart || activeCart.items.length === 0) {
        throw new Error('No items in the active cart to checkout.');
      }

      // 1. Fetch active POS session
      const sessionRes = await this.get<any>('/pos/session/current');
      const session = sessionRes.data;

      // 2. Create POS cart on backend
      const customerId = activeCart.customerId && activeCart.customerId !== 'walk-in' ? activeCart.customerId : null;
      const cartRes = await this.post<any>('/pos/cart', {
        sessionId: session.id,
        customerId,
      });
      const createdCart = cartRes.data;

      // 3. Add items to backend cart
      for (const item of activeCart.items) {
        await this.post<any>(`/pos/cart/${createdCart.id}/items`, {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
        });
      }

      // 4. Map payment method
      const singlePayment = payload.payments?.[0];
      let mappedMethod = 'CASH';
      if (singlePayment) {
        if (singlePayment.method === 'CARD') mappedMethod = 'CARD';
        else if (singlePayment.method === 'MOBILE') mappedMethod = 'MOBILE_BANKING';
        else if (singlePayment.method === 'BANK') mappedMethod = 'BANK';
        else mappedMethod = 'OTHER';
      }

      const checkoutPayload = {
        cartId: createdCart.id,
        customerId,
        paymentDetails: singlePayment
          ? {
              paymentMethod: mappedMethod,
              amount: singlePayment.amount,
              reference: singlePayment.reference || null,
              transactionId: singlePayment.reference || null,
            }
          : null,
      };

      // 5. Checkout
      const response = await this.post<any>('/pos/checkout', checkoutPayload);
      const sale = response.data.sale;

      return {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        cartName: activeCart.name,
        customerId: sale.customerId || 'walk-in',
        customerName: sale.customerName || 'Walk-in Customer',
        itemsCount: activeCart.items.reduce((acc, it) => acc + it.quantity, 0),
        subtotal: parseFloat(sale.subtotal),
        discount: parseFloat(sale.discount),
        discountType: 'FIXED',
        tax: parseFloat(sale.tax),
        grandTotal: parseFloat(sale.grandTotal),
        payments: payload.payments || [],
        paymentStatus: sale.paymentStatus,
        changeAmount: payload.changeAmount || 0,
        cashierName: 'Cashier Admin',
        completedAt: sale.createdAt,
      };
    } catch (err) {
      console.warn('Real checkout failed, falling back to simulator:', err);
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
