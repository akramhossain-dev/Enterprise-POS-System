import { Batch as PrismaBatch, Product, Warehouse, BatchStatus } from '@prisma/client';

export type PrismaBatchWithRelations = PrismaBatch & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
};

export interface MappedBatch {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  productSku: string | null;
  batchNumber: string;
  manufacturingDate: string | null;
  expiryDate: string | null;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  quantity: string;
  status: BatchStatus;
  remarks: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

function calcDaysUntilExpiry(expiryDate: Date | null): number | null {
  if (!expiryDate) {
    return null;
  }
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function mapBatch(b: PrismaBatchWithRelations): MappedBatch {
  const days = calcDaysUntilExpiry(b.expiryDate);
  return {
    id: b.id,
    companyId: b.companyId,
    warehouseId: b.warehouseId,
    warehouseName: b.warehouse.name,
    warehouseCode: b.warehouse.code,
    productId: b.productId,
    productName: b.product.name,
    productSku: b.product.sku,
    batchNumber: b.batchNumber,
    manufacturingDate: b.manufacturingDate?.toISOString() ?? null,
    expiryDate: b.expiryDate?.toISOString() ?? null,
    isExpired: days !== null && days <= 0,
    daysUntilExpiry: days,
    quantity: b.quantity.toString(),
    status: b.status,
    remarks: b.remarks,
    createdBy: b.createdBy,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export function mapBatchList(batches: PrismaBatchWithRelations[]): MappedBatch[] {
  return batches.map(mapBatch);
}
