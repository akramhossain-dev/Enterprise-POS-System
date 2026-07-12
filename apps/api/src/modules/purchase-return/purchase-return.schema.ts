import { z } from 'zod';
import { PurchaseReturnStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(PurchaseReturnStatus) as [
  PurchaseReturnStatus,
  ...PurchaseReturnStatus[],
];

export const createPurchaseReturnItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().positive('Return quantity must be greater than 0'),
  unitCost: z.coerce.number().positive('Unit cost must be greater than 0'),
});

export const createPurchaseReturnSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  branchId: z.string().uuid('Invalid branch ID').optional(),
  warehouseId: z.string().uuid('Warehouse is required'),
  supplierId: z.string().uuid('Supplier is required'),
  goodsReceiveId: z.string().uuid('Goods Receive Note is required'),
  returnDate: z.string().datetime({ offset: true }).optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  reason: z.string().max(2000, 'Reason cannot exceed 2000 characters').optional(),
  items: z.array(createPurchaseReturnItemSchema).min(1, 'Minimum one item is required'),
});

export type CreatePurchaseReturnBody = z.infer<typeof createPurchaseReturnSchema>;
export type CreatePurchaseReturnItemInput = z.infer<typeof createPurchaseReturnItemSchema>;

export const purchaseReturnQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    goodsReceiveId: z.string().uuid().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    returnNumber: z.string().optional(),
    dateFrom: z.string().datetime({ offset: true }).optional(),
    dateTo: z.string().datetime({ offset: true }).optional(),
    search: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({
    ...d,
    page: d.page ?? 1,
    limit: d.limit ?? 20,
    dateFrom: d.dateFrom ? new Date(d.dateFrom) : undefined,
    dateTo: d.dateTo ? new Date(d.dateTo) : undefined,
  }));

export type PurchaseReturnQuery = z.infer<typeof purchaseReturnQuerySchema>;
export type PurchaseReturnQueryInput = z.infer<typeof purchaseReturnQuerySchema>;
export type CreatePurchaseReturnInput = z.infer<typeof createPurchaseReturnSchema>;
