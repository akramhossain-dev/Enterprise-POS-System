import { prisma } from '../../lib/prisma';
import { queryPurchases } from '../reports/reports.repository';
import { ReportsFilter } from '../reports/reports.schema';
import { DetailedPurchaseReportItem } from '../reports/reports.types';
import { PurchaseSummaryReport, SupplierPurchaseReportItem } from './purchase-report.types';
import { Prisma } from '@prisma/client';

export async function getDetailedPurchases(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: DetailedPurchaseReportItem[]; total: number }> {
  const { items, total } = await queryPurchases(companyId, filter);

  const mappedItems: DetailedPurchaseReportItem[] = items.map((po) => {
    const products = po.items.map((i) => `${i.product.name} (${i.quantity.toString()})`).join(', ');

    let totalQty = new Prisma.Decimal(0);
    for (const item of po.items) {
      totalQty = totalQty.add(item.quantity);
    }

    return {
      purchaseNumber: po.purchaseOrderNumber,
      supplierName: po.supplier.companyName,
      date: po.orderDate.toISOString(),
      products,
      quantity: totalQty.toString(),
      amount: po.grandTotal.toFixed(2),
      status: po.status,
    };
  });

  return { items: mappedItems, total };
}

export async function getPurchaseSummary(
  companyId: string,
  filter: ReportsFilter,
): Promise<PurchaseSummaryReport> {
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
  };

  const aggregate = await prisma.purchaseOrder.aggregate({
    where: purchaseWhere,
    _sum: { grandTotal: true },
    _count: { id: true },
  });

  const orders = await prisma.purchaseOrder.findMany({
    where: purchaseWhere,
    include: {
      items: { select: { quantity: true } },
    },
  });

  let totalQty = new Prisma.Decimal(0);
  const supplierIds = new Set<string>();

  for (const o of orders) {
    supplierIds.add(o.supplierId);
    for (const item of o.items) {
      totalQty = totalQty.add(item.quantity);
    }
  }

  const count = aggregate._count.id;
  const totalVal = aggregate._sum.grandTotal ?? new Prisma.Decimal(0);
  const avg = count > 0 ? totalVal.div(count) : new Prisma.Decimal(0);

  return {
    totalPurchase: count,
    totalItems: totalQty.toString(),
    totalSuppliers: supplierIds.size,
    averagePurchaseValue: avg.toFixed(2),
  };
}

export async function getSupplierPurchases(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: SupplierPurchaseReportItem[]; total: number }> {
  const purchaseWhere: Prisma.PurchaseOrderWhereInput = {
    companyId,
    ...(filter.branchId ? { branchId: filter.branchId } : {}),
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
    ...(filter.startDate || filter.endDate
      ? {
          orderDate: {
            ...(filter.startDate ? { gte: filter.startDate } : {}),
            ...(filter.endDate ? { lte: filter.endDate } : {}),
          },
        }
      : {}),
  };

  const groups = await prisma.purchaseOrder.groupBy({
    by: ['supplierId'],
    where: purchaseWhere,
    _count: { id: true },
    _sum: { grandTotal: true },
  });

  const result: SupplierPurchaseReportItem[] = [];

  for (const group of groups) {
    const supp = await prisma.supplier.findUnique({
      where: { id: group.supplierId },
      select: { companyName: true, currentBalance: true },
    });

    result.push({
      supplierId: group.supplierId,
      companyName: supp?.companyName ?? 'Unknown Supplier',
      purchaseCount: group._count.id,
      purchaseAmount: (group._sum.grandTotal ?? new Prisma.Decimal(0)).toFixed(2),
      dueAmount: (supp?.currentBalance ?? new Prisma.Decimal(0)).toFixed(2),
    });
  }

  // Sort by purchase amount descending
  result.sort((a, b) => Number(b.purchaseAmount) - Number(a.purchaseAmount));

  // Paginate
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  return { items: result.slice(skip, skip + limit), total: result.length };
}
