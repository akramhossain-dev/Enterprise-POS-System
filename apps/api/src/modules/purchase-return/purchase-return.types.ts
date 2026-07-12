import {
  PurchaseReturn as PrismaPurchaseReturn,
  PurchaseReturnItem as PrismaPurchaseReturnItem,
  Product,
  Warehouse,
  Supplier,
  GoodsReceive,
  PurchaseReturnStatus,
} from '@prisma/client';

export type PrismaPurchaseReturnItemWithProduct = PrismaPurchaseReturnItem & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
};

export type PrismaPurchaseReturnWithRelations = PrismaPurchaseReturn & {
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  supplier: Pick<Supplier, 'id' | 'companyName' | 'supplierCode'>;
  goodsReceive: Pick<GoodsReceive, 'id' | 'grnNumber' | 'status'>;
  items: PrismaPurchaseReturnItemWithProduct[];
};

export interface MappedPurchaseReturnItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: string;
  unitCost: string;
  total: string;
}

export interface MappedPurchaseReturn {
  id: string;
  companyId: string;
  branchId: string | null;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  goodsReceiveId: string;
  grnNumber: string;
  returnNumber: string;
  returnDate: string;
  status: PurchaseReturnStatus;
  subtotal: string;
  tax: string;
  discount: string;
  grandTotal: string;
  reason: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: MappedPurchaseReturnItem[];
}
