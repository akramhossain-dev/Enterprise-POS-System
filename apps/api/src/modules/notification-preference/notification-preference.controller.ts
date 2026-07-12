import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody } from '../../common/utils/validate';
import { updatePreferenceSchema } from './notification-preference.schema';
import { getUserPreferences, updateUserPreference } from './notification-preference.service';

export async function getUserPreferencesHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };

  const data = await getUserPreferences(actor.id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Notification preferences fetched successfully', data }));
}

export async function updateUserPreferenceHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const body = validateBody(updatePreferenceSchema, req.body);

  const updates: { emailEnabled?: boolean; pushEnabled?: boolean; inAppEnabled?: boolean } = {};
  if (body.emailEnabled !== undefined) {
    updates.emailEnabled = body.emailEnabled;
  }
  if (body.pushEnabled !== undefined) {
    updates.pushEnabled = body.pushEnabled;
  }
  if (body.inAppEnabled !== undefined) {
    updates.inAppEnabled = body.inAppEnabled;
  }

  const data = await updateUserPreference(actor.id, body.type, updates);

  reply
    .status(200)
    .send(sendSuccess({ message: 'Notification preference updated successfully', data }));
}
