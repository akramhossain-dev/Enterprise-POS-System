import {
  InventoryLedger as PrismaLedger,
  Product,
  Warehouse,
  StockMovement,
  MovementType,
} from '@prisma/client';

export type PrismaLedgerWithRelations = PrismaLedger & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  movement: Pick<StockMovement, 'id' | 'movementType' | 'quantity'>;
};

export interface MappedLedgerEntry {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  productSku: string | null;
  movementId: string;
  movementType: MovementType;
  movementQty: string;
  runningQuantity: string;
  runningValue: string;
  createdAt: string;
}

export function mapLedgerEntry(l: PrismaLedgerWithRelations): MappedLedgerEntry {
  return {
    id: l.id,
    companyId: l.companyId,
    warehouseId: l.warehouseId,
    warehouseName: l.warehouse.name,
    warehouseCode: l.warehouse.code,
    productId: l.productId,
    productName: l.product.name,
    productSku: l.product.sku,
    movementId: l.movementId,
    movementType: l.movement.movementType,
    movementQty: l.movement.quantity.toString(),
    runningQuantity: l.runningQuantity.toString(),
    runningValue: l.runningValue.toString(),
    createdAt: l.createdAt.toISOString(),
  };
}

export function mapLedgerList(list: PrismaLedgerWithRelations[]): MappedLedgerEntry[] {
  return list.map(mapLedgerEntry);
}
