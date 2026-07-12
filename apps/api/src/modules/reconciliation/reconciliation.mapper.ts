import {
  Reconciliation as PrismaRecon,
  StockTake,
  StockTakeItem,
  Product,
  Warehouse,
  ReconciliationStatus,
} from '@prisma/client';

type StockTakeWithItems = StockTake & {
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  items: (StockTakeItem & { product: Pick<Product, 'id' | 'name' | 'sku'> })[];
};

export type PrismaReconWithRelations = PrismaRecon & {
  stockTake: StockTakeWithItems;
};

export interface MappedVarianceItem {
  productId: string;
  productName: string;
  systemQuantity: string;
  physicalQuantity: string;
  variance: string;
  adjustmentType: 'INCREASE' | 'DECREASE' | 'NO_CHANGE';
}

export interface MappedReconciliation {
  id: string;
  companyId: string;
  stockTakeId: string;
  warehouseId: string;
  warehouseName: string;
  status: ReconciliationStatus;
  remarks: string | null;
  approvedBy: string | null;
  createdBy: string;
  variances: MappedVarianceItem[];
  varianceCount: number;
  createdAt: string;
  updatedAt: string;
}

export function mapReconciliation(r: PrismaReconWithRelations): MappedReconciliation {
  const variances: MappedVarianceItem[] = r.stockTake.items
    .filter((i) => i.physicalQuantity !== null)
    .map((i) => {
      const physQty = i.physicalQuantity ?? i.systemQuantity;
      const variance = i.variance ?? physQty.sub(i.systemQuantity);
      const varNum = Number(variance.toString());
      return {
        productId: i.productId,
        productName: i.product.name,
        systemQuantity: i.systemQuantity.toString(),
        physicalQuantity: physQty.toString(),
        variance: variance.toString(),
        adjustmentType: varNum > 0 ? 'INCREASE' : varNum < 0 ? 'DECREASE' : 'NO_CHANGE',
      };
    });

  return {
    id: r.id,
    companyId: r.companyId,
    stockTakeId: r.stockTakeId,
    warehouseId: r.stockTake.warehouseId,
    warehouseName: r.stockTake.warehouse.name,
    status: r.status,
    remarks: r.remarks,
    approvedBy: r.approvedBy,
    createdBy: r.createdBy,
    variances,
    varianceCount: variances.filter((v) => v.adjustmentType !== 'NO_CHANGE').length,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function mapReconciliationList(list: PrismaReconWithRelations[]): MappedReconciliation[] {
  return list.map(mapReconciliation);
}
