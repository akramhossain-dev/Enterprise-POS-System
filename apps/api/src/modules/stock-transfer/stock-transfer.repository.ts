// ─────────────────────────────────────────────
// Stock Transfer Module — Repository
// ─────────────────────────────────────────────

import { Prisma, TransferStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { TransferQuery } from './stock-transfer.schema';
import { paginate, buildPaginationMeta } from '../../common/utils/query';
import { PrismaTransferWithRelations } from './stock-transfer.mapper';

// ── Shared select ──────────────────────────────────────────────────────────────

const TRANSFER_SELECT = {
  id: true,
  companyId: true,
  fromWarehouseId: true,
  toWarehouseId: true,
  status: true,
  remarks: true,
  createdBy: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
  fromWarehouse: { select: { id: true, name: true, code: true } },
  toWarehouse: { select: { id: true, name: true, code: true } },
  items: {
    select: {
      id: true,
      transferId: true,
      productId: true,
      quantity: true,
      product: { select: { id: true, name: true, sku: true } },
    },
  },
} satisfies Prisma.StockTransferSelect;

// ── List ───────────────────────────────────────────────────────────────────────

export async function findTransfers(query: TransferQuery): Promise<{
  transfers: PrismaTransferWithRelations[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where: Prisma.StockTransferWhereInput = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.fromWarehouseId ? { fromWarehouseId: query.fromWarehouseId } : {}),
    ...(query.toWarehouseId ? { toWarehouseId: query.toWarehouseId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.createdBy ? { createdBy: query.createdBy } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          createdAt: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
  };

  const [transfers, total] = await prisma.$transaction([
    prisma.stockTransfer.findMany({
      where,
      select: TRANSFER_SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.stockTransfer.count({ where }),
  ]);

  return {
    transfers: transfers as unknown as PrismaTransferWithRelations[],
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

// ── Find by ID ─────────────────────────────────────────────────────────────────

export async function findTransferById(id: string): Promise<PrismaTransferWithRelations | null> {
  const t = await prisma.stockTransfer.findUnique({
    where: { id },
    select: TRANSFER_SELECT,
  });
  return t;
}

// ── Create Transfer ────────────────────────────────────────────────────────────

export interface CreateTransferData {
  companyId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  remarks?: string | undefined;
  createdBy: string;
  items: { productId: string; quantity: number }[];
}

export async function createTransferRecord(
  tx: Prisma.TransactionClient,
  data: CreateTransferData,
): Promise<PrismaTransferWithRelations> {
  const t = await tx.stockTransfer.create({
    data: {
      companyId: data.companyId,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      status: TransferStatus.PENDING,
      ...(data.remarks ? { remarks: data.remarks } : {}),
      createdBy: data.createdBy,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    select: TRANSFER_SELECT,
  });
  return t;
}

// ── Update Status ──────────────────────────────────────────────────────────────

export async function updateTransferStatus(
  tx: Prisma.TransactionClient,
  id: string,
  status: TransferStatus,
  approvedBy?: string,
): Promise<PrismaTransferWithRelations> {
  const t = await tx.stockTransfer.update({
    where: { id },
    data: {
      status,
      ...(approvedBy ? { approvedBy } : {}),
    },
    select: TRANSFER_SELECT,
  });
  return t;
}
