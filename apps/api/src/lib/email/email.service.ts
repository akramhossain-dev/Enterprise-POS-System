import nodemailer, { SentMessageInfo } from 'nodemailer';
import { env } from '../../config';
import { createLogger } from '../logger';

const log = createLogger('email-service');

// ─────────────────────────────────────────────
// Email Service (Nodemailer SMTP)
// ─────────────────────────────────────────────

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates a nodemailer transporter from environment SMTP config.
 * Falls back to a JSON-logger transporter if no SMTP config is set.
 */
function createTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_SECURE ?? false, // true for port 465, false for 587
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

/**
 * Send an email. If SMTP is not configured, logs the email for dev/testing.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, html, text } = payload;

  if (!transporter) {
    // Dev mode: log email instead of sending
    log.warn(
      {
        to,
        subject,
        preview: html.slice(0, 200),
      },
      '[EMAIL] SMTP not configured — email logged only (set SMTP_* env vars to enable real sending)',
    );
    return;
  }

  const from = env.SMTP_FROM ?? env.SMTP_USER;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const info: SentMessageInfo = await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]*>/g, ''), // Auto-strip HTML for text fallback
    });

    const messageId = (info as { messageId?: string }).messageId ?? 'unknown';
    log.info({ messageId, to, subject }, 'Email sent successfully');
  } catch (error) {
    log.error({ error, to, subject }, 'Failed to send email');
    throw error;
  }
}

/**
 * Verify SMTP connection is working (use during health check if needed).
 */
export async function verifyEmailConnection(): Promise<boolean> {
  if (!transporter) {
    return false;
  }
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
