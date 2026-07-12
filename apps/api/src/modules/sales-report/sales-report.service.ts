import { prisma } from '../../lib/prisma';
import { querySales, aggregateSalesItems } from '../reports/reports.repository';
import { ReportsFilter } from '../reports/reports.schema';
import { DetailedSalesReportItem, SalesSummaryReport } from '../reports/reports.types';
import { ProductSalesReportItem, CustomerSalesReportItem } from './sales-report.types';
import { Prisma } from '@prisma/client';

export async function getDetailedSales(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: DetailedSalesReportItem[]; total: number }> {
  const { items, total } = await querySales(companyId, filter);

  const mappedItems: DetailedSalesReportItem[] = items.map((sale) => {
    const custName = sale.customer
      ? `${sale.customer.firstName} ${sale.customer.lastName}`.trim()
      : 'Walk-in Customer';

    const products = sale.items
      .map((i) => `${i.product.name} (${i.quantity.toString()})`)
      .join(', ');

    let totalQty = new Prisma.Decimal(0);
    for (const item of sale.items) {
      totalQty = totalQty.add(item.quantity);
    }

    return {
      invoiceNumber: sale.invoiceNumber,
      date: sale.saleDate.toISOString(),
      customerName: custName,
      products,
      quantity: totalQty.toString(),
      subtotal: sale.subtotal.toFixed(2),
      discount: sale.discount.toFixed(2),
      tax: sale.tax.toFixed(2),
      total: sale.grandTotal.toFixed(2),
      paymentStatus: sale.paymentStatus,
    };
  });

  return { items: mappedItems, total };
}

export async function getSalesSummary(
  companyId: string,
  filter: ReportsFilter,
): Promise<SalesSummaryReport> {
  const saleItems = await aggregateSalesItems(companyId, filter);

  // Find sales count matching filters
  const saleIds = new Set<string>();
  let grossSales = new Prisma.Decimal(0);
  let totalDiscount = new Prisma.Decimal(0);
  let totalTax = new Prisma.Decimal(0);
  let totalQty = new Prisma.Decimal(0);

  for (const item of saleItems) {
    if (!saleIds.has(item.saleId)) {
      saleIds.add(item.saleId);
    }
    totalQty = totalQty.add(item.quantity);
  }

  // Fetch sales records to get exact discount/tax aggregates
  const sales = await prisma.sale.findMany({
    where: {
      id: { in: Array.from(saleIds) },
    },
    select: {
      subtotal: true,
      discount: true,
      tax: true,
      grandTotal: true,
    },
  });

  for (const sale of sales) {
    grossSales = grossSales.add(sale.subtotal);
    totalDiscount = totalDiscount.add(sale.discount);
    totalTax = totalTax.add(sale.tax);
  }

  const netSales = grossSales.sub(totalDiscount).add(totalTax);

  return {
    totalOrders: saleIds.size,
    totalQuantitySold: totalQty.toString(),
    grossSales: grossSales.toFixed(2),
    discount: totalDiscount.toFixed(2),
    tax: totalTax.toFixed(2),
    netSales: netSales.toFixed(2),
  };
}

export async function getProductSales(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: ProductSalesReportItem[]; total: number }> {
  const saleItems = await aggregateSalesItems(companyId, filter);

  const productMap = new Map<
    string,
    { name: string; qty: Prisma.Decimal; revenue: Prisma.Decimal; cost: Prisma.Decimal }
  >();

  for (const item of saleItems) {
    const qty = item.quantity;
    const price = item.unitPrice;
    const disc = item.discount;
    const rev = qty.mul(price).sub(disc);

    const costVal = qty.mul(item.product.purchasePrice);

    const curr = productMap.get(item.productId) ?? {
      name: item.product.name,
      qty: new Prisma.Decimal(0),
      revenue: new Prisma.Decimal(0),
      cost: new Prisma.Decimal(0),
    };

    curr.qty = curr.qty.add(qty);
    curr.revenue = curr.revenue.add(rev);
    curr.cost = curr.cost.add(costVal);

    productMap.set(item.productId, curr);
  }

  const result: ProductSalesReportItem[] = Array.from(productMap.entries()).map(([id, data]) => {
    const rev = data.revenue;
    const profit = rev.sub(data.cost);
    let margin = '0.00';

    if (rev.gt(0)) {
      margin = profit.mul(100).div(rev).toFixed(2);
    }

    return {
      productId: id,
      productName: data.name,
      quantitySold: data.qty.toString(),
      revenue: rev.toFixed(2),
      profitMargin: `${margin}%`,
    };
  });

  // Apply sorting if needed
  if (filter.sortBy === 'quantity') {
    result.sort((a, b) =>
      filter.sortOrder === 'asc'
        ? Number(a.quantitySold) - Number(b.quantitySold)
        : Number(b.quantitySold) - Number(a.quantitySold),
    );
  } else {
    // Default sorting by revenue desc
    result.sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  // Apply pagination
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  return { items: result.slice(skip, skip + limit), total: result.length };
}

export async function getCustomerSales(
  companyId: string,
  filter: ReportsFilter,
): Promise<{ items: CustomerSalesReportItem[]; total: number }> {
  const saleWhere: Prisma.SaleWhereInput = {
    companyId,
    customerId: { not: null },
    ...(filter.startDate || filter.endDate
      ? {
          saleDate: {
            ...(filter.startDate ? { gte: filter.startDate } : {}),
            ...(filter.endDate ? { lte: filter.endDate } : {}),
          },
        }
      : {}),
    ...(filter.branchId ? { branchId: filter.branchId } : {}),
    ...(filter.warehouseId ? { warehouseId: filter.warehouseId } : {}),
  };

  const groups = await prisma.sale.groupBy({
    by: ['customerId'],
    where: saleWhere,
    _count: { id: true },
    _sum: {
      grandTotal: true,
      paidAmount: true,
      dueAmount: true,
    },
  });

  const result: CustomerSalesReportItem[] = [];

  for (const group of groups) {
    if (group.customerId) {
      const cust = await prisma.customer.findUnique({
        where: { id: group.customerId },
        select: { firstName: true, lastName: true },
      });

      result.push({
        customerId: group.customerId,
        customerName: cust ? `${cust.firstName} ${cust.lastName}`.trim() : 'Unknown Customer',
        totalOrders: group._count.id,
        totalPurchaseAmount: (group._sum.grandTotal ?? new Prisma.Decimal(0)).toFixed(2),
        totalPaid: (group._sum.paidAmount ?? new Prisma.Decimal(0)).toFixed(2),
        dueAmount: (group._sum.dueAmount ?? new Prisma.Decimal(0)).toFixed(2),
      });
    }
  }

  // Sort by purchase amount descending
  result.sort((a, b) => Number(b.totalPurchaseAmount) - Number(a.totalPurchaseAmount));

  // Paginate
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  return { items: result.slice(skip, skip + limit), total: result.length };
}
