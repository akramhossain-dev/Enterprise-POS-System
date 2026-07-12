import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export type PrismaPOSSessionWithRelations = Prisma.POSSessionGetPayload<{
  include: {
    warehouse: { select: { name: true } };
    cashier: { select: { name: true } };
  };
}>;

export async function findActiveSession(
  cashierId: string,
): Promise<PrismaPOSSessionWithRelations | null> {
  return prisma.pOSSession.findFirst({
    where: {
      cashierId,
      status: 'OPEN',
    },
    include: {
      warehouse: { select: { name: true } },
      cashier: { select: { name: true } },
    },
  });
}

export async function generatePOSSessionNumber(
  companyId: string,
  tx?: Prisma.TransactionClient,
): Promise<string> {
  const client = tx ?? prisma;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year.toString()}${month}${day}`;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const count = await client.pOSSession.count({
    where: {
      companyId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `POS-${dateStr}-${seq}`;
}

export async function createSession(
  tx: Prisma.TransactionClient,
  data: {
    companyId: string;
    branchId?: string | undefined;
    warehouseId: string;
    cashierId: string;
    sessionNumber: string;
    openingCash: number;
  },
): Promise<PrismaPOSSessionWithRelations> {
  return tx.pOSSession.create({
    data: {
      companyId: data.companyId,
      branchId: data.branchId ?? null,
      warehouseId: data.warehouseId,
      cashierId: data.cashierId,
      sessionNumber: data.sessionNumber,
      openingCash: new Prisma.Decimal(data.openingCash),
      status: 'OPEN',
      openedAt: new Date(),
    },
    include: {
      warehouse: { select: { name: true } },
      cashier: { select: { name: true } },
    },
  });
}

export async function closeSession(
  tx: Prisma.TransactionClient,
  id: string,
  closingCash: number,
): Promise<PrismaPOSSessionWithRelations> {
  return tx.pOSSession.update({
    where: { id },
    data: {
      closingCash: new Prisma.Decimal(closingCash),
      status: 'CLOSED',
      closedAt: new Date(),
    },
    include: {
      warehouse: { select: { name: true } },
      cashier: { select: { name: true } },
    },
  });
}

export async function findSessionById(id: string): Promise<PrismaPOSSessionWithRelations | null> {
  return prisma.pOSSession.findUnique({
    where: { id },
    include: {
      warehouse: { select: { name: true } },
      cashier: { select: { name: true } },
    },
  });
}

export async function searchProducts(q: string, warehouseId: string) {
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { barcode: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      sku: true,
      barcode: true,
      sellingPrice: true,
      inventories: {
        where: {
          warehouseId,
        },
        select: {
          availableQuantity: true,
        },
      },
    },
    take: 20,
  });

  return products.map((p) => {
    const qty = p.inventories[0]?.availableQuantity ?? new Prisma.Decimal(0);
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      sellingPrice: p.sellingPrice.toString(),
      availableQuantity: qty.toString(),
    };
  });
}
