import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './AppError';
import { createLogger } from '../../lib/logger';
import { sendError } from '../responses/error';

const log = createLogger('error-handler');

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // ── Zod validation errors ──────────────────
  if (error instanceof ZodError) {
    const errors = error.errors.map((e) => `${e.path.join('.')} — ${e.message}`);
    log.warn({ errors, url: request.url }, 'Zod validation error');
    reply.status(422).send(
      sendError({
        message: 'Validation failed',
        errors,
        statusCode: 422,
      }),
    );
    return;
  }

  // ── Custom AppError ────────────────────────
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      log.error({ error, url: request.url }, error.message);
    } else {
      log.warn({ error: error.message, code: error.code, url: request.url }, error.message);
    }
    reply.status(error.statusCode).send(
      sendError({
        message: error.statusCode >= 500 ? 'An unexpected internal error occurred' : error.message,
        errors: error.errors,
        statusCode: error.statusCode,
        code: error.code,
      }),
    );
    return;
  }

  // ── Fastify built-in errors (e.g., FST_ERR_*) ──
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    const fastifyError = error;
    const statusCode = fastifyError.statusCode ?? 500;

    // 404 from Fastify router
    if (statusCode === 404) {
      log.warn({ url: request.url, method: request.method }, 'Route not found');
      reply.status(404).send(
        sendError({
          message: `Route ${request.method} ${request.url} not found`,
          statusCode: 404,
        }),
      );
      return;
    }

    // Rate limit error
    if (statusCode === 429) {
      reply.status(429).send(
        sendError({
          message: fastifyError.message || 'Too many requests',
          statusCode: 429,
        }),
      );
      return;
    }

    // Generic Fastify error
    log.error({ error: fastifyError.message, statusCode, url: request.url }, 'Fastify error');

    // Secure masking: never return raw 500 or higher messages to client
    const safeMessage =
      statusCode >= 500
        ? 'An unexpected internal error occurred'
        : fastifyError.message || 'An unexpected error occurred';

    reply.status(statusCode).send(
      sendError({
        message: safeMessage,
        statusCode,
      }),
    );
    return;
  }

  // ── Unhandled / unknown errors ─────────────
  log.error({ error, url: request.url }, 'Unhandled internal error');
  reply.status(500).send(
    sendError({
      message: 'An unexpected internal error occurred',
      statusCode: 500,
    }),
  );
}
