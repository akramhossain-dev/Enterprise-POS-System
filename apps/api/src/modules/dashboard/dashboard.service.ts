import { prisma } from '../../lib/prisma';
import { getOrSetCache } from '../analytics/analytics.service';
import {
  getSalesData,
  getPurchaseData,
  getInventorySummaryData,
  getAccountingTotals,
} from './dashboard.repository';
import {
  DashboardOverview,
  SalesSummary,
  SalesTrendItem,
  PurchaseSummary,
  InventorySummary,
  CustomerSummary,
  SupplierSummary,
  FinancialAnalyticsSummary,
  TopProductItem,
  TopCustomerPaymentItem,
  TopCustomerItem,
  TopSupplierItem,
} from './dashboard.types';
import { BadRequestError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new BadRequestError('User is not linked to any company/employee record');
  }
  return employee.companyId;
}

// Helper to construct date ranges
function getStartAndEndDates(start?: Date, end?: Date) {
  const now = new Date();
  const startDate = start ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = end ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

export async function getDashboardOverview(
  userId: string,
  start?: Date,
  end?: Date,
): Promise<DashboardOverview> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `dashboard_overview_${companyId}_${String(startDate.getTime())}_${String(endDate.getTime())}`;

  return getOrSetCache(cacheKey, async () => {
    const [sales, purchases, inventory, accounting] = await Promise.all([
      getSalesData(companyId, startDate, endDate),
      getPurchaseData(companyId, startDate, endDate),
      getInventorySummaryData(companyId),
      getAccountingTotals(companyId, startDate, endDate),
    ]);

    const totalCustomers = await prisma.customer.count({ where: { companyId } });
    const totalSuppliers = await prisma.supplier.count({ where: { companyId } });

    return {
      totalSales: sales.totalSales.toFixed(2),
      totalPurchase: purchases.totalPurchaseAmount.toFixed(2),
      totalRevenue: accounting.totalIncome.toFixed(2),
      totalExpense: accounting.totalExpense.toFixed(2),
      netProfit: accounting.totalIncome.sub(accounting.totalExpense).toFixed(2),
      totalCustomers,
      totalSuppliers,
      totalProducts: inventory.totalProducts,
      lowStockItemsCount: inventory.lowStockCount,
    };
  });
}

export async function getSalesSummary(userId: string): Promise<SalesSummary> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `sales_summary_${companyId}`;

  return getOrSetCache(cacheKey, async () => {
    const now = new Date();

    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const endYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      23,
      59,
      59,
      999,
    );

    // Start of week (Sunday)
    const startWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startWeek.setHours(0, 0, 0, 0);

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = new Date(now.getFullYear(), 0, 1);

    const [today, yesterday, week, month, year] = await Promise.all([
      getSalesData(companyId, startToday),
      getSalesData(companyId, startYesterday, endYesterday),
      getSalesData(companyId, startWeek),
      getSalesData(companyId, startMonth),
      getSalesData(companyId, startYear),
    ]);

    return {
      todaySales: today.totalSales.toFixed(2),
      yesterdaySales: yesterday.totalSales.toFixed(2),
      thisWeekSales: week.totalSales.toFixed(2),
      thisMonthSales: month.totalSales.toFixed(2),
      thisYearSales: year.totalSales.toFixed(2),
    };
  });
}

export async function getSalesTrend(
  userId: string,
  trendType: 'Daily' | 'Weekly' | 'Monthly',
  start?: Date,
  end?: Date,
): Promise<SalesTrendItem[]> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `sales_trend_${companyId}_${trendType}_${String(startDate.getTime())}_${String(endDate.getTime())}`;

  return getOrSetCache(cacheKey, async () => {
    const sales = await prisma.sale.findMany({
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
      select: {
        saleDate: true,
        grandTotal: true,
      },
      orderBy: { saleDate: 'asc' },
    });

    const groups = new Map<string, { total: Prisma.Decimal; count: number }>();

    for (const sale of sales) {
      let key = '';
      const d = sale.saleDate;

      if (trendType === 'Daily') {
        key = d.toISOString().split('T')[0] ?? '';
      } else if (trendType === 'Weekly') {
        // Find Sunday of the week
        const sun = new Date(d);
        sun.setDate(d.getDate() - d.getDay());
        key = `Week of ${sun.toISOString().split('T')[0] ?? ''}`;
      } else {
        key = `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      const curr = groups.get(key) ?? { total: new Prisma.Decimal(0), count: 0 };
      curr.total = curr.total.add(sale.grandTotal);
      curr.count += 1;
      groups.set(key, curr);
    }

    return Array.from(groups.entries()).map(([key, data]) => ({
      date: key,
      salesAmount: data.total.toFixed(2),
      numberOfOrders: data.count,
    }));
  });
}

export async function getPurchaseSummary(
  userId: string,
  start?: Date,
  end?: Date,
): Promise<PurchaseSummary> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `purchase_summary_${companyId}_${String(startDate.getTime())}_${String(endDate.getTime())}`;

  return getOrSetCache(cacheKey, async () => {
    const purchases = await getPurchaseData(companyId, startDate, endDate);

    let pending = 0;
    let completed = 0;

    for (const stat of purchases.statuses) {
      if (stat.status === 'RECEIVED') {
        completed += stat._count.id;
      } else {
        pending += stat._count.id;
      }
    }

    return {
      totalPurchase: purchases.totalCount,
      pendingPurchase: pending,
      completedPurchase: completed,
      purchaseAmount: purchases.totalPurchaseAmount.toFixed(2),
    };
  });
}

export async function getInventorySummary(userId: string): Promise<InventorySummary> {
  const companyId = await getCompanyIdForUser(userId);
  const cacheKey = `inventory_summary_${companyId}`;

  return getOrSetCache(cacheKey, async () => {
    const inv = await getInventorySummaryData(companyId);
    return {
      totalProducts: inv.totalProducts,
      totalStockValue: inv.totalStockValue.toFixed(2),
      lowStockCount: inv.lowStockCount,
      outOfStockCount: inv.outOfStockCount,
      warehouseWiseStock: inv.warehouseWiseStock,
    };
  });
}

export async function getCustomerSummary(
  userId: string,
  start?: Date,
  end?: Date,
): Promise<CustomerSummary> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `customer_summary_${companyId}_${String(startDate.getTime())}_${String(endDate.getTime())}`;

  return getOrSetCache(cacheKey, async () => {
    const totalCustomers = await prisma.customer.count({ where: { companyId } });
    const newCustomers = await prisma.customer.count({
      where: {
        companyId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const outstandingAggregate = await prisma.customer.aggregate({
      where: { companyId },
      _sum: { currentBalance: true },
    });

    const topSales = await prisma.sale.groupBy({
      by: ['customerId'],
      where: {
        companyId,
        customerId: { not: null },
        saleDate: { gte: startDate, lte: endDate },
      },
      _sum: { grandTotal: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 5,
    });

    const topCustomers: TopCustomerItem[] = [];

    for (const group of topSales) {
      if (group.customerId) {
        const cust = await prisma.customer.findUnique({
          where: { id: group.customerId },
          select: { firstName: true, lastName: true },
        });
        topCustomers.push({
          customerId: group.customerId,
          customerName: cust ? `${cust.firstName} ${cust.lastName}`.trim() : 'Unknown Customer',
          totalPurchase: (group._sum.grandTotal ?? new Prisma.Decimal(0)).toFixed(2),
        });
      }
    }

    return {
      totalCustomers,
      newCustomers,
      topCustomers,
      customerDueAmount: (
        outstandingAggregate._sum.currentBalance ?? new Prisma.Decimal(0)
      ).toFixed(2),
    };
  });
}

export async function getSupplierSummary(
  userId: string,
  start?: Date,
  end?: Date,
): Promise<SupplierSummary> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `supplier_summary_${companyId}_${String(startDate.getTime())}_${String(endDate.getTime())}`;

  return getOrSetCache(cacheKey, async () => {
    const totalSuppliers = await prisma.supplier.count({ where: { companyId } });

    const dueAggregate = await prisma.supplier.aggregate({
      where: { companyId },
      _sum: { currentBalance: true },
    });

    // Group purchases by supplier to rank them
    const topPurchases = await prisma.purchaseOrder.groupBy({
      by: ['supplierId'],
      where: {
        companyId,
        orderDate: { gte: startDate, lte: endDate },
      },
      _sum: { grandTotal: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 5,
    });

    const topSuppliers: TopSupplierItem[] = [];

    for (const group of topPurchases) {
      const supp = await prisma.supplier.findUnique({
        where: { id: group.supplierId },
        select: { companyName: true },
      });
      topSuppliers.push({
        supplierId: group.supplierId,
        companyName: supp?.companyName ?? 'Unknown Supplier',
        totalPurchase: (group._sum.grandTotal ?? new Prisma.Decimal(0)).toFixed(2),
      });
    }

    return {
      totalSuppliers,
      supplierDue: (dueAggregate._sum.currentBalance ?? new Prisma.Decimal(0)).toFixed(2),
      topSuppliers,
    };
  });
}

export async function getFinancialSummary(
  userId: string,
  start?: Date,
  end?: Date,
): Promise<FinancialAnalyticsSummary> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `financial_analytics_${companyId}_${String(startDate.getTime())}_${String(endDate.getTime())}`;

  return getOrSetCache(cacheKey, async () => {
    const data = await getAccountingTotals(companyId, startDate, endDate);
    return {
      totalIncome: data.totalIncome.toFixed(2),
      totalExpense: data.totalExpense.toFixed(2),
      profit: data.totalIncome.sub(data.totalExpense).toFixed(2),
      cashBalance: data.cashBalance.toFixed(2),
      bankBalance: data.bankBalance.toFixed(2),
    };
  });
}

export async function getTopProducts(
  userId: string,
  start?: Date,
  end?: Date,
  limit = 5,
): Promise<TopProductItem[]> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `top_products_${companyId}_${String(startDate.getTime())}_${String(endDate.getTime())}_${String(limit)}`;

  return getOrSetCache(cacheKey, async () => {
    const saleItems = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          companyId,
          saleDate: { gte: startDate, lte: endDate },
        },
      },
      _sum: {
        quantity: true,
        unitPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const result: TopProductItem[] = [];

    for (const item of saleItems) {
      const prod = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true },
      });

      // Calculate total revenue for this product
      const totalPaid = await prisma.saleItem.findMany({
        where: {
          productId: item.productId,
          sale: {
            companyId,
            saleDate: { gte: startDate, lte: endDate },
          },
        },
        select: {
          quantity: true,
          unitPrice: true,
          discount: true,
        },
      });

      let rev = new Prisma.Decimal(0);
      for (const line of totalPaid) {
        const qty = line.quantity;
        const price = line.unitPrice;
        const disc = line.discount;
        rev = rev.add(qty.mul(price).sub(disc));
      }

      result.push({
        productId: item.productId,
        productName: prod?.name ?? 'Unknown Product',
        quantitySold: (item._sum.quantity ?? new Prisma.Decimal(0)).toString(),
        revenue: rev.toFixed(2),
      });
    }

    // Rank result by revenue descending
    return result.sort((a, b) => Number(b.revenue) - Number(a.revenue));
  });
}

export async function getTopCustomers(
  userId: string,
  start?: Date,
  end?: Date,
  limit = 5,
): Promise<TopCustomerPaymentItem[]> {
  const companyId = await getCompanyIdForUser(userId);
  const { startDate, endDate } = getStartAndEndDates(start, end);

  const cacheKey = `top_customers_payment_${companyId}_${String(startDate.getTime())}_${String(endDate.getTime())}_${String(limit)}`;

  return getOrSetCache(cacheKey, async () => {
    const groups = await prisma.sale.groupBy({
      by: ['customerId'],
      where: {
        companyId,
        customerId: { not: null },
        saleDate: { gte: startDate, lte: endDate },
      },
      _sum: {
        grandTotal: true,
        paidAmount: true,
      },
      orderBy: {
        _sum: {
          grandTotal: 'desc',
        },
      },
      take: limit,
    });

    const result: TopCustomerPaymentItem[] = [];

    for (const group of groups) {
      if (group.customerId) {
        const cust = await prisma.customer.findUnique({
          where: { id: group.customerId },
          select: { firstName: true, lastName: true },
        });

        result.push({
          customerId: group.customerId,
          customerName: cust ? `${cust.firstName} ${cust.lastName}`.trim() : 'Unknown Customer',
          totalPurchase: (group._sum.grandTotal ?? new Prisma.Decimal(0)).toFixed(2),
          totalPayment: (group._sum.paidAmount ?? new Prisma.Decimal(0)).toFixed(2),
        });
      }
    }

    return result.sort((a, b) => Number(b.totalPurchase) - Number(a.totalPurchase));
  });
}
