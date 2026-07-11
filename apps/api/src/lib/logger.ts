import pino, { Logger, LoggerOptions } from 'pino';
import { env, isDev } from '../config';

// ─────────────────────────────────────────────
// Pino Logger Configuration
// ─────────────────────────────────────────────

const baseOptions: LoggerOptions = {
  name: env.APP_NAME,
  level: isDev ? 'debug' : 'info',
  base: {
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
};

// Separate dev/prod config to satisfy exactOptionalPropertyTypes
const loggerOptions: LoggerOptions = isDev
  ? {
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '[{module}] {msg}',
          errorLikeObjectKeys: ['err', 'error'],
        },
      },
    }
  : baseOptions;

const logger: Logger = pino(loggerOptions);

// ─────────────────────────────────────────────
// Child logger factory
// ─────────────────────────────────────────────

/**
 * Creates a child logger with a module-scoped context.
 * Use this in each module: const log = createLogger('auth');
 */
export function createLogger(module: string): Logger {
  return logger.child({ module });
}

export { logger };
export default logger;
