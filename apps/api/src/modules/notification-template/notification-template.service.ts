import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';

export async function renderTemplate(
  companyId: string,
  name: string,
  data: Record<string, string>,
): Promise<{ subject: string; body: string }> {
  const template = await prisma.notificationTemplate.findUnique({
    where: {
      companyId_name: { companyId, name },
    },
  });

  if (!template) {
    throw new NotFoundError(`Notification template "${name}" not found`);
  }

  let body = template.body;
  let subject = template.subject ?? 'POS Notification';

  // Replace placeholders in format {variableName}
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    body = body.replace(new RegExp(placeholder, 'g'), value);
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
  }

  return { subject, body };
}
