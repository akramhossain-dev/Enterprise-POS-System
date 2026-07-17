import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { CashDrawerShift } from '@/types/checkout';

const SHIFT_KEY = 'epos_simulated_active_shift';

class CashDrawerService extends ApiClient {
  async getActiveShift(): Promise<CashDrawerShift | null> {
    try {
      const response = await this.get<any>('/pos/session/current');
      const data = response.data;
      return {
        id: data.id,
        cashierName: data.cashierName,
        openingBalance: parseFloat(data.openingCash),
        currentBalance: parseFloat(data.openingCash),
        shiftBalance: 0,
        openedAt: data.openedAt,
        closedAt: data.closedAt,
        logs: [
          {
            id: 'init',
            type: 'IN',
            amount: parseFloat(data.openingCash),
            notes: 'Shift Opened Balance',
            timestamp: data.openedAt,
          },
        ],
      };
    } catch {
      // Local Storage simulation / Fallback
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(SHIFT_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  async openShift(cashierName: string, openingBalance: number): Promise<CashDrawerShift> {
    try {
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
        cashierName: data.cashierName,
        openingBalance: parseFloat(data.openingCash),
        currentBalance: parseFloat(data.openingCash),
        shiftBalance: 0,
        openedAt: data.openedAt,
        closedAt: data.closedAt,
        logs: [
          {
            id: 'init',
            type: 'IN',
            amount: parseFloat(data.openingCash),
            notes: 'Shift Opened Balance',
            timestamp: data.openedAt,
          },
        ],
      };
    } catch (err) {
      console.warn('Failed to open shift on backend, falling back to simulator:', err);
      const newShift: CashDrawerShift = {
        id: `shift-${Date.now()}`,
        cashierName,
        openingBalance,
        currentBalance: openingBalance,
        shiftBalance: 0,
        openedAt: new Date().toISOString(),
        closedAt: null,
        logs: [
          {
            id: `log-${Date.now()}`,
            type: 'IN',
            amount: openingBalance,
            notes: 'Shift Opened Balance',
            timestamp: new Date().toISOString(),
          },
        ],
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(SHIFT_KEY, JSON.stringify(newShift));
      }
      return newShift;
    }
  }

  async closeShift(): Promise<void> {
    try {
      let closingCash = 0;
      try {
        const active = await this.getActiveShift();
        if (active) {
          closingCash = active.currentBalance;
        }
      } catch {}

      await this.post('/pos/session/close', { closingCash });
    } catch (err) {
      console.warn('Failed to close shift on backend, clearing simulator:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SHIFT_KEY);
      }
    }
  }

  async logCashEntry(type: 'IN' | 'OUT', amount: number, notes: string): Promise<CashDrawerShift> {
    try {
      // Simulate since backend does not persist register logs
      const active = await this.getActiveShift();
      if (!active) throw new Error('No active drawer shift detected.');

      const change = type === 'IN' ? amount : -amount;
      const updated: CashDrawerShift = {
        ...active,
        currentBalance: Math.max(0, active.currentBalance + change),
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

      if (typeof window !== 'undefined') {
        localStorage.setItem(SHIFT_KEY, JSON.stringify(updated));
      }
      return updated;
    } catch (err) {
      const active = await this.getActiveShift();
      if (!active) throw new Error('No active drawer shift detected.');

      const change = type === 'IN' ? amount : -amount;
      const updated: CashDrawerShift = {
        ...active,
        currentBalance: Math.max(0, active.currentBalance + change),
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

      if (typeof window !== 'undefined') {
        localStorage.setItem(SHIFT_KEY, JSON.stringify(updated));
      }
      return updated;
    }
  }
}

export const cashDrawerService = new CashDrawerService();
