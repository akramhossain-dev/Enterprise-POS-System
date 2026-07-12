import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const updatePreferenceSchema = z.object({
  type: z.nativeEnum(NotificationType, { message: 'Invalid notification type' }),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
});

export type UpdatePreferenceBody = z.infer<typeof updatePreferenceSchema>;
