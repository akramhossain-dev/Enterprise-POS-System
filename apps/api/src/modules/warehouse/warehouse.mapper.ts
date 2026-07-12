// ─────────────────────────────────────────────
// Warehouse Module — Mapper
// ─────────────────────────────────────────────

import { Warehouse as PrismaWarehouse } from '@prisma/client';

export type PrismaWarehouseRaw = PrismaWarehouse;

export interface MappedWarehouse {
  id: string;
  companyId: string;
  branchId: string | null;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  managerName: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  status: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export function mapWarehouse(wh: PrismaWarehouseRaw): MappedWarehouse {
  return {
    id: wh.id,
    companyId: wh.companyId,
    branchId: wh.branchId,
    code: wh.code,
    name: wh.name,
    phone: wh.phone,
    email: wh.email,
    managerName: wh.managerName,
    country: wh.country,
    city: wh.city,
    address: wh.address,
    status: wh.status,
    isDefault: wh.isDefault,
    createdAt: wh.createdAt.toISOString(),
    updatedAt: wh.updatedAt.toISOString(),
    deletedAt: wh.deletedAt ? wh.deletedAt.toISOString() : null,
  };
}

export function mapWarehouseList(warehouses: PrismaWarehouseRaw[]): MappedWarehouse[] {
  return warehouses.map(mapWarehouse);
}
