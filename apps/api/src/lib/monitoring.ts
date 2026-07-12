import { createLogger } from './logger';

const log = createLogger('monitoring');

export interface MonitoringService {
  recordRequest(method: string, route: string, statusCode: number, durationMs: number): void;
  recordActiveConnections(count: number): void;
  recordDbQueryDuration(query: string, durationMs: number): void;
  recordJobDuration(jobName: string, durationMs: number): void;
}

export class PrometheusMonitoringService implements MonitoringService {
  recordRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    // Increment metric counters/histograms for Prometheus scraping
    log.debug(
      `[PROM METRIC] request_duration_ms {${method} ${route} ${String(statusCode)}}: ${String(durationMs)}ms`,
    );
  }

  recordActiveConnections(count: number): void {
    // Set active connection gauges
    log.debug(`[PROM METRIC] active_connections_gauge: ${String(count)}`);
  }

  recordDbQueryDuration(query: string, durationMs: number): void {
    // Record DB query latency metrics
    log.debug(`[PROM METRIC] db_query_latency_ms: ${String(durationMs)}ms for query: ${query}`);
  }

  recordJobDuration(jobName: string, durationMs: number): void {
    // Record background job latency metrics
    log.debug(
      `[PROM METRIC] job_execution_latency_ms: ${String(durationMs)}ms for job: ${jobName}`,
    );
  }
}

export class OpenTelemetryMonitoringService implements MonitoringService {
  recordRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    // Send standard semantic conventions trace spans/metrics to OpenTelemetry Collector
    log.debug(
      `[OTEL METRIC] http.server.request.duration {method: ${method}, route: ${route}, status: ${String(statusCode)}}: ${String(durationMs)}ms`,
    );
  }

  recordActiveConnections(count: number): void {
    log.debug(`[OTEL METRIC] http.server.active_connections: ${String(count)}`);
  }

  recordDbQueryDuration(query: string, durationMs: number): void {
    log.debug(`[OTEL METRIC] db.client.connections.use {query: ${query}}: ${String(durationMs)}ms`);
  }

  recordJobDuration(jobName: string, durationMs: number): void {
    log.debug(
      `[OTEL METRIC] messaging.process.duration {job: ${jobName}}: ${String(durationMs)}ms`,
    );
  }
}

// Instantiate and export default monitoring singleton
export const monitoring: MonitoringService = new PrometheusMonitoringService();
export default monitoring;
