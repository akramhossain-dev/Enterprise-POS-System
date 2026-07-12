import client from 'prom-client';
import { createLogger } from './logger';

const log = createLogger('monitoring');

// ─────────────────────────────────────────────
// Prometheus Metrics Registry
// Uses prom-client for real metric exposition
// ─────────────────────────────────────────────

// Use the default registry for simplicity
const register = client.register;

// Collect default Node.js metrics (event loop lag, GC, memory, etc.)
client.collectDefaultMetrics({ register });

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
});

// Active HTTP connections gauge
const activeConnections = new client.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
});

// Database query duration histogram
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in milliseconds',
  labelNames: ['query'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});

// Background job duration histogram
const jobDuration = new client.Histogram({
  name: 'job_execution_duration_ms',
  help: 'Duration of background job executions in milliseconds',
  labelNames: ['job_name'],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000, 30000],
});

// ─────────────────────────────────────────────
// Monitoring Service Interface
// ─────────────────────────────────────────────

export interface MonitoringService {
  recordRequest(method: string, route: string, statusCode: number, durationMs: number): void;
  recordActiveConnections(count: number): void;
  recordDbQueryDuration(query: string, durationMs: number): void;
  recordJobDuration(jobName: string, durationMs: number): void;
}

export class PrometheusMonitoringService implements MonitoringService {
  recordRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    httpRequestDuration.labels(method, route, String(statusCode)).observe(durationMs);
    log.debug({ method, route, statusCode, durationMs }, 'HTTP request recorded');
  }

  recordActiveConnections(count: number): void {
    activeConnections.set(count);
  }

  recordDbQueryDuration(query: string, durationMs: number): void {
    dbQueryDuration.labels(query).observe(durationMs);
    log.debug({ query, durationMs }, 'DB query duration recorded');
  }

  recordJobDuration(jobName: string, durationMs: number): void {
    jobDuration.labels(jobName).observe(durationMs);
    log.debug({ jobName, durationMs }, 'Job duration recorded');
  }
}

export class OpenTelemetryMonitoringService implements MonitoringService {
  recordRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    log.debug({ method, route, statusCode, durationMs }, '[OTEL] http.server.request.duration');
  }

  recordActiveConnections(count: number): void {
    log.debug({ count }, '[OTEL] http.server.active_connections');
  }

  recordDbQueryDuration(query: string, durationMs: number): void {
    log.debug({ query, durationMs }, '[OTEL] db.client.connections.use');
  }

  recordJobDuration(jobName: string, durationMs: number): void {
    log.debug({ jobName, durationMs }, '[OTEL] messaging.process.duration');
  }
}

// Export Prometheus registry for /metrics endpoint
export { register as prometheusRegistry };

// Instantiate and export default monitoring singleton
export const monitoring: MonitoringService = new PrometheusMonitoringService();
export default monitoring;
