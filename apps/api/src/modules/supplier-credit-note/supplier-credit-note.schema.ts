import { z } from 'zod';

export const supplierCreditNoteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  status: z.string().optional(),
});

export const createSupplierCreditNoteSchema = z.object({
  companyId: z.string().uuid(),
  creditNoteNumber: z.string().min(1),
  supplierId: z.string().uuid(),
  referenceReturnId: z.string().uuid().optional().nullable(),
  referenceReturnNumber: z.string().optional().nullable(),
  creditAmount: z.number().positive(),
  status: z.string().default('ISSUED'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateSupplierCreditNoteSchema = z.object({
  creditNoteNumber: z.string().min(1).optional(),
  referenceReturnId: z.string().uuid().optional().nullable(),
  referenceReturnNumber: z.string().optional().nullable(),
  creditAmount: z.number().positive().optional(),
  status: z.string().optional(),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type SupplierCreditNoteQuery = z.infer<typeof supplierCreditNoteQuerySchema>;
export type CreateSupplierCreditNoteBody = z.infer<typeof createSupplierCreditNoteSchema>;
export type UpdateSupplierCreditNoteBody = z.infer<typeof updateSupplierCreditNoteSchema>;
