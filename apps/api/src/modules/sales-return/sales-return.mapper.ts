import { Prisma } from '@prisma/client';
import { MappedSalesReturn, MappedSalesReturnItem } from './sales-return.types';

export type PrismaSalesReturnWithRelations = Prisma.SalesReturnGetPayload<{
  include: {
    customer: { select: { fullName: true } };
    sale: { select: { invoiceNumber: true } };
    items: {
      include: {
        product: { select: { name: true; sku: true } };
      };
    };
  };
}>;

type PrismaSalesReturnItemWithProduct = Prisma.SalesReturnItemGetPayload<{
  include: {
    product: { select: { name: true; sku: true } };
  };
}>;

export function mapSalesReturnItem(item: PrismaSalesReturnItemWithProduct): MappedSalesReturnItem {
  return {
    id: item.id,
    salesReturnId: item.salesReturnId,
    saleItemId: item.saleItemId,
    productId: item.productId,
    productName: item.product.name,
    productSku: item.product.sku,
    quantity: item.quantity.toString(),
    unitPrice: item.unitPrice.toString(),
    total: item.total.toString(),
  };
}

export function mapSalesReturn(sr: PrismaSalesReturnWithRelations): MappedSalesReturn {
  return {
    id: sr.id,
    companyId: sr.companyId,
    branchId: sr.branchId,
    warehouseId: sr.warehouseId,
    customerId: sr.customerId,
    customerName: sr.customer?.fullName ?? null,
    saleId: sr.saleId,
    saleInvoiceNumber: sr.sale.invoiceNumber,
    returnNumber: sr.returnNumber,
    returnDate: sr.returnDate.toISOString(),
    status: sr.status,
    subtotal: sr.subtotal.toString(),
    tax: sr.tax.toString(),
    discount: sr.discount.toString(),
    grandTotal: sr.grandTotal.toString(),
    refundAmount: sr.refundAmount.toString(),
    reason: sr.reason,
    createdBy: sr.createdBy,
    createdAt: sr.createdAt.toISOString(),
    updatedAt: sr.updatedAt.toISOString(),
    items: sr.items.map(mapSalesReturnItem),
  };
}

export function mapSalesReturnsList(
  returns: PrismaSalesReturnWithRelations[],
): MappedSalesReturn[] {
  return returns.map(mapSalesReturn);
}
