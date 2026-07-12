import { Prisma, SerialStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { SerialQuery } from './serial.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaSerialWithRelations } from './serial.mapper';

const SELECT = {
  id: true,
  companyId: true,
  warehouseId: true,
  productId: true,
  serialNumber: true,
  status: true,
  remarks: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  product: { select: { id: true, name: true, sku: true } },
  warehouse: { select: { id: true, name: true, code: true } },
} satisfies Prisma.SerialNumberSelect;

export async function findSerials(
  query: SerialQuery,
): Promise<{ serials: PrismaSerialWithRelations[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });
  const where: Prisma.SerialNumberWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? { serialNumber: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
  };
  const [serials, total] = await prisma.$transaction([
    prisma.serialNumber.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.serialNumber.count({ where }),
  ]);
  return {
    serials: serials as unknown as PrismaSerialWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findSerialById(id: string): Promise<PrismaSerialWithRelations | null> {
  return prisma.serialNumber.findUnique({ where: { id }, select: SELECT });
}

export async function findSerialByNumber(serialNumber: string): Promise<{ id: string } | null> {
  return prisma.serialNumber.findUnique({ where: { serialNumber }, select: { id: true } });
}

export interface CreateSerialData {
  companyId: string;
  warehouseId: string;
  productId: string;
  serialNumber: string;
  remarks?: string;
  createdBy: string;
}

export async function createSerial(data: CreateSerialData): Promise<PrismaSerialWithRelations> {
  return prisma.serialNumber.create({
    data: {
      companyId: data.companyId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      serialNumber: data.serialNumber,
      createdBy: data.createdBy,
      ...(data.remarks ? { remarks: data.remarks } : {}),
    },
    select: SELECT,
  });
}

export async function createSerialBulk(
  data: Omit<CreateSerialData, 'serialNumber'>,
  serialNumbers: string[],
): Promise<number> {
  const result = await prisma.serialNumber.createMany({
    data: serialNumbers.map((sn) => ({
      companyId: data.companyId,
      warehouseId: data.warehouseId,
      productId: data.productId,
      serialNumber: sn,
      createdBy: data.createdBy,
    })),
    skipDuplicates: true,
  });
  return result.count;
}

export async function updateSerialStatus(
  id: string,
  status: SerialStatus,
  remarks?: string,
): Promise<PrismaSerialWithRelations> {
  return prisma.serialNumber.update({
    where: { id },
    data: { status, ...(remarks ? { remarks } : {}) },
    select: SELECT,
  });
}
