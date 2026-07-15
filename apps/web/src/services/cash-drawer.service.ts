import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { CashDrawerShift } from '@/types/checkout';

const SHIFT_KEY = 'epos_simulated_active_shift';

class CashDrawerService extends ApiClient {
  async getActiveShift(): Promise<CashDrawerShift | null> {
    try {
      const response = await this.get<CashDrawerShift>(apiConfig.endpoints.pos.cashDrawer);
      return response.data;
    } catch {
      // Local Storage simulation
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
      const response = await this.post<CashDrawerShift>(apiConfig.endpoints.pos.cashDrawer, {
        cashierName,
        openingBalance,
      });
      return response.data;
    } catch {
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
      await this.post(`${apiConfig.endpoints.pos.cashDrawer}/close`, {});
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SHIFT_KEY);
      }
    }
  }

  async logCashEntry(type: 'IN' | 'OUT', amount: number, notes: string): Promise<CashDrawerShift> {
    try {
      const response = await this.post<CashDrawerShift>(
        `${apiConfig.endpoints.pos.cashDrawer}/entry`,
        {
          type,
          amount,
          notes,
        },
      );
      return response.data;
    } catch {
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
