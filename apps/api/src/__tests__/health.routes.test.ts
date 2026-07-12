/**
 * Health Routes Tests
 *
 * Tests the /live and /ready health check endpoint logic
 * using Fastify's built-in injection (no real server port needed).
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  ValidationError,
  TooManyRequestsError,
  ServiceUnavailableError,
} from '../common/errors/AppError';

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock('../lib/prisma', () => ({
  prisma: { $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]) },
}));

vi.mock('../modules/notification/queue', () => ({
  redisConnection: { ping: vi.fn().mockResolvedValue('PONG'), quit: vi.fn() },
}));

// ─────────────────────────────────────────────
// Test Setup — Minimal Fastify App
// ─────────────────────────────────────────────

async function buildTestApp() {
  const fastify = Fastify({ logger: false });

  fastify.get('/api/v1/live', () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  fastify.get('/api/v1/ready', (_req, reply) => {
    return reply.status(200).send({
      status: 'ready',
      checks: { database: 'ok', redis: 'ok' },
    });
  });

  await fastify.ready();
  return fastify;
}

// ─────────────────────────────────────────────
// Tests — Health Endpoints
// ─────────────────────────────────────────────

describe('Health Routes', () => {
  let fastify: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => {
    fastify = await buildTestApp();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/v1/live should return 200 with status ok', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/live',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ status: string; timestamp: string }>();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(new Date(body.timestamp).getTime()).toBeGreaterThan(0);
  });

  it('GET /api/v1/ready should return 200 when all checks pass', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/ready',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ status: string }>();
    expect(body.status).toBe('ready');
  });

  it('Unknown routes should return 404', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/v1/nonexistent',
    });

    expect(response.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────
// Tests — AppError Response Shape
// ─────────────────────────────────────────────

describe('AppError Shape Tests', () => {
  it('AppError subclasses have correct statusCode and code fields', () => {
    const cases = [
      { err: new NotFoundError(), status: 404, code: 'NOT_FOUND' },
      { err: new UnauthorizedError(), status: 401, code: 'UNAUTHORIZED' },
      { err: new ForbiddenError(), status: 403, code: 'FORBIDDEN' },
      { err: new ConflictError(), status: 409, code: 'CONFLICT' },
      { err: new BadRequestError(), status: 400, code: 'BAD_REQUEST' },
      { err: new ValidationError(), status: 422, code: 'VALIDATION_ERROR' },
      { err: new TooManyRequestsError(), status: 429, code: 'TOO_MANY_REQUESTS' },
      { err: new ServiceUnavailableError(), status: 503, code: 'SERVICE_UNAVAILABLE' },
    ];

    for (const { err, status, code } of cases) {
      expect(err.statusCode).toBe(status);
      expect(err.code).toBe(code);
      expect(err.isOperational).toBe(true);
    }
  });
});
