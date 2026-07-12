import { Prisma } from '@prisma/client';
import { MappedSale, MappedSaleItem } from './sales.types';

export type PrismaSaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    customer: { select: { id: true; fullName: true; customerCode: true } };
    items: {
      include: {
        product: { select: { name: true; sku: true; barcode: true } };
      };
    };
  };
}>;

type PrismaSaleItemWithProduct = Prisma.SaleItemGetPayload<{
  include: {
    product: { select: { name: true; sku: true; barcode: true } };
  };
}>;

export function mapSaleItem(item: PrismaSaleItemWithProduct): MappedSaleItem {
  return {
    id: item.id,
    saleId: item.saleId,
    productId: item.productId,
    productName: item.product.name,
    productSku: item.product.sku,
    productBarcode: item.product.barcode,
    quantity: item.quantity.toString(),
    unitPrice: item.unitPrice.toString(),
    discount: item.discount.toString(),
    tax: item.tax.toString(),
    total: item.total.toString(),
  };
}

export function mapSale(sale: PrismaSaleWithRelations): MappedSale {
  return {
    id: sale.id,
    companyId: sale.companyId,
    branchId: sale.branchId,
    warehouseId: sale.warehouseId,
    customerId: sale.customerId,
    customerName: sale.customer?.fullName ?? null,
    customerCode: sale.customer?.customerCode ?? null,
    sessionId: sale.sessionId,
    invoiceNumber: sale.invoiceNumber,
    saleDate: sale.saleDate.toISOString(),
    subtotal: sale.subtotal.toString(),
    discount: sale.discount.toString(),
    tax: sale.tax.toString(),
    grandTotal: sale.grandTotal.toString(),
    paidAmount: sale.paidAmount.toString(),
    dueAmount: sale.dueAmount.toString(),
    paymentStatus: sale.paymentStatus,
    status: sale.status,
    createdBy: sale.createdBy,
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
    items: sale.items.map(mapSaleItem),
  };
}

export function mapSalesList(sales: PrismaSaleWithRelations[]): MappedSale[] {
  return sales.map(mapSale);
}
