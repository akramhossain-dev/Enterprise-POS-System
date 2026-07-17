import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { CashDrawerShift } from '@/types/checkout';

class CashDrawerService extends ApiClient {
  async getActiveShift(): Promise<CashDrawerShift | null> {
    const response = await this.get<any>('/pos/session/current');
    const data = response.data;
    if (!data) return null;

    // Fetch sales to calculate currentBalance and build logs dynamically
    let sales: any[] = [];
    try {
      const salesRes = await this.get<any>('/sales', { limit: 100 });
      sales = (salesRes.data || []).filter((s: any) => s.sessionId === data.id);
    } catch (err) {
      console.warn('Failed to load session sales:', err);
    }

    const totalSalesAmount = sales.reduce(
      (acc: number, s: any) => acc + parseFloat(s.grandTotal || '0'),
      0,
    );

    return {
      id: data.id,
      cashierName: data.cashierName || 'Cashier Admin',
      openingBalance: parseFloat(data.openingCash || '0'),
      currentBalance: parseFloat(data.openingCash || '0') + totalSalesAmount,
      shiftBalance: totalSalesAmount,
      openedAt: data.openedAt,
      closedAt: data.closedAt,
      logs: [
        {
          id: 'init',
          type: 'IN',
          amount: parseFloat(data.openingCash || '0'),
          notes: 'Shift Opened Balance',
          timestamp: data.openedAt,
        },
        ...sales.map((s: any) => ({
          id: s.id,
          type: 'IN' as const,
          amount: parseFloat(s.grandTotal || '0'),
          notes: `POS Transaction: ${s.invoiceNumber}`,
          timestamp: s.createdAt,
        })),
      ],
    };
  }

  async openShift(cashierName: string, openingBalance: number): Promise<CashDrawerShift> {
    // 1. Fetch current employee user profile to resolve companyId and branchId
    const userRes = await this.get<any>('/auth/me');
    const companyId = userRes.data.companyId;
    const branchId = userRes.data.branchId;

    // 2. Fetch warehouses list to get a valid warehouseId
    const warehousesRes = await this.get<any>('/warehouses');
    const warehouses = warehousesRes.data || [];
    const warehouseId = warehouses[0]?.id;

    if (!warehouseId) {
      throw new Error('No warehouses available to associate with POS session.');
    }

    // 3. Open POS session on backend
    const response = await this.post<any>('/pos/session/open', {
      companyId,
      branchId,
      warehouseId,
      openingCash: openingBalance,
    });

    const data = response.data;
    return {
      id: data.id,
      cashierName: data.cashierName || cashierName,
      openingBalance: parseFloat(data.openingCash || '0'),
      currentBalance: parseFloat(data.openingCash || '0'),
      shiftBalance: 0,
      openedAt: data.openedAt,
      closedAt: data.closedAt,
      logs: [
        {
          id: 'init',
          type: 'IN',
          amount: parseFloat(data.openingCash || '0'),
          notes: 'Shift Opened Balance',
          timestamp: data.openedAt,
        },
      ],
    };
  }

  async closeShift(): Promise<void> {
    let closingCash = 0;
    try {
      const active = await this.getActiveShift();
      if (active) {
        closingCash = active.currentBalance;
      }
    } catch {}

    await this.post('/pos/session/close', { closingCash });
  }

  async logCashEntry(type: 'IN' | 'OUT', amount: number, notes: string): Promise<CashDrawerShift> {
    const active = await this.getActiveShift();
    if (!active) throw new Error('No active drawer shift detected.');

    // Since register logs are not stored separately on the backend, we reflect them in memory/returns object
    return {
      ...active,
      currentBalance:
        type === 'IN'
          ? active.currentBalance + amount
          : Math.max(0, active.currentBalance - amount),
      logs: [
        ...active.logs,
        {
          id: `log-${Date.now()}`,
          type,
          amount,
          notes,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}

export const cashDrawerService = new CashDrawerService();
