import { z } from 'zod';

export const purchaseRequisitionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  q: z.string().optional(),
  companyId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z
    .enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED'])
    .optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const requisitionItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().positive(),
});

export const createPurchaseRequisitionSchema = z.object({
  companyId: z.string().uuid('companyId must be a valid UUID'),
  title: z.string().trim().min(1, 'Title is required'),
  requestedBy: z.string().trim().min(1, 'Requested by name is required'),
  department: z.string().trim().min(1, 'Department name is required'),
  requiredDate: z.string(), // ISO string
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  supplierId: z.string().uuid('supplierId must be a valid UUID'),
  warehouseId: z.string().uuid('warehouseId must be a valid UUID'),
  notes: z.string().trim().optional(),
  items: z.array(requisitionItemSchema).nonempty('At least one item is required'),
});

export const updatePurchaseRequisitionSchema = z.object({
  title: z.string().trim().min(1).optional(),
  requestedBy: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  requiredDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z
    .enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED'])
    .optional(),
  supplierId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  notes: z.string().trim().optional(),
  items: z.array(requisitionItemSchema).optional(),
});

export type PurchaseRequisitionQuery = z.infer<typeof purchaseRequisitionQuerySchema>;
export type CreatePurchaseRequisitionBody = z.infer<typeof createPurchaseRequisitionSchema>;
export type UpdatePurchaseRequisitionBody = z.infer<typeof updatePurchaseRequisitionSchema>;
export type PurchaseRequisitionItemInput = z.infer<typeof requisitionItemSchema>;
