import { z } from 'zod';
import { StockTakeStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(StockTakeStatus) as [StockTakeStatus, ...StockTakeStatus[]];
void STATUS_VALUES;

export const createStockTakeSchema = z.object({
  companyId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  title: z.string().min(3).max(300),
  conductedBy: z.string().uuid().optional(),
});
export type CreateStockTakeBody = z.infer<typeof createStockTakeSchema>;

export const addItemSchema = z.object({
  productId: z.string().uuid(),
  physicalQuantity: z.coerce.number().min(0),
  remarks: z.string().max(2000).optional(),
});
export type AddItemBody = z.infer<typeof addItemSchema>;

export const bulkAddItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        physicalQuantity: z.coerce.number().min(0),
        remarks: z.string().max(2000).optional(),
      }),
    )
    .min(1)
    .max(1000),
});
export type BulkAddItemsBody = z.infer<typeof bulkAddItemsSchema>;

export const stockTakeQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    companyId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    createdBy: z.string().uuid().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .transform((d) => ({ ...d, page: d.page ?? 1, limit: d.limit ?? 20 }));
export type StockTakeQuery = z.infer<typeof stockTakeQuerySchema>;
