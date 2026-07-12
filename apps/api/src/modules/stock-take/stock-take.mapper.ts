import {
  StockTake as PrismaStockTake,
  StockTakeItem as PrismaItem,
  Product,
  Warehouse,
  StockTakeStatus,
} from '@prisma/client';

export type PrismaItemWithProduct = PrismaItem & { product: Pick<Product, 'id' | 'name' | 'sku'> };

export type PrismaStockTakeWithRelations = PrismaStockTake & {
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  items: PrismaItemWithProduct[];
};

export interface MappedStockTakeItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  systemQuantity: string;
  physicalQuantity: string | null;
  variance: string | null;
  remarks: string | null;
}

export interface MappedStockTake {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  title: string;
  status: StockTakeStatus;
  conductedBy: string | null;
  createdBy: string;
  itemCount: number;
  totalVariance: string;
  items: MappedStockTakeItem[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapItem(i: PrismaItemWithProduct): MappedStockTakeItem {
  return {
    id: i.id,
    productId: i.productId,
    productName: i.product.name,
    productSku: i.product.sku,
    systemQuantity: i.systemQuantity.toString(),
    physicalQuantity: i.physicalQuantity?.toString() ?? null,
    variance: i.variance?.toString() ?? null,
    remarks: i.remarks,
  };
}

export function mapStockTake(st: PrismaStockTakeWithRelations): MappedStockTake {
  const totalVariance = st.items.reduce((sum, i) => {
    return i.variance ? sum + Number(i.variance.toString()) : sum;
  }, 0);

  return {
    id: st.id,
    companyId: st.companyId,
    warehouseId: st.warehouseId,
    warehouseName: st.warehouse.name,
    warehouseCode: st.warehouse.code,
    title: st.title,
    status: st.status,
    conductedBy: st.conductedBy,
    createdBy: st.createdBy,
    itemCount: st.items.length,
    totalVariance: totalVariance.toFixed(4),
    items: st.items.map(mapItem),
    completedAt: st.completedAt?.toISOString() ?? null,
    createdAt: st.createdAt.toISOString(),
    updatedAt: st.updatedAt.toISOString(),
  };
}

export function mapStockTakeList(list: PrismaStockTakeWithRelations[]): MappedStockTake[] {
  return list.map(mapStockTake);
}
