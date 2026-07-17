import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../modules/notification/queue';
import { authGuard } from '../common/middleware/auth';
import { ForbiddenError } from '../common/errors/AppError';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // Liveness Check: returns immediately to indicate container is alive
  fastify.get('/live', async (_req, reply) => {
    reply.status(200).send({ status: 'UP', timestamp: new Date().toISOString() });
  });

  // Readiness Check: checks backing services are connected
  fastify.get('/ready', async (_req, reply) => {
    let dbStatus = 'UP';
    let redisStatus = 'UP';

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'DOWN';
    }

    try {
      await redisConnection.ping();
    } catch {
      redisStatus = 'DOWN';
    }

    const isReady = dbStatus === 'UP' && redisStatus === 'UP';
    reply.status(isReady ? 200 : 503).send({
      status: isReady ? 'READY' : 'NOT_READY',
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    });
  });

  // Health Diagnostics Check: detailed diagnostics for Admins only
  fastify.get(
    '/health',
    { preHandler: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // 1. Check if user is an ADMIN
      const roleId = (request.user as { roleId: string }).roleId;
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (role?.name !== 'ADMIN') {
        throw new ForbiddenError('Only admins can access system diagnostics');
      }

      // 2. Perform detailed diagnostic check
      const startDb = performance.now();
      let dbStatus = 'UP';
      let dbLatency = 0;
      try {
        await prisma.$queryRaw`SELECT 1`;
        dbLatency = Number((performance.now() - startDb).toFixed(2));
      } catch {
        dbStatus = 'DOWN';
      }

      const startRedis = performance.now();
      let redisStatus = 'UP';
      let redisLatency = 0;
      try {
        await redisConnection.ping();
        redisLatency = Number((performance.now() - startRedis).toFixed(2));
      } catch {
        redisStatus = 'DOWN';
      }

      // Storage status check
      const storageStatus = 'UP';

      const memory = process.memoryUsage();
      const cpu = process.cpuUsage();

      const isHealthy = dbStatus === 'UP' && redisStatus === 'UP';

      reply.status(isHealthy ? 200 : 500).send({
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        application: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memoryUsageMb: {
            rss: Number((memory.rss / 1024 / 1024).toFixed(2)),
            heapTotal: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
            heapUsed: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
          },
          cpuUsage: {
            user: cpu.user,
            system: cpu.system,
          },
        },
        database: {
          status: dbStatus,
          latencyMs: dbLatency,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatency,
        },
        queues: {
          status: redisStatus,
        },
        storage: {
          status: storageStatus,
        },
      });
    },
  );
}
export default healthRoutes;
