import { z } from 'zod';
import { GoodsReceiveStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(GoodsReceiveStatus) as [
  GoodsReceiveStatus,
  ...GoodsReceiveStatus[],
];

export const createGoodsReceiveItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().positive('Ordered quantity must be greater than 0'),
  receivedQuantity: z.coerce.number().positive('Received quantity must be greater than 0'),
  unitCost: z.coerce.number().positive('Unit cost must be greater than 0'),
  batchNumber: z.string().max(100).optional(),
  expiryDate: z.string().datetime({ offset: true }).optional(),
  serialRequired: z.boolean().default(false),
});

export const createGoodsReceiveSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  branchId: z.string().uuid('Invalid branch ID').optional(),
  warehouseId: z.string().uuid('Warehouse is required'),
  supplierId: z.string().uuid('Supplier is required'),
  purchaseOrderId: z.string().uuid('Purchase Order is required').optional(),
  receiveDate: z.string().datetime({ offset: true }).optional(),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
  remarks: z.string().max(2000, 'Remarks cannot exceed 2000 characters').optional(),
  items: z.array(createGoodsReceiveItemSchema).min(1, 'Minimum one item is required'),
});

export type CreateGoodsReceiveBody = z.infer<typeof createGoodsReceiveSchema>;

export const goodsReceiveQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    purchaseOrderId: z.string().uuid().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    grnNumber: z.string().optional(),
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

export type GoodsReceiveQuery = z.infer<typeof goodsReceiveQuerySchema>;
export type CreateGoodsReceiveItemInput = z.infer<typeof createGoodsReceiveItemSchema>;
export type CreateGoodsReceiveInput = z.infer<typeof createGoodsReceiveSchema>;
export type GoodsReceiveQueryInput = z.infer<typeof goodsReceiveQuerySchema>;
