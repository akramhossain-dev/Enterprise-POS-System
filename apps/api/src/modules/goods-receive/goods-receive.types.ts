import {
  GoodsReceive as PrismaGoodsReceive,
  GoodsReceiveItem as PrismaGoodsReceiveItem,
  Product,
  Warehouse,
  Supplier,
  PurchaseOrder,
} from '@prisma/client';

export type PrismaGoodsReceiveItemWithProduct = PrismaGoodsReceiveItem & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
};

export type PrismaGoodsReceiveWithRelations = PrismaGoodsReceive & {
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  supplier: Pick<Supplier, 'id' | 'companyName' | 'supplierCode'>;
  purchaseOrder: Pick<PurchaseOrder, 'id' | 'purchaseOrderNumber' | 'status'> | null;
  items: PrismaGoodsReceiveItemWithProduct[];
};
