import { z } from 'zod';
import { PurchaseOrderStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(PurchaseOrderStatus) as [
  PurchaseOrderStatus,
  ...PurchaseOrderStatus[],
];

export const createPurchaseOrderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().positive('Unit price must be greater than 0'),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
});

export const createPurchaseOrderSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  branchId: z.string().uuid('Invalid branch ID').optional(),
  warehouseId: z.string().uuid('Warehouse is required'),
  supplierId: z.string().uuid('Supplier is required'),
  orderDate: z.string().datetime({ offset: true }).optional(),
  expectedDate: z.string().datetime({ offset: true }).optional(),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
  shippingCost: z.coerce.number().nonnegative('Shipping cost cannot be negative').optional(),
  remarks: z.string().max(2000, 'Remarks cannot exceed 2000 characters').optional(),
  items: z.array(createPurchaseOrderItemSchema).min(1, 'Minimum one item is required'),
});

export type CreatePurchaseOrderBody = z.infer<typeof createPurchaseOrderSchema>;

export const updatePurchaseOrderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().positive('Unit price must be greater than 0'),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
});

export const updatePurchaseOrderSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID').optional(),
  warehouseId: z.string().uuid('Warehouse is required').optional(),
  supplierId: z.string().uuid('Supplier is required').optional(),
  orderDate: z.string().datetime({ offset: true }).optional(),
  expectedDate: z.string().datetime({ offset: true }).optional(),
  discount: z.coerce.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').optional(),
  shippingCost: z.coerce.number().nonnegative('Shipping cost cannot be negative').optional(),
  remarks: z.string().max(2000, 'Remarks cannot exceed 2000 characters').optional(),
  items: z.array(updatePurchaseOrderItemSchema).min(1, 'Minimum one item is required').optional(),
});

export type UpdatePurchaseOrderBody = z.infer<typeof updatePurchaseOrderSchema>;

export const purchaseOrderQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    purchaseOrderNumber: z.string().optional(),
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

export type PurchaseOrderQuery = z.infer<typeof purchaseOrderQuerySchema>;
