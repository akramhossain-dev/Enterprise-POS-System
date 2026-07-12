import { NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import { AlertQuery, ScanAlertBody } from './stock-alert.schema';
import {
  findAlerts,
  findAlertById,
  resolveAlert,
  scanAndGenerateAlerts,
  getReorderSuggestions,
} from './stock-alert.repository';
import { mapAlert, mapAlertList, MappedAlert, ReorderSuggestion } from './stock-alert.mapper';

export async function listAlerts(
  query: AlertQuery,
): Promise<{ alerts: MappedAlert[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { alerts, meta } = await findAlerts(query);
  return { alerts: mapAlertList(alerts), meta };
}

export async function getAlertById(id: string): Promise<MappedAlert> {
  const a = await findAlertById(id);
  if (!a) {
    throw new NotFoundError(`Stock alert "${id}" not found`);
  }
  return mapAlert(a);
}

export async function resolveStockAlert(id: string, actorId: string): Promise<MappedAlert> {
  const a = await findAlertById(id);
  if (!a) {
    throw new NotFoundError(`Stock alert "${id}" not found`);
  }
  return mapAlert(await resolveAlert(id, actorId));
}

export async function runAlertScan(
  body: ScanAlertBody,
): Promise<{ created: number; resolved: number }> {
  return scanAndGenerateAlerts(body.companyId, body.warehouseId);
}

export async function fetchReorderSuggestions(body: ScanAlertBody): Promise<ReorderSuggestion[]> {
  const raw = await getReorderSuggestions(body.companyId, body.warehouseId);
  return raw;
}
