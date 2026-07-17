import { z } from 'zod';

export const supplierDebitNoteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  status: z.string().optional(),
});

export const createSupplierDebitNoteSchema = z.object({
  companyId: z.string().uuid(),
  debitNoteNumber: z.string().min(1),
  supplierId: z.string().uuid(),
  referenceReturnId: z.string().uuid().optional().nullable(),
  referenceReturnNumber: z.string().optional().nullable(),
  amount: z.number().positive(),
  status: z.string().default('ISSUED'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateSupplierDebitNoteSchema = z.object({
  debitNoteNumber: z.string().min(1).optional(),
  referenceReturnId: z.string().uuid().optional().nullable(),
  referenceReturnNumber: z.string().optional().nullable(),
  amount: z.number().positive().optional(),
  status: z.string().optional(),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type SupplierDebitNoteQuery = z.infer<typeof supplierDebitNoteQuerySchema>;
export type CreateSupplierDebitNoteBody = z.infer<typeof createSupplierDebitNoteSchema>;
export type UpdateSupplierDebitNoteBody = z.infer<typeof updateSupplierDebitNoteSchema>;
