import { z } from 'zod';

export const createJournalEntryItemSchema = z
  .object({
    accountId: z.string().uuid('Invalid account ID'),
    debit: z.number().nonnegative('Debit cannot be negative'),
    credit: z.number().nonnegative('Credit cannot be negative'),
  })
  .refine(
    (data) => (data.debit > 0 && data.credit === 0) || (data.credit > 0 && data.debit === 0),
    { message: 'Line must contain either a debit or a credit, but not both or neither' },
  );

export const createJournalEntrySchema = z
  .object({
    date: z.coerce.date(),
    description: z.string().max(1000).optional().nullable(),
    referenceType: z.string().max(100).optional().nullable(),
    referenceId: z.string().uuid('Invalid reference ID').optional().nullable(),
    items: z.array(createJournalEntryItemSchema).min(2, 'Journal entry must have at least 2 items'),
  })
  .superRefine((data, ctx) => {
    const debitSum = data.items.reduce((sum, item) => sum + item.debit, 0);
    const creditSum = data.items.reduce((sum, item) => sum + item.credit, 0);

    if (Math.abs(debitSum - creditSum) > 0.0001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Journal entry is not balanced. Total Debit (${debitSum.toFixed(4)}) must equal Total Credit (${creditSum.toFixed(4)}).`,
        path: ['items'],
      });
    }
  });

export type CreateJournalEntryPayload = z.infer<typeof createJournalEntrySchema>;
export type CreateJournalEntryItem = z.infer<typeof createJournalEntryItemSchema>;
export interface JournalEntryQuery {
  page?: number;
  limit?: number;
}
