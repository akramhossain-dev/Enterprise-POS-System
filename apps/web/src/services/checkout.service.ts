import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { CheckoutTransaction } from '@/types/checkout';

class CheckoutService extends ApiClient {
  async getTransactions(params?: {
    q?: string;
    cashier?: string;
    method?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CheckoutTransaction>> {
    const response = await this.get<any>('/sales', {
      page: params?.page,
      limit: params?.limit,
      q: params?.q,
    });

    const sales = response.data || [];
    const mappedTransactions: CheckoutTransaction[] = sales.map((sale: any) => ({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      cartName: 'POS Cart',
      customerId: sale.customerId || 'walk-in',
      customerName: sale.customerName || 'Walk-in Customer',
      itemsCount: sale.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 1,
      subtotal: parseFloat(sale.subtotal || '0'),
      discount: parseFloat(sale.discount || '0'),
      discountType: 'FIXED',
      tax: parseFloat(sale.tax || '0'),
      grandTotal: parseFloat(sale.grandTotal || '0'),
      payments: sale.payments?.map((p: any) => ({
        method: p.paymentMethod,
        amount: parseFloat(p.amount || '0'),
      })) || [{ method: 'CASH', amount: parseFloat(sale.paidAmount || '0') }],
      paymentStatus: sale.paymentStatus,
      changeAmount: parseFloat(sale.changeAmount || '0'),
      cashierName: sale.cashier?.name || 'Cashier Admin',
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
  }

  async getTransaction(id: string): Promise<CheckoutTransaction> {
    const response = await this.get<any>(`/sales/${id}`);
    const sale = response.data;

    return {
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      cartName: 'POS Cart',
      customerId: sale.customerId || 'walk-in',
      customerName: sale.customerName || 'Walk-in Customer',
      itemsCount: sale.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 1,
      subtotal: parseFloat(sale.subtotal || '0'),
      discount: parseFloat(sale.discount || '0'),
      discountType: 'FIXED',
      tax: parseFloat(sale.tax || '0'),
      grandTotal: parseFloat(sale.grandTotal || '0'),
      payments: sale.payments?.map((p: any) => ({
        method: p.paymentMethod,
        amount: parseFloat(p.amount || '0'),
      })) || [{ method: 'CASH', amount: parseFloat(sale.paidAmount || '0') }],
      paymentStatus: sale.paymentStatus,
      changeAmount: parseFloat(sale.changeAmount || '0'),
      cashierName: sale.cashier?.name || 'Cashier Admin',
      completedAt: sale.createdAt,
    };
  }

  async createTransaction(payload: any): Promise<CheckoutTransaction> {
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
    const customerId =
      activeCart.customerId && activeCart.customerId !== 'walk-in' ? activeCart.customerId : null;
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
  }
}

export const checkoutService = new CheckoutService();
