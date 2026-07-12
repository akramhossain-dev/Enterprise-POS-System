import {
  StockAlert as PrismaAlert,
  Product,
  Warehouse,
  AlertType,
  AlertStatus,
} from '@prisma/client';

export type PrismaAlertWithRelations = PrismaAlert & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
};

export interface MappedAlert {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  productSku: string | null;
  alertType: AlertType;
  currentQuantity: string;
  minimumQuantity: string;
  reorderQuantity: string;
  status: AlertStatus;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
}

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: string;
  minimumQuantity: string;
  reorderQuantity: string;
  suggestedOrderQty: string;
}

export function mapAlert(a: PrismaAlertWithRelations): MappedAlert {
  return {
    id: a.id,
    companyId: a.companyId,
    warehouseId: a.warehouseId,
    warehouseName: a.warehouse.name,
    warehouseCode: a.warehouse.code,
    productId: a.productId,
    productName: a.product.name,
    productSku: a.product.sku,
    alertType: a.alertType,
    currentQuantity: a.currentQuantity.toString(),
    minimumQuantity: a.minimumQuantity.toString(),
    reorderQuantity: a.reorderQuantity.toString(),
    status: a.status,
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
    resolvedBy: a.resolvedBy,
    createdAt: a.createdAt.toISOString(),
  };
}

export function mapAlertList(list: PrismaAlertWithRelations[]): MappedAlert[] {
  return list.map(mapAlert);
}
