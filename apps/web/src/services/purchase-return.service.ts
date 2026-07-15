import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  PurchaseReturn,
  PurchaseReturnFilterParams,
  PurchaseReturnStatus,
  ApprovalTimelineItem,
} from '@/types/purchase-return';

const STORAGE_KEY = 'epos_simulated_purchase_returns';

class PurchaseReturnService extends ApiClient {
  private getMockReturns(): PurchaseReturn[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    // Default mock returns
    const defaultReturns: PurchaseReturn[] = [
      {
        id: 'ret-1',
        returnNumber: 'PR-2026-07-0001',
        supplierId: 'sup-1',
        supplier: {
          id: 'sup-1',
          companyId: 'comp-1',
          supplierCode: 'SUP001',
          companyName: 'Global Distribute Inc.',
          contactPerson: 'John Doe',
          email: 'john@global.com',
          phone: '123456',
          status: 'ACTIVE',
          alternativePhone: null,
          website: null,
          taxNumber: 'TX123',
          creditLimit: '50000',
          openingBalance: '0',
          currentBalance: '0',
          notes: null,
          addresses: [],
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        },
        warehouseId: 'wh-1',
        warehouse: {
          id: 'wh-1',
          companyId: 'comp-1',
          branchId: null,
          name: 'Main Distribution Center',
          code: 'MDC',
          address: 'Warehouse Rd',
          city: 'Metro',
          status: 'ACTIVE',
          isDefault: true,
          createdAt: '',
          updatedAt: '',
        },
        referenceType: 'PO',
        referencePoId: 'po-1',
        referencePoNumber: 'PO-2026-06-1024',
        returnDate: '2026-07-10',
        reason: 'DAMAGED',
        status: 'PENDING',
        returnMethod: 'CREDIT_NOTE',
        notes: 'Damaged item batches detected during unloading. Returning for account credit.',
        subtotal: 1200,
        tax: 120,
        discount: 50,
        grandTotal: 1270,
        items: [
          {
            id: 'ret-item-1',
            purchaseReturnId: 'ret-1',
            productId: 'prod-1',
            productName: 'Premium Wireless Keyboard',
            sku: 'KBD-WIRELESS-01',
            orderedQty: 100,
            receivedQty: 95,
            returnQty: 15,
            acceptedQty: 0,
            rejectedQty: 0,
            unitPrice: 80,
            reason: 'DAMAGED',
            status: 'PENDING',
          },
        ],
        approvalTimeline: [
          {
            id: 'atl-1',
            status: 'DRAFT',
            actionBy: 'Operator Alpha',
            actionDate: '2026-07-10T10:00:00.000Z',
            notes: 'Draft purchase return request initialized.',
          },
          {
            id: 'atl-2',
            status: 'PENDING',
            actionBy: 'Operator Alpha',
            actionDate: '2026-07-10T10:15:00.000Z',
            notes: 'Return submitted for Manager approval.',
          },
        ],
        createdBy: 'Operator Alpha',
        createdAt: '2026-07-10T10:00:00.000Z',
        updatedAt: '2026-07-10T10:15:00.000Z',
      },
      {
        id: 'ret-2',
        returnNumber: 'PR-2026-07-0002',
        supplierId: 'sup-2',
        supplier: {
          id: 'sup-2',
          companyId: 'comp-1',
          supplierCode: 'SUP002',
          companyName: 'TechSource Wholesale',
          contactPerson: 'Jane Smith',
          email: 'jane@techsource.com',
          phone: '654321',
          status: 'ACTIVE',
          alternativePhone: null,
          website: null,
          taxNumber: 'TX456',
          creditLimit: '100000',
          openingBalance: '0',
          currentBalance: '0',
          notes: null,
          addresses: [],
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        },
        warehouseId: 'wh-2',
        warehouse: {
          id: 'wh-2',
          companyId: 'comp-1',
          branchId: null,
          name: 'West Coast Storage',
          code: 'WCS',
          address: 'Storage Way',
          city: 'Westside',
          status: 'ACTIVE',
          isDefault: false,
          createdAt: '',
          updatedAt: '',
        },
        referenceType: 'GRN',
        referenceGrnId: 'grn-1',
        referenceGrnNumber: 'GRN-2026-07-4402',
        returnDate: '2026-07-12',
        reason: 'WRONG_PRODUCT',
        status: 'COMPLETED',
        returnMethod: 'REFUND',
        notes: 'Wrong color options shipped. Returned for immediate cash refund.',
        subtotal: 450,
        tax: 45,
        discount: 0,
        grandTotal: 495,
        items: [
          {
            id: 'ret-item-2',
            purchaseReturnId: 'ret-2',
            productId: 'prod-2',
            productName: 'Ergonomic Optical Mouse',
            sku: 'MSE-ERGO-02',
            orderedQty: 50,
            receivedQty: 50,
            returnQty: 10,
            acceptedQty: 10,
            rejectedQty: 0,
            unitPrice: 45,
            reason: 'WRONG_PRODUCT',
            status: 'ACCEPTED',
          },
        ],
        approvalTimeline: [
          {
            id: 'atl-3',
            status: 'DRAFT',
            actionBy: 'Purchaser Beta',
            actionDate: '2026-07-12T09:00:00.000Z',
            notes: 'Incorrect shipment variance return logged.',
          },
          {
            id: 'atl-4',
            status: 'PENDING',
            actionBy: 'Purchaser Beta',
            actionDate: '2026-07-12T09:05:00.000Z',
            notes: 'Submitted for audit review.',
          },
          {
            id: 'atl-5',
            status: 'APPROVED',
            actionBy: 'Admin Manager',
            actionDate: '2026-07-12T14:20:00.000Z',
            notes: 'Approved return. Settle refund note.',
          },
          {
            id: 'atl-6',
            status: 'COMPLETED',
            actionBy: 'Admin Manager',
            actionDate: '2026-07-12T15:00:00.000Z',
            notes: 'Refund voucher collected, stock updated.',
          },
        ],
        createdBy: 'Purchaser Beta',
        createdAt: '2026-07-12T09:00:00.000Z',
        updatedAt: '2026-07-12T15:00:00.000Z',
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReturns));
    return defaultReturns;
  }

  private saveMockReturns(returns: PurchaseReturn[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
    }
  }

  async getReturns(
    params?: PurchaseReturnFilterParams,
  ): Promise<PaginatedResponse<PurchaseReturn>> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.page) queryParams['page'] = params.page;
      if (params?.limit) queryParams['limit'] = params.limit;
      if (params?.q) queryParams['q'] = params.q;
      if (params?.supplierId) queryParams['supplierId'] = params.supplierId;
      if (params?.warehouseId) queryParams['warehouseId'] = params.warehouseId;
      if (params?.status && params.status !== 'ALL') {
        queryParams['status'] = params.status;
      }
      if (params?.reason && params.reason !== 'ALL') {
        queryParams['reason'] = params.reason;
      }

      const response = await this.get<{
        returns: PurchaseReturn[];
        meta: PaginatedResponse<PurchaseReturn>['meta'];
      }>(apiConfig.endpoints.purchaseReturns, queryParams);

      return {
        data: response.data.returns ?? [],
        meta: response.meta || (response.data as any).meta,
      };
    } catch (err) {
      console.warn('PurchaseReturn API error, falling back to simulator:', err);
      // SIMULATION FALLBACK
      let items = this.getMockReturns();

      // Apply filters
      if (params?.q) {
        const query = params.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.returnNumber.toLowerCase().includes(query) ||
            (item.referencePoNumber && item.referencePoNumber.toLowerCase().includes(query)) ||
            (item.referenceGrnNumber && item.referenceGrnNumber.toLowerCase().includes(query)) ||
            (item.referenceInvoiceNumber &&
              item.referenceInvoiceNumber.toLowerCase().includes(query)) ||
            (item.supplier && item.supplier.companyName.toLowerCase().includes(query)),
        );
      }

      if (params?.supplierId) {
        items = items.filter((item) => item.supplierId === params.supplierId);
      }

      if (params?.warehouseId) {
        items = items.filter((item) => item.warehouseId === params.warehouseId);
      }

      if (params?.status && params.status !== 'ALL') {
        items = items.filter((item) => item.status === params.status);
      }

      if (params?.reason && params.reason !== 'ALL') {
        items = items.filter((item) => item.reason === params.reason);
      }

      if (params?.dateFrom) {
        const from = new Date(params.dateFrom).getTime();
        items = items.filter((item) => new Date(item.returnDate).getTime() >= from);
      }

      if (params?.dateTo) {
        const to = new Date(params.dateTo).getTime();
        items = items.filter((item) => new Date(item.returnDate).getTime() <= to);
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

  async getReturn(id: string): Promise<PurchaseReturn> {
    try {
      const response = await this.get<PurchaseReturn>(
        `${apiConfig.endpoints.purchaseReturns}/${id}`,
      );
      return response.data;
    } catch (err) {
      console.warn(`PurchaseReturn Detail API error for ${id}, falling back to simulator:`, err);
      const items = this.getMockReturns();
      const found = items.find((item) => item.id === id);
      if (!found) {
        throw new Error(`Purchase return with ID ${id} not found.`);
      }
      return found;
    }
  }

  async createReturn(payload: any): Promise<PurchaseReturn> {
    try {
      const response = await this.post<PurchaseReturn>(
        apiConfig.endpoints.purchaseReturns,
        payload,
      );
      return response.data;
    } catch (err) {
      console.warn('PurchaseReturn Create API error, falling back to simulator:', err);
      const items = this.getMockReturns();

      const newId = `ret-${Math.floor(1000 + Math.random() * 9000)}`;
      const returnNumber = `PR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(items.length + 1).padStart(4, '0')}`;

      const timeline: ApprovalTimelineItem[] = [
        {
          id: `atl-${Math.random()}`,
          status: 'DRAFT',
          actionBy: payload.createdBy || 'Authorized User',
          actionDate: new Date().toISOString(),
          notes: 'Draft return request created.',
        },
      ];

      const newReturn: PurchaseReturn = {
        id: newId,
        returnNumber,
        supplierId: payload.supplierId,
        supplier: payload.supplier,
        warehouseId: payload.warehouseId,
        warehouse: payload.warehouse,
        referenceType: payload.referenceType,
        referencePoId: payload.referencePoId,
        referencePoNumber: payload.referencePoNumber,
        referenceGrnId: payload.referenceGrnId,
        referenceGrnNumber: payload.referenceGrnNumber,
        referenceInvoiceId: payload.referenceInvoiceId,
        referenceInvoiceNumber: payload.referenceInvoiceNumber,
        returnDate: payload.returnDate,
        reason: payload.reason,
        status: 'DRAFT',
        returnMethod: payload.returnMethod,
        notes: payload.notes,
        attachments: payload.attachments,
        subtotal: payload.subtotal,
        tax: payload.tax,
        discount: payload.discount,
        grandTotal: payload.grandTotal,
        approvalTimeline: timeline,
        createdBy: payload.createdBy || 'Operator Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: (payload.items || []).map((it: any, idx: number) => ({
          id: it.id || `ret-item-${newId}-${idx}`,
          purchaseReturnId: newId,
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          orderedQty: it.orderedQty,
          receivedQty: it.receivedQty,
          returnQty: it.returnQty,
          acceptedQty: 0,
          rejectedQty: 0,
          unitPrice: it.unitPrice,
          reason: it.reason,
          status: 'PENDING',
        })),
      };

      items.unshift(newReturn);
      this.saveMockReturns(items);
      return newReturn;
    }
  }

  async updateReturn(id: string, payload: any): Promise<PurchaseReturn> {
    try {
      const response = await this.patch<PurchaseReturn>(
        `${apiConfig.endpoints.purchaseReturns}/${id}`,
        payload,
      );
      return response.data;
    } catch (err) {
      console.warn('PurchaseReturn Update API error, falling back to simulator:', err);
      const items = this.getMockReturns();
      const idx = items.findIndex((item) => item.id === id);
      if (idx === -1) {
        throw new Error(`Purchase return with ID ${id} not found.`);
      }

      const existing = items[idx];
      if (!existing) {
        throw new Error(`Purchase return with ID ${id} is undefined.`);
      }

      const updatedItems = payload.items
        ? payload.items.map((it: any, itemIdx: number) => ({
            id: it.id || `ret-item-${id}-${itemIdx}`,
            purchaseReturnId: id,
            productId: it.productId,
            productName: it.productName,
            sku: it.sku,
            orderedQty: it.orderedQty,
            receivedQty: it.receivedQty,
            returnQty: it.returnQty,
            acceptedQty: it.acceptedQty || 0,
            rejectedQty: it.rejectedQty || 0,
            unitPrice: it.unitPrice,
            reason: it.reason,
            status: it.status || 'PENDING',
          }))
        : existing.items;

      const updated: PurchaseReturn = {
        ...existing,
        ...payload,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      items[idx] = updated;
      this.saveMockReturns(items);
      return updated;
    }
  }

  async submitReturn(id: string): Promise<PurchaseReturn> {
    try {
      const response = await this.patch<PurchaseReturn>(
        `${apiConfig.endpoints.purchaseReturns}/${id}/submit`,
        {},
      );
      return response.data;
    } catch (err) {
      console.warn('PurchaseReturn Submit API error, falling back to simulator:', err);
      return this.updateStatus(id, 'PENDING', 'Return submitted for approval review.');
    }
  }

  async approveReturn(id: string, notes?: string): Promise<PurchaseReturn> {
    try {
      const response = await this.patch<PurchaseReturn>(
        `${apiConfig.endpoints.purchaseReturns}/${id}/approve`,
        { notes },
      );
      return response.data;
    } catch (err) {
      console.warn('PurchaseReturn Approve API error, falling back to simulator:', err);
      return this.updateStatus(
        id,
        'APPROVED',
        notes || 'Return request approved by operations manager.',
      );
    }
  }

  async rejectReturn(id: string, notes?: string): Promise<PurchaseReturn> {
    try {
      const response = await this.patch<PurchaseReturn>(
        `${apiConfig.endpoints.purchaseReturns}/${id}/reject`,
        { notes },
      );
      return response.data;
    } catch (err) {
      console.warn('PurchaseReturn Reject API error, falling back to simulator:', err);
      return this.updateStatus(
        id,
        'REJECTED',
        notes || 'Return request rejected after inspection.',
      );
    }
  }

  async cancelReturn(id: string): Promise<PurchaseReturn> {
    try {
      const response = await this.patch<PurchaseReturn>(
        `${apiConfig.endpoints.purchaseReturns}/${id}/cancel`,
        {},
      );
      return response.data;
    } catch (err) {
      console.warn('PurchaseReturn Cancel API error, falling back to simulator:', err);
      return this.updateStatus(id, 'CANCELLED', 'Return cancelled.');
    }
  }

  async completeReturn(id: string): Promise<PurchaseReturn> {
    try {
      const response = await this.patch<PurchaseReturn>(
        `${apiConfig.endpoints.purchaseReturns}/${id}/complete`,
        {},
      );
      return response.data;
    } catch (err) {
      console.warn('PurchaseReturn Complete API error, falling back to simulator:', err);

      const ret = await this.getReturn(id);

      const cnKey = 'epos_simulated_credit_notes';
      const dnKey = 'epos_simulated_debit_notes';

      if (ret.returnMethod === 'CREDIT_NOTE') {
        const list = typeof window !== 'undefined' ? localStorage.getItem(cnKey) : null;
        const currentCNs = list ? JSON.parse(list) : [];
        const newCN = {
          id: `cn-${Math.floor(1000 + Math.random() * 9000)}`,
          creditNoteNumber: `CN-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
          supplierId: ret.supplierId,
          supplier: ret.supplier,
          referenceReturnId: ret.id,
          referenceReturnNumber: ret.returnNumber,
          creditAmount: ret.grandTotal,
          status: 'ISSUED',
          issueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        currentCNs.unshift(newCN);
        if (typeof window !== 'undefined') localStorage.setItem(cnKey, JSON.stringify(currentCNs));
      } else if (ret.returnMethod === 'REFUND') {
        const list = typeof window !== 'undefined' ? localStorage.getItem(dnKey) : null;
        const currentDNs = list ? JSON.parse(list) : [];
        const newDN = {
          id: `dn-${Math.floor(1000 + Math.random() * 9000)}`,
          debitNoteNumber: `DN-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
          supplierId: ret.supplierId,
          supplier: ret.supplier,
          referenceReturnId: ret.id,
          referenceReturnNumber: ret.returnNumber,
          amount: ret.grandTotal,
          status: 'ISSUED',
          issueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        currentDNs.unshift(newDN);
        if (typeof window !== 'undefined') localStorage.setItem(dnKey, JSON.stringify(currentDNs));
      }

      // Complete status update
      const updated = await this.updateStatus(
        id,
        'COMPLETED',
        'Return operations completed. Stock adjusted and financial documents issued.',
      );

      // Update item statuses to ACCEPTED
      const updatedItems = updated.items.map((it) => ({
        ...it,
        acceptedQty: it.returnQty,
        status: 'ACCEPTED' as const,
      }));

      return this.updateReturn(id, { items: updatedItems });
    }
  }

  private async updateStatus(
    id: string,
    status: PurchaseReturnStatus,
    notes: string,
  ): Promise<PurchaseReturn> {
    const items = this.getMockReturns();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) {
      throw new Error(`Purchase return with ID ${id} not found.`);
    }

    const existing = items[idx];
    if (!existing) {
      throw new Error(`Purchase return with ID ${id} is undefined.`);
    }

    const timeline: ApprovalTimelineItem[] = [
      ...existing.approvalTimeline,
      {
        id: `atl-${Math.random()}`,
        status,
        actionBy: 'Admin User',
        actionDate: new Date().toISOString(),
        notes,
      },
    ];

    const updated: PurchaseReturn = {
      ...existing,
      status,
      approvalTimeline: timeline,
      updatedAt: new Date().toISOString(),
    };

    items[idx] = updated;
    this.saveMockReturns(items);
    return updated;
  }
}

export const purchaseReturnService = new PurchaseReturnService();
