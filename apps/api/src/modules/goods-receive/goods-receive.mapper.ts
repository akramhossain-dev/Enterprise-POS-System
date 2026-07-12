import {
  PrismaGoodsReceiveWithRelations,
  PrismaGoodsReceiveItemWithProduct,
} from './goods-receive.types';
import { GoodsReceiveStatus } from '@prisma/client';

export interface MappedGoodsReceiveItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: string;
  receivedQuantity: string;
  unitCost: string;
  batchNumber: string | null;
  expiryDate: string | null;
  serialRequired: boolean;
  total: string;
}

export interface MappedGoodsReceive {
  id: string;
  companyId: string;
  branchId: string | null;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  purchaseOrderId: string | null;
  purchaseOrderNumber: string | null;
  grnNumber: string;
  receiveDate: string;
  status: GoodsReceiveStatus;
  subtotal: string;
  discount: string;
  tax: string;
  grandTotal: string;
  remarks: string | null;
  receivedBy: string;
  createdAt: string;
  updatedAt: string;
  items: MappedGoodsReceiveItem[];
}

export function mapGoodsReceiveItem(i: PrismaGoodsReceiveItemWithProduct): MappedGoodsReceiveItem {
  return {
    id: i.id,
    productId: i.productId,
    productName: i.product.name,
    productSku: i.product.sku,
    quantity: i.quantity.toString(),
    receivedQuantity: i.receivedQuantity.toString(),
    unitCost: i.unitCost.toString(),
    batchNumber: i.batchNumber,
    expiryDate: i.expiryDate?.toISOString() ?? null,
    serialRequired: i.serialRequired,
    total: i.total.toString(),
  };
}

export function mapGoodsReceive(gr: PrismaGoodsReceiveWithRelations): MappedGoodsReceive {
  return {
    id: gr.id,
    companyId: gr.companyId,
    branchId: gr.branchId,
    warehouseId: gr.warehouseId,
    warehouseName: gr.warehouse.name,
    warehouseCode: gr.warehouse.code,
    supplierId: gr.supplierId,
    supplierName: gr.supplier.companyName,
    supplierCode: gr.supplier.supplierCode,
    purchaseOrderId: gr.purchaseOrderId,
    purchaseOrderNumber: gr.purchaseOrder?.purchaseOrderNumber ?? null,
    grnNumber: gr.grnNumber,
    receiveDate: gr.receiveDate.toISOString(),
    status: gr.status,
    subtotal: gr.subtotal.toString(),
    discount: gr.discount.toString(),
    tax: gr.tax.toString(),
    grandTotal: gr.grandTotal.toString(),
    remarks: gr.remarks,
    receivedBy: gr.receivedBy,
    createdAt: gr.createdAt.toISOString(),
    updatedAt: gr.updatedAt.toISOString(),
    items: gr.items.map(mapGoodsReceiveItem),
  };
}

export function mapGoodsReceiveList(list: PrismaGoodsReceiveWithRelations[]): MappedGoodsReceive[] {
  return list.map(mapGoodsReceive);
}
