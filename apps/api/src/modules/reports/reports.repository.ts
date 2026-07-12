import { prisma } from '../../lib/prisma';
import { ReportsFilter } from './reports.schema';
import { Prisma } from '@prisma/client';

export async function querySales(companyId: string, filter: ReportsFilter) {
  const saleWhere: Prisma.SaleWhereInput = {
    companyId,
    ...(filter.branchId ? { branchId: filter.branchId } : {}),
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.customerId ? { customerId: filter.customerId } : {}),
    ...(filter.startDate || filter.endDate
      ? {
          saleDate: {
            ...(filter.startDate ? { gte: filter.startDate } : {}),
            ...(filter.endDate ? { lte: filter.endDate } : {}),
          },
        }
      : {}),
    ...(filter.productId
      ? {
          items: {
            some: { productId: filter.productId },
          },
        }
      : {}),
    ...(filter.search
      ? {
          OR: [
            { invoiceNumber: { contains: filter.search, mode: 'insensitive' } },
            {
              customer: {
                OR: [
                  { firstName: { contains: filter.search, mode: 'insensitive' } },
                  { lastName: { contains: filter.search, mode: 'insensitive' } },
                ],
              },
            },
            {
              items: {
                some: {
                  product: {
                    name: { contains: filter.search, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  // Sorting maps
  let orderBy: Prisma.SaleOrderByWithRelationInput = { saleDate: 'desc' };
  if (filter.sortBy === 'amount') {
    orderBy = { grandTotal: filter.sortOrder ?? 'desc' };
  } else if (filter.sortBy === 'date') {
    orderBy = { saleDate: filter.sortOrder ?? 'desc' };
  }

  const [items, total] = await Promise.all([
    prisma.sale.findMany({
      where: saleWhere,
      include: {
        customer: { select: { firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.sale.count({ where: saleWhere }),
  ]);

  return { items, total };
}

export async function queryPurchases(companyId: string, filter: ReportsFilter) {
  const purchaseWhere: Prisma.PurchaseOrderWhereInput = {
    companyId,
    ...(filter.branchId ? { branchId: filter.branchId } : {}),
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.supplierId ? { supplierId: filter.supplierId } : {}),
    ...(filter.startDate || filter.endDate
      ? {
          orderDate: {
            ...(filter.startDate ? { gte: filter.startDate } : {}),
            ...(filter.endDate ? { lte: filter.endDate } : {}),
          },
        }
      : {}),
    ...(filter.productId
      ? {
          items: {
            some: { productId: filter.productId },
          },
        }
      : {}),
    ...(filter.search
      ? {
          OR: [
            { purchaseOrderNumber: { contains: filter.search, mode: 'insensitive' } },
            {
              supplier: {
                companyName: { contains: filter.search, mode: 'insensitive' },
              },
            },
            {
              items: {
                some: {
                  product: {
                    name: { contains: filter.search, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  let orderBy: Prisma.PurchaseOrderOrderByWithRelationInput = { orderDate: 'desc' };
  if (filter.sortBy === 'amount') {
    orderBy = { grandTotal: filter.sortOrder ?? 'desc' };
  } else if (filter.sortBy === 'date') {
    orderBy = { orderDate: filter.sortOrder ?? 'desc' };
  }

  const [items, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: purchaseWhere,
      include: {
        supplier: { select: { companyName: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where: purchaseWhere }),
  ]);

  return { items, total };
}

export async function aggregateSalesItems(companyId: string, filter: ReportsFilter) {
  // Aggregate sales item data grouped by product
  const itemsWhere: Prisma.SaleItemWhereInput = {
    sale: {
      companyId,
      ...(filter.branchId ? { branchId: filter.branchId } : {}),
      ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
      ...(filter.customerId ? { customerId: filter.customerId } : {}),
      ...(filter.startDate || filter.endDate
        ? {
            saleDate: {
              ...(filter.startDate ? { gte: filter.startDate } : {}),
              ...(filter.endDate ? { lte: filter.endDate } : {}),
            },
          }
        : {}),
      ...(filter.search
        ? {
            OR: [
              { invoiceNumber: { contains: filter.search, mode: 'insensitive' } },
              {
                customer: {
                  OR: [
                    { firstName: { contains: filter.search, mode: 'insensitive' } },
                    { lastName: { contains: filter.search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    },
    ...(filter.productId ? { productId: filter.productId } : {}),
  };

  // Find all matching sale items
  const saleItems = await prisma.saleItem.findMany({
    where: itemsWhere,
    include: {
      product: { select: { name: true, purchasePrice: true } },
    },
  });

  return saleItems;
}
