import { buildApp } from './app';
import { env } from './config';
import { createLogger } from './lib/logger';

const log = createLogger('server');

// ─────────────────────────────────────────────
// Bootstrap Server
// ─────────────────────────────────────────────

async function start(): Promise<void> {
  let server: Awaited<ReturnType<typeof buildApp>> | undefined;

  try {
    server = await buildApp();

    // Start listening
    await server.listen({
      port: env.PORT,
      host: '0.0.0.0', // Required for Docker
    });

    const portStr = String(env.PORT);
    log.info(`🚀 ${env.APP_NAME} started`);
    log.info(`   Mode    : ${env.NODE_ENV}`);
    log.info(`   Port    : ${portStr}`);
    log.info(`   API     : http://localhost:${portStr}/api/v1`);
    log.info(`   Docs    : http://localhost:${portStr}/docs`);
    log.info(`   Health  : http://localhost:${portStr}/api/v1/health`);
  } catch (error) {
    log.error({ error }, 'Fatal error during server startup');
    process.exit(1);
  }

  // ── Graceful Shutdown ──────────────────────

  const shutdown = async (signal: string): Promise<void> => {
    log.info(`Received ${signal} — starting graceful shutdown`);
    try {
      await server.close();
      log.info('Server closed successfully');
      process.exit(0);
    } catch (error) {
      log.error({ error }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Catch unhandled rejections to prevent silent crashes
  process.on('unhandledRejection', (reason) => {
    log.error({ reason }, 'Unhandled promise rejection');
    void shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    log.error({ error }, 'Uncaught exception');
    void shutdown('uncaughtException');
  });
}

void start();
