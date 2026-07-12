import { prisma } from '../../lib/prisma';
import { AccountType, Prisma } from '@prisma/client';

export async function getSalesData(companyId: string, startDate?: Date, endDate?: Date) {
  const where: Prisma.SaleWhereInput = {
    companyId,
    ...(startDate || endDate
      ? {
          saleDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const aggregate = await prisma.sale.aggregate({
    where,
    _sum: {
      grandTotal: true,
      paidAmount: true,
      dueAmount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalSales: aggregate._sum.grandTotal ?? new Prisma.Decimal(0),
    paidAmount: aggregate._sum.paidAmount ?? new Prisma.Decimal(0),
    dueAmount: aggregate._sum.dueAmount ?? new Prisma.Decimal(0),
    count: aggregate._count.id,
  };
}

export async function getPurchaseData(companyId: string, startDate?: Date, endDate?: Date) {
  const where: Prisma.PurchaseOrderWhereInput = {
    companyId,
    ...(startDate || endDate
      ? {
          orderDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const aggregate = await prisma.purchaseOrder.aggregate({
    where,
    _sum: {
      grandTotal: true,
    },
    _count: {
      id: true,
    },
  });

  // Get status breakdown counts
  const statuses = await prisma.purchaseOrder.groupBy({
    by: ['status'],
    where: { companyId },
    _count: { id: true },
  });

  return {
    totalPurchaseAmount: aggregate._sum.grandTotal ?? new Prisma.Decimal(0),
    totalCount: aggregate._count.id,
    statuses,
  };
}

export async function getInventorySummaryData(companyId: string) {
  const inventories = await prisma.inventory.findMany({
    where: { companyId },
    include: {
      warehouse: { select: { id: true, name: true } },
    },
  });

  let totalProducts = 0;
  let totalStockValue = new Prisma.Decimal(0);
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const warehouseMap = new Map<string, { name: string; total: Prisma.Decimal }>();

  // Use a set to track unique products in inventory
  const uniqueProducts = new Set<string>();

  for (const item of inventories) {
    uniqueProducts.add(item.productId);

    const qty = item.availableQuantity;
    const cost = item.averageCost;
    const val = qty.mul(cost);
    totalStockValue = totalStockValue.add(val);

    const qtyNum = Number(qty);
    if (qtyNum <= 0) {
      outOfStockCount++;
    } else if (qtyNum <= Number(item.minimumQuantity)) {
      lowStockCount++;
    }

    // Warehouse group
    const wId = item.warehouseId;
    const wName = item.warehouse.name;
    const currentW = warehouseMap.get(wId) ?? { name: wName, total: new Prisma.Decimal(0) };
    currentW.total = currentW.total.add(qty);
    warehouseMap.set(wId, currentW);
  }

  totalProducts = uniqueProducts.size;

  const warehouseWiseStock = Array.from(warehouseMap.entries()).map(([id, data]) => ({
    warehouseId: id,
    warehouseName: data.name,
    totalStock: data.total.toString(),
  }));

  return {
    totalProducts,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    warehouseWiseStock,
  };
}

export async function getAccountingTotals(companyId: string, startDate?: Date, endDate?: Date) {
  // Financial income accounts sum
  const incomeAccounts = await prisma.account.findMany({
    where: { companyId, type: AccountType.INCOME },
  });
  const expenseAccounts = await prisma.account.findMany({
    where: { companyId, type: AccountType.EXPENSE },
  });

  let totalIncome = new Prisma.Decimal(0);
  let totalExpense = new Prisma.Decimal(0);

  const dateFilter: Prisma.DateTimeFilter = {};
  if (startDate) {
    dateFilter.gte = startDate;
  }
  if (endDate) {
    dateFilter.lte = endDate;
  }

  // Aggregate income
  for (const acc of incomeAccounts) {
    if (startDate || endDate) {
      const agg = await prisma.journalEntryItem.aggregate({
        where: {
          accountId: acc.id,
          journalEntry: { companyId, date: dateFilter },
        },
        _sum: { debit: true, credit: true },
      });
      const db = agg._sum.debit ?? new Prisma.Decimal(0);
      const cr = agg._sum.credit ?? new Prisma.Decimal(0);
      totalIncome = totalIncome.add(cr.sub(db));
    } else {
      totalIncome = totalIncome.add(acc.currentBalance);
    }
  }

  // Aggregate expense
  for (const acc of expenseAccounts) {
    if (startDate || endDate) {
      const agg = await prisma.journalEntryItem.aggregate({
        where: {
          accountId: acc.id,
          journalEntry: { companyId, date: dateFilter },
        },
        _sum: { debit: true, credit: true },
      });
      const db = agg._sum.debit ?? new Prisma.Decimal(0);
      const cr = agg._sum.credit ?? new Prisma.Decimal(0);
      totalExpense = totalExpense.add(db.sub(cr));
    } else {
      totalExpense = totalExpense.add(acc.currentBalance);
    }
  }

  // Active Cash (1000) & Bank (1100) balances
  const cashAccount = await prisma.account.findFirst({
    where: { companyId, accountCode: '1000' },
  });
  const bankAccount = await prisma.account.findFirst({
    where: { companyId, accountCode: '1100' },
  });

  return {
    totalIncome,
    totalExpense,
    cashBalance: cashAccount?.currentBalance ?? new Prisma.Decimal(0),
    bankBalance: bankAccount?.currentBalance ?? new Prisma.Decimal(0),
  };
}
