import { z } from 'zod';

export const dateFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export interface DateFilter {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}
