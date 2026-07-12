import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { CreatePaymentBody } from './payment.schema';
import { createPayment, findPaymentsBySaleId } from './payment.repository';
import { findSaleById } from '../sales/sales.repository';
import { MappedSale } from '../sales/sales.types';
import { mapSale } from '../sales/sales.mapper';
import { Payment, PaymentStatus } from '@prisma/client';

export interface PaymentRecordResult {
  payment: Payment;
  sale: MappedSale;
}

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function recordAdditionalPayment(
  body: CreatePaymentBody,
  cashierId: string,
): Promise<PaymentRecordResult> {
  const sale = await findSaleById(body.saleId);
  if (!sale) {
    throw new NotFoundError(`Sale with ID "${body.saleId}" not found`);
  }

  const grandTotal = Number(sale.grandTotal);
  const currentPaid = Number(sale.paidAmount);
  const currentDue = Number(sale.dueAmount);

  if (sale.paymentStatus === PaymentStatus.PAID || currentDue === 0) {
    throw new BadRequestError('This sale is already fully paid');
  }

  const newPaidAmount = currentPaid + body.amount;
  const newDueAmount = Math.max(0, grandTotal - newPaidAmount);

  if (body.amount > currentDue + 0.001) {
    throw new BadRequestError(
      `Payment amount ${body.amount.toString()} exceeds outstanding due balance of ${currentDue.toString()}`,
    );
  }

  let paymentStatus: PaymentStatus = PaymentStatus.PARTIAL;
  if (newDueAmount <= 0.0001) {
    paymentStatus = PaymentStatus.PAID;
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Sale balance
    await tx.sale.update({
      where: { id: sale.id },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        paymentStatus,
      },
    });

    // 2. Create Payment record
    const payment = await createPayment(
      {
        ...body,
        createdBy: cashierId,
      },
      tx,
    );

    // 3. Update customer balance & ledger if customerId is present
    if (sale.customerId) {
      const customer = await tx.customer.findUnique({
        where: { id: sale.customerId },
      });
      if (customer) {
        const updatedCustomer = await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            currentBalance: {
              decrement: body.amount,
            },
          },
        });

        await tx.customerLedgerEntry.create({
          data: {
            companyId: sale.companyId,
            customerId: sale.customerId,
            entryType: 'PAYMENT',
            amount: -body.amount,
            runningBalance: updatedCustomer.currentBalance,
            referenceId: payment.id,
            referenceNo: sale.invoiceNumber,
            description: `Payment for invoice: ${sale.invoiceNumber} (Subsequent payment)`,
          },
        });
      }
    }

    return { payment };
  });

  const updatedSale = await findSaleById(sale.id);
  if (!updatedSale) {
    throw new NotFoundError('Failed to retrieve updated sale record');
  }

  console.warn(
    `[AUDIT] Payment Added: ${result.payment.id} (Additional payment on sale ${sale.id})`,
  );
  if (sale.customerId) {
    console.warn(`[AUDIT] Customer Balance Updated: ${sale.customerId}`);
  }

  return {
    payment: result.payment,
    sale: mapSale(updatedSale),
  };
}

export async function getSalePaymentsHistory(saleId: string, userId: string): Promise<Payment[]> {
  const companyId = await getCompanyIdForUser(userId);
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
  });
  if (sale?.companyId !== companyId) {
    throw new NotFoundError(`Sale with ID "${saleId}" not found`);
  }

  return findPaymentsBySaleId(saleId);
}
