import type {
  GoodsReceive,
  InvoiceMatchingResult,
  MatchingItemVariance,
} from '@/types/goods-receive';

class InvoiceMatchingService {
  compute3WayMatch(grn: GoodsReceive): InvoiceMatchingResult {
    const po = grn.purchaseOrder;
    const invoice = grn.invoice;

    const items: MatchingItemVariance[] = [];
    let discrepancyCount = 0;
    let qtyVarianceTotal = 0;
    let priceVarianceTotal = 0;
    let totalDiscrepancyAmount = 0;

    grn.items.forEach((grnItem) => {
      // Find corresponding PO item
      const poItem = po?.items?.find((item) => item.productId === grnItem.productId);
      // Find corresponding invoice item? Usually invoices match GRN items directly
      // In this system, invoice totals/items represent GRN items. We assume invoice matches item quantities.
      const poQty = poItem ? Number(poItem.quantity) : 0;
      const poPrice = poItem ? Number(poItem.unitPrice) : 0;

      const grnQty = Number(grnItem.receivedQuantity);
      const grnCost = Number(grnItem.unitCost);

      // Invoiced values default to GRN received values
      const invoiceQty = invoice ? grnQty : 0;
      const invoicePrice = invoice ? grnCost : 0;

      const qtyVariance = grnQty - poQty;
      const priceVariance = grnCost - poPrice;

      const hasException = qtyVariance !== 0 || priceVariance !== 0;

      if (hasException) {
        discrepancyCount++;
        qtyVarianceTotal += Math.abs(qtyVariance);
        priceVarianceTotal += Math.abs(priceVariance);
        totalDiscrepancyAmount +=
          Math.abs(qtyVariance * grnCost) + Math.abs(priceVariance * grnQty);
      }

      items.push({
        productId: grnItem.productId,
        productName: grnItem.product?.name || 'Unknown Item',
        sku: grnItem.product?.sku || 'N/A',
        poQty,
        grnQty,
        invoiceQty,
        poPrice,
        grnCost,
        invoicePrice,
        qtyVariance,
        priceVariance,
        hasException,
      });
    });

    const isMatched = discrepancyCount === 0;

    return {
      goodsReceiveId: grn.id,
      grnNumber: grn.grnNumber,
      purchaseOrderId: po?.id || null,
      purchaseOrderNumber: po?.purchaseOrderNumber || null,
      supplierInvoiceId: invoice?.id || null,
      supplierInvoiceNumber: invoice?.invoiceNumber || null,
      isMatched,
      discrepancyCount,
      items,
      varianceSummary: {
        qtyVarianceTotal,
        priceVarianceTotal,
        totalDiscrepancyAmount,
      },
    };
  }
}

export const invoiceMatchingService = new InvoiceMatchingService();
