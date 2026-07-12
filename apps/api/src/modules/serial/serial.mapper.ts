import { SerialNumber as PrismaSerial, Product, Warehouse, SerialStatus } from '@prisma/client';

export type PrismaSerialWithRelations = PrismaSerial & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
};

export interface MappedSerial {
  id: string;
  companyId: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  productId: string;
  productName: string;
  productSku: string | null;
  serialNumber: string;
  status: SerialStatus;
  remarks: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function mapSerial(s: PrismaSerialWithRelations): MappedSerial {
  return {
    id: s.id,
    companyId: s.companyId,
    warehouseId: s.warehouseId,
    warehouseName: s.warehouse.name,
    warehouseCode: s.warehouse.code,
    productId: s.productId,
    productName: s.product.name,
    productSku: s.product.sku,
    serialNumber: s.serialNumber,
    status: s.status,
    remarks: s.remarks,
    createdBy: s.createdBy,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function mapSerialList(list: PrismaSerialWithRelations[]): MappedSerial[] {
  return list.map(mapSerial);
}
