// ─────────────────────────────────────────────
// Stock Movement Module — Service
// ─────────────────────────────────────────────

import { NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import { StockMovementQuery } from './stock-movement.schema';
import {
  findMovements,
  findMovementById as repoFindById,
  findMovementsByProduct,
  findMovementsByWarehouse,
} from './stock-movement.repository';
import {
  mapStockMovement,
  mapStockMovementList,
  MappedStockMovement,
} from './stock-movement.mapper';

export async function listStockMovements(query: StockMovementQuery): Promise<{
  movements: MappedStockMovement[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { movements, meta } = await findMovements(query);
  return { movements: mapStockMovementList(movements), meta };
}

export async function getStockMovementById(id: string): Promise<MappedStockMovement> {
  const m = await repoFindById(id);
  if (!m) {
    throw new NotFoundError(`Stock movement with ID "${id}" not found`);
  }
  return mapStockMovement(m);
}

export async function getMovementsByProduct(
  productId: string,
  query: { page?: number; limit?: number },
): Promise<{
  movements: MappedStockMovement[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { movements, meta } = await findMovementsByProduct(productId, query);
  return { movements: mapStockMovementList(movements), meta };
}

export async function getMovementsByWarehouse(
  warehouseId: string,
  query: { page?: number; limit?: number },
): Promise<{
  movements: MappedStockMovement[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { movements, meta } = await findMovementsByWarehouse(warehouseId, query);
  return { movements: mapStockMovementList(movements), meta };
}
