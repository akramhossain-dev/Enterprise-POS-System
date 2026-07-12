import {
  PurchaseOrder as PrismaPurchaseOrder,
  PurchaseOrderItem as PrismaPurchaseOrderItem,
  Product,
  Warehouse,
  Supplier,
  PurchaseOrderStatus,
} from '@prisma/client';

export type PrismaPurchaseOrderItemWithProduct = PrismaPurchaseOrderItem & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
};

export type PrismaPurchaseOrderWithRelations = PrismaPurchaseOrder & {
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  supplier: Pick<Supplier, 'id' | 'companyName' | 'supplierCode'>;
  items: PrismaPurchaseOrderItemWithProduct[];
};

export interface MappedPurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: string;
  unitPrice: string;
  discount: string;
  tax: string;
  total: string;
}

export interface MappedPurchaseOrder {
  id: string;
  companyId: string;
  branchId: string | null;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  purchaseOrderNumber: string;
  orderDate: string;
  expectedDate: string | null;
  status: PurchaseOrderStatus;
  subtotal: string;
  discount: string;
  tax: string;
  shippingCost: string;
  grandTotal: string;
  remarks: string | null;
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  items: MappedPurchaseOrderItem[];
}

export function mapPurchaseOrderItem(
  i: PrismaPurchaseOrderItemWithProduct,
): MappedPurchaseOrderItem {
  return {
    id: i.id,
    productId: i.productId,
    productName: i.product.name,
    productSku: i.product.sku,
    quantity: i.quantity.toString(),
    unitPrice: i.unitPrice.toString(),
    discount: i.discount.toString(),
    tax: i.tax.toString(),
    total: i.total.toString(),
  };
}

export function mapPurchaseOrder(po: PrismaPurchaseOrderWithRelations): MappedPurchaseOrder {
  return {
    id: po.id,
    companyId: po.companyId,
    branchId: po.branchId,
    warehouseId: po.warehouseId,
    warehouseName: po.warehouse.name,
    warehouseCode: po.warehouse.code,
    supplierId: po.supplierId,
    supplierName: po.supplier.companyName,
    supplierCode: po.supplier.supplierCode,
    purchaseOrderNumber: po.purchaseOrderNumber,
    orderDate: po.orderDate.toISOString(),
    expectedDate: po.expectedDate?.toISOString() ?? null,
    status: po.status,
    subtotal: po.subtotal.toString(),
    discount: po.discount.toString(),
    tax: po.tax.toString(),
    shippingCost: po.shippingCost.toString(),
    grandTotal: po.grandTotal.toString(),
    remarks: po.remarks,
    createdBy: po.createdBy,
    approvedBy: po.approvedBy,
    createdAt: po.createdAt.toISOString(),
    updatedAt: po.updatedAt.toISOString(),
    items: po.items.map(mapPurchaseOrderItem),
  };
}

export function mapPurchaseOrderList(
  list: PrismaPurchaseOrderWithRelations[],
): MappedPurchaseOrder[] {
  return list.map(mapPurchaseOrder);
}
