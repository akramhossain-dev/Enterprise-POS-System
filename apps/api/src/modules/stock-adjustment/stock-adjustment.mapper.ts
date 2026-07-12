// ─────────────────────────────────────────────
// Stock Adjustment Module — Mapper
// ─────────────────────────────────────────────

import {
  StockAdjustment as PrismaStockAdjustment,
  Product,
  Warehouse,
  AdjustmentType,
} from '@prisma/client';

export type PrismaAdjustmentWithRelations = PrismaStockAdjustment & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
};

export interface MappedStockAdjustment {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  productSku: string | null;
  type: AdjustmentType;
  quantity: string;
  reason: string;
  remarks: string | null;
  approvedBy: string | null;
  createdBy: string;
  createdAt: string;
}

export function mapAdjustment(a: PrismaAdjustmentWithRelations): MappedStockAdjustment {
  return {
    id: a.id,
    companyId: a.companyId,
    warehouseId: a.warehouseId,
    warehouseName: a.warehouse.name,
    warehouseCode: a.warehouse.code,
    productId: a.productId,
    productName: a.product.name,
    productSku: a.product.sku,
    type: a.type,
    quantity: a.quantity.toString(),
    reason: a.reason,
    remarks: a.remarks,
    approvedBy: a.approvedBy,
    createdBy: a.createdBy,
    createdAt: a.createdAt.toISOString(),
  };
}

export function mapAdjustmentList(
  adjustments: PrismaAdjustmentWithRelations[],
): MappedStockAdjustment[] {
  return adjustments.map(mapAdjustment);
}
