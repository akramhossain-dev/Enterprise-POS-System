// ─────────────────────────────────────────────
// Stock Transfer Module — Mapper
// ─────────────────────────────────────────────

import {
  StockTransfer as PrismaStockTransfer,
  StockTransferItem as PrismaStockTransferItem,
  Product,
  Warehouse,
  TransferStatus,
} from '@prisma/client';

export type PrismaTransferItemWithProduct = PrismaStockTransferItem & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
};

export type PrismaTransferWithRelations = PrismaStockTransfer & {
  fromWarehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  toWarehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  items: PrismaTransferItemWithProduct[];
};

export interface MappedTransferItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: string;
}

export interface MappedStockTransfer {
  id: string;
  companyId: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  fromWarehouseCode: string;
  toWarehouseId: string;
  toWarehouseName: string;
  toWarehouseCode: string;
  status: TransferStatus;
  remarks: string | null;
  createdBy: string;
  approvedBy: string | null;
  items: MappedTransferItem[];
  createdAt: string;
  updatedAt: string;
}

export function mapTransferItem(item: PrismaTransferItemWithProduct): MappedTransferItem {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSku: item.product.sku,
    quantity: item.quantity.toString(),
  };
}

export function mapTransfer(t: PrismaTransferWithRelations): MappedStockTransfer {
  return {
    id: t.id,
    companyId: t.companyId,
    fromWarehouseId: t.fromWarehouseId,
    fromWarehouseName: t.fromWarehouse.name,
    fromWarehouseCode: t.fromWarehouse.code,
    toWarehouseId: t.toWarehouseId,
    toWarehouseName: t.toWarehouse.name,
    toWarehouseCode: t.toWarehouse.code,
    status: t.status,
    remarks: t.remarks,
    createdBy: t.createdBy,
    approvedBy: t.approvedBy,
    items: t.items.map(mapTransferItem),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export function mapTransferList(transfers: PrismaTransferWithRelations[]): MappedStockTransfer[] {
  return transfers.map(mapTransfer);
}
