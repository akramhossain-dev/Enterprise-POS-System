import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { CheckoutPayload, SaleQuery } from './sales.schema';
import { MappedSale, ReceiptPrintData } from './sales.types';
import { mapSale, mapSalesList } from './sales.mapper';
import {
  findSaleById,
  findSales,
  generateNextInvoiceNumber,
  incrementInvoicePrintCount,
} from './sales.repository';
import { applyStockOperation } from '../stock-movement/stock-movement.engine';
import { buildPaginationMeta } from '../../common/utils/query';
import { MovementType, PaymentStatus, SaleStatus } from '@prisma/client';
import { createLogger } from '../../lib/logger';

const log = createLogger('sales-service');

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function checkoutCart(
  payload: CheckoutPayload,
  cashierId: string,
): Promise<{
  sale: MappedSale;
  invoice: import('@prisma/client').Invoice;
  payment: import('@prisma/client').Payment | null;
}> {
  // 1. Get active session for cashier
  const session = await prisma.pOSSession.findFirst({
    where: {
      cashierId,
      status: 'OPEN',
    },
  });
  if (!session) {
    throw new BadRequestError('No active POS session found for cashier. Open a session first.');
  }

  if (session.cashierId !== cashierId) {
    throw new ForbiddenError('You do not have permission to checkout on this POS session.');
  }

  // 2. Fetch and validate cart
  const cart = await prisma.cart.findUnique({
    where: { id: payload.cartId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  if (!cart) {
    throw new NotFoundError(`Cart with ID "${payload.cartId}" not found`);
  }
  if (cart.status !== 'ACTIVE') {
    throw new BadRequestError('Cart is not active');
  }
  if (cart.sessionId !== session.id) {
    throw new ForbiddenError('This cart does not belong to your active POS session');
  }
  if (cart.items.length === 0) {
    throw new BadRequestError('Cannot checkout an empty cart');
  }

  // 3. Validate customer if provided
  if (payload.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: payload.customerId },
    });
    if (!customer) {
      throw new NotFoundError(`Customer with ID "${payload.customerId}" not found`);
    }
  }

  // 4. Calculate pricing
  const grandTotal = Number(cart.grandTotal);
  const paidAmount = Math.min(grandTotal, payload.paymentDetails?.amount ?? 0);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // 5. Enforce customer for credit sale
  if (dueAmount > 0 && !payload.customerId) {
    throw new BadRequestError('Customer is required for sales with outstanding due balance');
  }

  // 6. Validate stock levels before writing
  for (const item of cart.items) {
    const inv = await prisma.inventory.findFirst({
      where: {
        warehouseId: session.warehouseId,
        productId: item.productId,
      },
    });
    const available = Number(inv?.availableQuantity ?? 0);
    const requested = Number(item.quantity);
    if (available < requested) {
      throw new BadRequestError(
        `Insufficient stock for product "${item.product.name}" in warehouse. Available: ${available.toString()}, Requested: ${requested.toString()}`,
      );
    }
  }

  let paymentStatus: PaymentStatus = PaymentStatus.DUE;
  if (dueAmount === 0) {
    paymentStatus = PaymentStatus.PAID;
  } else if (paidAmount > 0) {
    paymentStatus = PaymentStatus.PARTIAL;
  }

  // 7. Process complete checkout in a single Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    // Generate Invoice Number
    const invoiceNumber = await generateNextInvoiceNumber(session.companyId, tx);

    // Create Sale
    const sale = await tx.sale.create({
      data: {
        companyId: session.companyId,
        branchId: session.branchId,
        warehouseId: session.warehouseId,
        customerId: payload.customerId ?? null,
        sessionId: session.id,
        invoiceNumber,
        subtotal: cart.subtotal,
        discount: cart.discount,
        tax: cart.tax,
        grandTotal: cart.grandTotal,
        paidAmount,
        dueAmount,
        paymentStatus,
        status: SaleStatus.COMPLETED,
        createdBy: cashierId,
      },
    });

    // Create Sale Items
    await tx.saleItem.createMany({
      data: cart.items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total,
      })),
    });

    // Create Payment if paidAmount > 0
    let payment = null;
    if (paidAmount > 0 && payload.paymentDetails) {
      payment = await tx.payment.create({
        data: {
          saleId: sale.id,
          paymentMethod: payload.paymentDetails.paymentMethod,
          amount: paidAmount,
          reference: payload.paymentDetails.reference ?? null,
          transactionId: payload.paymentDetails.transactionId ?? null,
          createdBy: cashierId,
        },
      });
    }

    // Create Invoice record
    const invoice = await tx.invoice.create({
      data: {
        saleId: sale.id,
        invoiceNumber,
        printCount: 0,
      },
    });

    // Update customer balance & ledger if customerId provided
    if (payload.customerId) {
      const customer = await tx.customer.findUnique({
        where: { id: payload.customerId },
      });
      if (!customer) {
        throw new NotFoundError(`Customer with ID "${payload.customerId}" not found`);
      }

      // Update customer balance in database
      const updatedCustomer = await tx.customer.update({
        where: { id: payload.customerId },
        data: {
          currentBalance: {
            increment: dueAmount,
          },
        },
      });

      const initialBal = Number(customer.currentBalance);

      // 1. Record SALE entry (grandTotal)
      const runningAfterSale = initialBal + grandTotal;
      await tx.customerLedgerEntry.create({
        data: {
          companyId: session.companyId,
          customerId: payload.customerId,
          entryType: 'SALE',
          amount: grandTotal,
          runningBalance: runningAfterSale,
          referenceId: sale.id,
          referenceNo: invoiceNumber,
          description: `Credit sale invoice: ${invoiceNumber}`,
        },
      });

      // 2. Record PAYMENT entry (paidAmount) if paidAmount > 0
      if (paidAmount > 0) {
        await tx.customerLedgerEntry.create({
          data: {
            companyId: session.companyId,
            customerId: payload.customerId,
            entryType: 'PAYMENT',
            amount: -paidAmount,
            runningBalance: updatedCustomer.currentBalance,
            referenceId: sale.id,
            referenceNo: invoiceNumber,
            description: `Payment for invoice: ${invoiceNumber}`,
          },
        });
      }
    }

    // Stock deduction & movement for each item
    for (const item of cart.items) {
      await applyStockOperation(tx, {
        companyId: session.companyId,
        branchId: session.branchId ?? undefined,
        warehouseId: session.warehouseId,
        productId: item.productId,
        movementType: MovementType.SALE,
        quantity: Number(item.quantity),
        performedBy: cashierId,
        referenceType: 'SALE',
        referenceId: sale.id,
        remarks: `POS checkout invoice: ${invoiceNumber}`,
      });
    }

    // Mark cart completed
    await tx.cart.update({
      where: { id: cart.id },
      data: { status: 'COMPLETED' },
    });

    return { saleId: sale.id, invoice, payment };
  });

  // Fetch fully loaded sale with relations for output mapping
  const freshSale = await findSaleById(result.saleId);
  if (!freshSale) {
    throw new NotFoundError('Failed to retrieve checked out sale details');
  }

  // Structured audit logs
  log.info({ saleId: result.saleId }, 'Sale created');
  if (result.payment) {
    log.info({ paymentId: result.payment.id }, 'Payment added');
  }
  log.info({ invoiceId: result.invoice.id }, 'Invoice generated');
  log.info({ saleId: result.saleId }, 'Stock deducted for sale');
  if (freshSale.customerId) {
    log.info({ customerId: freshSale.customerId }, 'Customer balance updated');
  }

  // Trigger notifications asynchronously
  void Promise.resolve().then(async () => {
    try {
      const { triggerNotificationEvent } = await import('../notification/notification.service');
      const { recordAuditLog } = await import('../audit/audit.service');
      const custName = freshSale.customer?.fullName ?? 'Walk-in Customer';

      // Record Sale Audit Log
      await recordAuditLog({
        companyId: freshSale.companyId,
        userId: cashierId,
        action: 'SALE',
        entityType: 'Sale',
        entityId: freshSale.id,
        referenceId: result.invoice.id,
        newValue: {
          invoiceNumber: result.invoice.invoiceNumber,
          grandTotal: freshSale.grandTotal.toString(),
          dueAmount: freshSale.dueAmount.toString(),
          customerId: freshSale.customerId,
        },
        description: `POS sale checkout completed with invoice ${result.invoice.invoiceNumber}`,
      });

      // 1. New Sale
      await triggerNotificationEvent(freshSale.companyId, cashierId, 'SALE', 'New Sale', {
        invoiceNumber: result.invoice.invoiceNumber,
        customerName: custName,
        totalAmount: freshSale.grandTotal.toString(),
      });

      // 2. Payment Received
      if (result.payment) {
        await triggerNotificationEvent(
          freshSale.companyId,
          cashierId,
          'PAYMENT',
          'Payment Received',
          {
            amount: result.payment.amount.toString(),
            invoiceNumber: result.invoice.invoiceNumber,
            paymentMethod: result.payment.paymentMethod,
          },
        );
      }

      // 3. Payment Due
      if (Number(freshSale.dueAmount) > 0) {
        await triggerNotificationEvent(freshSale.companyId, cashierId, 'PAYMENT', 'Payment Due', {
          invoiceNumber: result.invoice.invoiceNumber,
          remainingBalance: freshSale.dueAmount.toString(),
        });
      }

      // 4. Customer Due
      if (freshSale.customerId) {
        const cust = await prisma.customer.findUnique({ where: { id: freshSale.customerId } });
        const custBalance = cust ? cust.currentBalance.toString() : '0';
        if (Number(custBalance) > 0) {
          await triggerNotificationEvent(
            freshSale.companyId,
            cashierId,
            'CUSTOMER',
            'Customer Due',
            {
              customerName: custName,
              dueAmount: custBalance,
            },
          );
        }
      }
    } catch (err) {
      log.error({ err }, 'Failed to trigger checkout notifications');
    }
  });

  return {
    sale: mapSale(freshSale),
    invoice: result.invoice,
    payment: result.payment,
  };
}

export async function getSaleDetails(id: string, userId: string): Promise<MappedSale> {
  const companyId = await getCompanyIdForUser(userId);
  const sale = await findSaleById(id);
  if (sale?.companyId !== companyId) {
    throw new NotFoundError(`Sale with ID "${id}" not found`);
  }
  return mapSale(sale);
}

export async function getSalesList(
  userId: string,
  query: SaleQuery,
): Promise<{
  sales: MappedSale[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const companyId = await getCompanyIdForUser(userId);
  const { sales, meta } = await findSales(companyId, query);
  return { sales: mapSalesList(sales), meta };
}

export async function getReceiptData(id: string, userId: string): Promise<ReceiptPrintData> {
  const companyId = await getCompanyIdForUser(userId);
  const sale = await findSaleById(id);
  if (sale?.companyId !== companyId) {
    throw new NotFoundError(`Sale with ID "${id}" not found`);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });
  if (!company) {
    throw new NotFoundError(`Company with ID "${companyId}" not found`);
  }

  const payments = await prisma.payment.findMany({
    where: { saleId: id },
    orderBy: { paidAt: 'asc' },
  });

  const formattedCustomer = sale.customer
    ? {
        name: sale.customer.fullName,
        code: sale.customer.customerCode,
        phone: null,
      }
    : null;

  return {
    businessInfo: {
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
      taxNumber: company.taxNumber,
    },
    customerInfo: formattedCustomer,
    sale: {
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      saleDate: sale.saleDate.toISOString(),
      status: sale.status,
      paymentStatus: sale.paymentStatus,
      subtotal: sale.subtotal.toString(),
      discount: sale.discount.toString(),
      tax: sale.tax.toString(),
      grandTotal: sale.grandTotal.toString(),
      paidAmount: sale.paidAmount.toString(),
      dueAmount: sale.dueAmount.toString(),
    },
    items: sale.items.map((item) => ({
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      discount: item.discount.toString(),
      tax: item.tax.toString(),
      total: item.total.toString(),
    })),
    payments: payments.map((p) => ({
      paymentMethod: p.paymentMethod,
      amount: p.amount.toString(),
      reference: p.reference,
      transactionId: p.transactionId,
      paidAt: p.paidAt.toISOString(),
    })),
  };
}

export async function recordInvoicePrint(id: string, userId: string): Promise<void> {
  const companyId = await getCompanyIdForUser(userId);
  const sale = await prisma.sale.findUnique({
    where: { id },
  });
  if (sale?.companyId !== companyId) {
    throw new NotFoundError(`Sale with ID "${id}" not found`);
  }

  await incrementInvoicePrintCount(id);
  log.info({ saleId: id }, 'Invoice print recorded');
}
