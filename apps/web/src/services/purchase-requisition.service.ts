import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type { PurchaseRequisition, PurchaseRequisitionFilterParams } from '@/types/purchase';

const STORAGE_KEY = 'enterprise_pos_purchase_requisitions';

const INITIAL_MOCKS: PurchaseRequisition[] = [
  {
    id: 'pr-11111111-1111-1111-1111-111111111111',
    title: 'Q3 Office IT Accessories Replenishment',
    requestedBy: 'John Doe',
    department: 'Information Technology',
    requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    priority: 'HIGH',
    status: 'PENDING_APPROVAL',
    supplierId: '11111111-1111-1111-1111-111111111111',
    supplierName: 'Global Tech Solutions',
    warehouseId: '11111111-1111-1111-1111-111111111111',
    warehouseName: 'Central Tech Depot',
    subtotal: 1250.0,
    notes: 'Requisitioning keyboards, mouse sets, and monitors for new desktop setups.',
    convertedPoId: null,
    items: [
      {
        id: 'pri-1',
        productId: 'prod-keyboards',
        productName: 'Mechanical Keyboard USB',
        sku: 'KB-MECH-USB',
        quantity: 20,
        unitPrice: 45.0,
        subtotal: 900.0,
      },
      {
        id: 'pri-2',
        productId: 'prod-mouse',
        productName: 'Optical Gaming Mouse USB',
        sku: 'MS-OPT-USB',
        quantity: 25,
        unitPrice: 14.0,
        subtotal: 350.0,
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr-22222222-2222-2222-2222-222222222222',
    title: 'Warehouse Logistics Storage Shelves',
    requestedBy: 'Robert Smith',
    department: 'Logistics & Warehousing',
    requiredDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    priority: 'URGENT',
    status: 'APPROVED',
    supplierId: '22222222-2222-2222-2222-222222222222',
    supplierName: 'Industrial Shelving Corp',
    warehouseId: '11111111-1111-1111-1111-111111111111',
    warehouseName: 'Central Tech Depot',
    subtotal: 3200.0,
    notes: 'Urgent replacement of damaged shelving unit on Rack Zone B shelf level 2.',
    convertedPoId: null,
    items: [
      {
        id: 'pri-3',
        productId: 'prod-shelves',
        productName: 'Heavy Duty Metal Rack Unit',
        sku: 'RK-HVY-MET',
        quantity: 8,
        unitPrice: 400.0,
        subtotal: 3200.0,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr-33333333-3333-3333-3333-333333333333',
    title: 'Storefront Standard Packaging Bags',
    requestedBy: 'Alice Johnson',
    department: 'Retail & Store Operations',
    requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    priority: 'LOW',
    status: 'DRAFT',
    supplierId: '33333333-3333-3333-3333-333333333333',
    supplierName: 'Eco-Friendly Pack Ltd',
    warehouseId: '11111111-1111-1111-1111-111111111111',
    warehouseName: 'Central Tech Depot',
    subtotal: 450.0,
    notes: 'Ordering paper bags for cashier points in branches.',
    convertedPoId: null,
    items: [
      {
        id: 'pri-4',
        productId: 'prod-bags',
        productName: 'Brown Paper Bag Small (1000 Pack)',
        sku: 'BG-PAP-SML',
        quantity: 15,
        unitPrice: 30.0,
        subtotal: 450.0,
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

class PurchaseRequisitionService extends ApiClient {
  private load(): PurchaseRequisition[] {
    if (typeof window === 'undefined') return INITIAL_MOCKS;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCKS));
      return INITIAL_MOCKS;
    }
    try {
      return JSON.parse(data) as PurchaseRequisition[];
    } catch {
      return INITIAL_MOCKS;
    }
  }

  private save(list: PurchaseRequisition[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  }

  async getRequisitions(
    params?: PurchaseRequisitionFilterParams,
  ): Promise<PaginatedResponse<PurchaseRequisition>> {
    try {
      const response = await this.get<PaginatedResponse<PurchaseRequisition>>(
        '/purchase-requisitions',
        params,
      );
      return response.data;
    } catch {
      const list = this.load();
      let filtered = [...list];

      if (params?.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.requestedBy.toLowerCase().includes(q) ||
            r.supplierName.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q),
        );
      }

      if (params?.priority && params.priority !== 'ALL') {
        filtered = filtered.filter((r) => r.priority === params.priority);
      }

      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === params.status);
      }

      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return {
        data: paginatedData,
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

  async getRequisition(id: string): Promise<PurchaseRequisition> {
    try {
      const response = await this.get<PurchaseRequisition>(`/purchase-requisitions/${id}`);
      return response.data;
    } catch {
      const list = this.load();
      const item = list.find((r) => r.id === id);
      if (!item) throw new Error('Purchase requisition not found');
      return item;
    }
  }

  async createRequisition(
    payload: Omit<
      PurchaseRequisition,
      'id' | 'status' | 'convertedPoId' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<PurchaseRequisition> {
    try {
      const companyId = (payload as any).companyId || 'company-id-placeholder';
      const items = payload.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      }));
      // Map requiredDate to full datetime ISO string for backend Zod schema
      const requiredDate = payload.requiredDate
        ? new Date(payload.requiredDate).toISOString()
        : new Date().toISOString();
      const response = await this.post<PurchaseRequisition>('/purchase-requisitions', {
        ...payload,
        companyId,
        requiredDate,
        items,
      });
      return response.data;
    } catch {
      const list = this.load();
      const newPr: PurchaseRequisition = {
        ...payload,
        id: `pr-${Math.random().toString(36).substr(2, 9)}`,
        status: 'DRAFT',
        convertedPoId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      list.push(newPr);
      this.save(list);
      return newPr;
    }
  }

  async updateRequisition(
    id: string,
    payload: Partial<Omit<PurchaseRequisition, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<PurchaseRequisition> {
    try {
      const formattedDate = payload.requiredDate
        ? new Date(payload.requiredDate).toISOString()
        : undefined;
      const items = payload.items
        ? payload.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          }))
        : undefined;
      const response = await this.put<PurchaseRequisition>(`/purchase-requisitions/${id}`, {
        ...payload,
        ...(formattedDate ? { requiredDate: formattedDate } : {}),
        ...(items ? { items } : {}),
      });
      return response.data;
    } catch {
      const list = this.load();
      const index = list.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Purchase requisition not found');

      const updated = {
        ...list[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      } as PurchaseRequisition;

      list[index] = updated;
      this.save(list);
      return updated;
    }
  }

  async submitRequisition(id: string): Promise<PurchaseRequisition> {
    return this.updateRequisition(id, { status: 'PENDING_APPROVAL' });
  }

  async approveRequisition(id: string): Promise<PurchaseRequisition> {
    return this.updateRequisition(id, { status: 'APPROVED' });
  }

  async rejectRequisition(id: string): Promise<PurchaseRequisition> {
    return this.updateRequisition(id, { status: 'REJECTED' });
  }

  async cancelRequisition(id: string): Promise<PurchaseRequisition> {
    return this.updateRequisition(id, { status: 'CANCELLED' });
  }

  async deleteRequisition(id: string): Promise<void> {
    try {
      await this.delete<void>(`/purchase-requisitions/${id}`);
    } catch {
      const list = this.load();
      const filtered = list.filter((r) => r.id !== id);
      this.save(filtered);
    }
  }

  async markConverted(id: string, poId: string): Promise<PurchaseRequisition> {
    return this.updateRequisition(id, {
      status: 'CONVERTED',
      convertedPoId: poId,
    });
  }
}

export const purchaseRequisitionService = new PurchaseRequisitionService();
