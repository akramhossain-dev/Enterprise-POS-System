import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { SalesReturn, POSOrder, SalesRefund } from '@/types/sales-return';

const ORDERS_KEY = 'epos_simulated_orders';
const RETURNS_KEY = 'epos_simulated_returns';
const REFUNDS_KEY = 'epos_simulated_refunds';

class SalesReturnService extends ApiClient {
  // Preload Mock Orders
  private getMockOrders(): POSOrder[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultOrders: POSOrder[] = [
      {
        id: 'ord-1',
        invoiceNumber: 'INV-2026-07-0001',
        customerName: 'Walk-in Customer',
        customerId: 'walk-in',
        cashierName: 'Cashier Admin',
        totalAmount: 170,
        discount: 10,
        tax: 14,
        grandTotal: 174,
        paymentMethod: 'CASH',
        status: 'PAID',
        completedAt: '2026-07-15T12:00:00.000Z',
        items: [
          { productId: 'p1', productName: 'Premium Wireless Keyboard', quantity: 1, unitPrice: 80 },
          { productId: 'p2', productName: 'Ergonomic Optical Mouse', quantity: 2, unitPrice: 45 },
        ],
      },
      {
        id: 'ord-2',
        invoiceNumber: 'INV-2026-07-0002',
        customerName: 'Alice Smith',
        customerId: 'cust-1',
        cashierName: 'Cashier Admin',
        totalAmount: 320,
        discount: 32,
        tax: 28.8,
        grandTotal: 316.8,
        paymentMethod: 'CASH, CARD',
        status: 'PAID',
        completedAt: '2026-07-15T14:30:00.000Z',
        items: [
          { productId: 'p1', productName: 'Premium Wireless Keyboard', quantity: 2, unitPrice: 80 },
          { productId: 'p2', productName: 'Ergonomic Optical Mouse', quantity: 3, unitPrice: 45 },
          { productId: 'p3', productName: 'USB-C Cable Charger', quantity: 1, unitPrice: 25 },
        ],
      },
    ];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(defaultOrders));
    return defaultOrders;
  }

  // Preload Mock Returns
  private getMockReturns(): SalesReturn[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(RETURNS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultReturns: SalesReturn[] = [
      {
        id: 'ret-1',
        returnNumber: 'RTN-2026-07-0001',
        invoiceNumber: 'INV-2026-07-0001',
        customerId: 'walk-in',
        customerName: 'Walk-in Customer',
        warehouseId: 'wh-main',
        returnDate: '2026-07-15T16:00:00.000Z',
        items: [
          {
            productId: 'p2',
            productName: 'Ergonomic Optical Mouse',
            sku: 'MSE-ERGO-02',
            unitPrice: 45,
            quantitySold: 2,
            quantityReturned: 1,
            condition: 'DAMAGED',
            reason: 'Damaged',
          } as any,
        ],
        subtotal: 45,
        discountAdjustments: 0,
        taxAdjustments: 4.5,
        refundAmount: 49.5,
        refundMethod: 'CASH',
        status: 'COMPLETED',
        refundStatus: 'REFUNDED',
        notes: 'Scroll wheel erratic.',
      },
    ];
    localStorage.setItem(RETURNS_KEY, JSON.stringify(defaultReturns));
    return defaultReturns;
  }

  // Preload Mock Refunds
  private getMockRefunds(): SalesRefund[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(REFUNDS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    const defaultRefunds: SalesRefund[] = [
      {
        id: 'ref-1',
        returnId: 'ret-1',
        returnNumber: 'RTN-2026-07-0001',
        invoiceNumber: 'INV-2026-07-0001',
        customerName: 'Walk-in Customer',
        amount: 49.5,
        refundMethod: 'CASH',
        status: 'REFUNDED',
        processedAt: '2026-07-15T16:05:00.000Z',
        cashierName: 'Cashier Admin',
      },
    ];
    localStorage.setItem(REFUNDS_KEY, JSON.stringify(defaultRefunds));
    return defaultRefunds;
  }

  // Order Queries
  async getOrders(params?: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<POSOrder>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.pos.orders, params);
      return {
        data: response.data.orders ?? [],
        meta: response.meta ||
          (response.data as any).meta || {
            page: 1,
            pageSize: params?.limit || 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch {
      let items = this.getMockOrders();
      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (o) =>
            o.invoiceNumber.toLowerCase().includes(query) ||
            o.customerName.toLowerCase().includes(query),
        );
      }
      if (params?.status && params.status !== 'ALL') {
        items = items.filter((o) => o.status === params.status);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
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

  async getOrder(id: string): Promise<POSOrder> {
    try {
      const response = await this.get<POSOrder>(`${apiConfig.endpoints.pos.orders}/${id}`);
      return response.data;
    } catch {
      const items = this.getMockOrders();
      const found = items.find((o) => o.id === id || o.invoiceNumber === id);
      if (!found) throw new Error('Order not found.');
      return found;
    }
  }

  async voidOrder(id: string, reason: string): Promise<POSOrder> {
    try {
      const response = await this.post<POSOrder>(`${apiConfig.endpoints.pos.orders}/${id}/void`, {
        reason,
      });
      return response.data;
    } catch {
      const items = this.getMockOrders();
      const idx = items.findIndex((o) => o.id === id || o.invoiceNumber === id);
      if (idx === -1) throw new Error('Order not found.');

      const updated: POSOrder = { ...items[idx]!, status: 'VOIDED' };
      items[idx] = updated;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(items));

      // Log out deduction from Cash Drawer shift
      const activeShiftStr = localStorage.getItem('epos_simulated_active_shift');
      if (activeShiftStr) {
        try {
          const shift = JSON.parse(activeShiftStr);
          shift.currentBalance = Math.max(0, shift.currentBalance - updated.grandTotal);
          shift.logs.push({
            id: `log-${Date.now()}`,
            type: 'OUT',
            amount: updated.grandTotal,
            notes: `VOID POS Sale: ${updated.invoiceNumber}. Reason: ${reason}`,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('epos_simulated_active_shift', JSON.stringify(shift));
        } catch {}
      }

      return updated;
    }
  }

  // Returns Queries
  async getReturns(params?: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SalesReturn>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.pos.returns, params);
      return {
        data: response.data.returns ?? [],
        meta: response.meta ||
          (response.data as any).meta || {
            page: 1,
            pageSize: params?.limit || 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch {
      let items = this.getMockReturns();
      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (r) =>
            r.returnNumber.toLowerCase().includes(query) ||
            r.invoiceNumber.toLowerCase().includes(query) ||
            r.customerName.toLowerCase().includes(query),
        );
      }
      if (params?.status && params.status !== 'ALL') {
        items = items.filter((r) => r.status === params.status);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
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

  async getReturn(id: string): Promise<SalesReturn> {
    try {
      const response = await this.get<SalesReturn>(`${apiConfig.endpoints.pos.returns}/${id}`);
      return response.data;
    } catch {
      const items = this.getMockReturns();
      const found = items.find((r) => r.id === id || r.returnNumber === id);
      if (!found) throw new Error('Return claim not found.');
      return found;
    }
  }

  async createReturn(payload: any): Promise<SalesReturn> {
    try {
      const response = await this.post<SalesReturn>(apiConfig.endpoints.pos.returns, payload);
      return response.data;
    } catch {
      const items = this.getMockReturns();
      const newReturn: SalesReturn = {
        id: `ret-${Date.now()}`,
        returnNumber: `RTN-2026-07-${String(items.length + 1).padStart(4, '0')}`,
        invoiceNumber: payload.invoiceNumber,
        customerId: payload.customerId || 'walk-in',
        customerName: payload.customerName || 'Walk-in Customer',
        warehouseId: payload.warehouseId || 'wh-main',
        returnDate: new Date().toISOString(),
        items: payload.items || [],
        subtotal: payload.subtotal || 0,
        discountAdjustments: payload.discountAdjustments || 0,
        taxAdjustments: payload.taxAdjustments || 0,
        refundAmount: payload.refundAmount || 0,
        refundMethod: payload.refundMethod || 'CASH',
        status: 'SUBMITTED',
        refundStatus: 'PENDING',
        notes: payload.notes || '',
      };

      items.unshift(newReturn);
      localStorage.setItem(RETURNS_KEY, JSON.stringify(items));

      // If status is immediately approved, trigger refund logs
      return newReturn;
    }
  }

  async approveReturn(id: string): Promise<SalesReturn> {
    try {
      const response = await this.post<SalesReturn>(
        `${apiConfig.endpoints.pos.returns}/${id}/approve`,
        {},
      );
      return response.data;
    } catch {
      const items = this.getMockReturns();
      const idx = items.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Return claim not found.');

      const updated: SalesReturn = { ...items[idx]!, status: 'APPROVED', refundStatus: 'REFUNDED' };
      items[idx] = updated;
      localStorage.setItem(RETURNS_KEY, JSON.stringify(items));

      // Append to refunds log
      const refunds = this.getMockRefunds();
      const newRefund: SalesRefund = {
        id: `ref-${Date.now()}`,
        returnId: updated.id,
        returnNumber: updated.returnNumber,
        invoiceNumber: updated.invoiceNumber,
        customerName: updated.customerName,
        amount: updated.refundAmount,
        refundMethod: updated.refundMethod,
        status: 'REFUNDED',
        processedAt: new Date().toISOString(),
        cashierName: 'Cashier Admin',
      };
      refunds.unshift(newRefund);
      localStorage.setItem(REFUNDS_KEY, JSON.stringify(refunds));

      // Deduct cash from drawer balance
      const activeShiftStr = localStorage.getItem('epos_simulated_active_shift');
      if (activeShiftStr) {
        try {
          const shift = JSON.parse(activeShiftStr);
          shift.currentBalance = Math.max(0, shift.currentBalance - updated.refundAmount);
          shift.logs.push({
            id: `log-${Date.now()}`,
            type: 'OUT',
            amount: updated.refundAmount,
            notes: `Refund claim approve: ${updated.returnNumber}`,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('epos_simulated_active_shift', JSON.stringify(shift));
        } catch {}
      }

      return updated;
    }
  }

  // Refunds Queries
  async getRefunds(params?: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SalesRefund>> {
    try {
      const response = await this.get<any>(apiConfig.endpoints.pos.refunds, params);
      return {
        data: response.data.refunds ?? [],
        meta: response.meta ||
          (response.data as any).meta || {
            page: 1,
            pageSize: params?.limit || 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch {
      let items = this.getMockRefunds();
      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (r) =>
            r.invoiceNumber.toLowerCase().includes(query) ||
            r.customerName.toLowerCase().includes(query),
        );
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
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
}

export const salesReturnService = new SalesReturnService();
