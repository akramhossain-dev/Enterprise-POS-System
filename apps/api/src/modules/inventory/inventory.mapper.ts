// ─────────────────────────────────────────────
// Inventory Module — Mapper
// ─────────────────────────────────────────────

import { Inventory as PrismaInventory, Product, Warehouse } from '@prisma/client';

export type PrismaInventoryWithRelations = PrismaInventory & {
  product: Pick<Product, 'id' | 'name' | 'sku' | 'barcode' | 'status'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
};

export interface MappedInventory {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  sku: string | null;
  barcode: string | null;
  availableQuantity: string;
  reservedQuantity: string;
  damagedQuantity: string;
  minimumQuantity: string;
  reorderQuantity: string;
  maximumQuantity: string | null;
  averageCost: string;
  lastPurchasePrice: string;
  hasOpeningStock: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapInventory(inv: PrismaInventoryWithRelations): MappedInventory {
  const available = Number(inv.availableQuantity);
  const minimum = Number(inv.minimumQuantity);

  return {
    id: inv.id,
    companyId: inv.companyId,
    warehouseId: inv.warehouseId,
    warehouseName: inv.warehouse.name,
    warehouseCode: inv.warehouse.code,
    productId: inv.productId,
    productName: inv.product.name,
    sku: inv.product.sku,
    barcode: inv.product.barcode,
    availableQuantity: inv.availableQuantity.toString(),
    reservedQuantity: inv.reservedQuantity.toString(),
    damagedQuantity: inv.damagedQuantity.toString(),
    minimumQuantity: inv.minimumQuantity.toString(),
    reorderQuantity: inv.reorderQuantity.toString(),
    maximumQuantity: inv.maximumQuantity ? inv.maximumQuantity.toString() : null,
    averageCost: inv.averageCost.toString(),
    lastPurchasePrice: inv.lastPurchasePrice.toString(),
    hasOpeningStock: inv.hasOpeningStock,
    isLowStock: available > 0 && available < minimum,
    isOutOfStock: available === 0,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  };
}

export function mapInventoryList(inventories: PrismaInventoryWithRelations[]): MappedInventory[] {
  return inventories.map(mapInventory);
}
