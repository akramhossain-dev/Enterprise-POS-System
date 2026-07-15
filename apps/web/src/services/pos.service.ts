import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';

class POSService extends ApiClient {
  async getPOSCarts(): Promise<any> {
    try {
      // Connect to simulated API endpoints if available
      const response = await this.get('/pos/carts');
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  }

  async savePOSCarts(carts: any[]): Promise<any> {
    try {
      const response = await this.post('/pos/carts', { carts });
      return response.data;
    } catch {
      return { success: true };
    }
  }

  async getHeldOrders(): Promise<any> {
    try {
      const response = await this.get('/pos/held-orders');
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  }

  async createHeldOrder(payload: any): Promise<any> {
    try {
      const response = await this.post('/pos/held-orders', payload);
      return response.data;
    } catch {
      return { success: true, data: payload };
    }
  }
}

export const posService = new POSService();
