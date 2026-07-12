// ─────────────────────────────────────────────
// Stock Movement Module — Mapper
// ─────────────────────────────────────────────

import {
  StockMovement as PrismaStockMovement,
  Product,
  Warehouse,
  MovementType,
} from '@prisma/client';

export type PrismaMovementWithRelations = PrismaStockMovement & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
};

export interface MappedStockMovement {
  id: string;
  companyId: string;
  branchId: string | null;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  productSku: string | null;
  movementType: MovementType;
  direction: 'IN' | 'OUT';
  referenceType: string | null;
  referenceId: string | null;
  quantity: string;
  previousQuantity: string;
  newQuantity: string;
  unitCost: string | null;
  remarks: string | null;
  performedBy: string;
  createdAt: string;
}

const INBOUND_TYPES = new Set<MovementType>([
  MovementType.OPENING_STOCK,
  MovementType.PURCHASE,
  MovementType.SALE_RETURN,
  MovementType.TRANSFER_IN,
  MovementType.ADJUSTMENT_IN,
]);

export function mapStockMovement(m: PrismaMovementWithRelations): MappedStockMovement {
  return {
    id: m.id,
    companyId: m.companyId,
    branchId: m.branchId,
    warehouseId: m.warehouseId,
    warehouseName: m.warehouse.name,
    warehouseCode: m.warehouse.code,
    productId: m.productId,
    productName: m.product.name,
    productSku: m.product.sku,
    movementType: m.movementType,
    direction: INBOUND_TYPES.has(m.movementType) ? 'IN' : 'OUT',
    referenceType: m.referenceType,
    referenceId: m.referenceId,
    quantity: m.quantity.toString(),
    previousQuantity: m.previousQuantity.toString(),
    newQuantity: m.newQuantity.toString(),
    unitCost: m.unitCost ? m.unitCost.toString() : null,
    remarks: m.remarks,
    performedBy: m.performedBy,
    createdAt: m.createdAt.toISOString(),
  };
}

export function mapStockMovementList(items: PrismaMovementWithRelations[]): MappedStockMovement[] {
  return items.map(mapStockMovement);
}
