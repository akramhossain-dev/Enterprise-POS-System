import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError';
import { CreateSupplierPaymentBody, SupplierPaymentQuery } from './supplier-payment.schema';
import {
  findSupplierPayments,
  findSupplierPaymentById,
  insertSupplierPayment,
  generateNextSupplierPaymentNumber,
  MappedSupplierPayment,
} from './supplier-payment.repository';
import { buildPaginationMeta } from '../../common/utils/query';

export async function createSupplierPayment(
  body: CreateSupplierPaymentBody,
  actorId: string,
): Promise<MappedSupplierPayment> {
  // 1. Verify supplier exists
  const supplier = await prisma.supplier.findUnique({
    where: { id: body.supplierId },
  });
  if (!supplier) {
    throw new NotFoundError(`Supplier "${body.supplierId}" not found`);
  }

  // 2. Verify amount is positive
  if (body.amount <= 0) {
    throw new BadRequestError('Payment amount must be greater than 0');
  }

  // 3. Perform database operations atomically in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Generate next SP code
    const paymentNumber = await generateNextSupplierPaymentNumber(body.companyId, tx);

    // Save payment record
    const payment = await insertSupplierPayment(
      {
        ...body,
        paymentNumber,
        createdBy: actorId,
      },
      tx,
    );

    // Decrease Supplier Due Balance
    const updatedSupplier = await tx.supplier.update({
      where: { id: body.supplierId },
      data: {
        currentBalance: {
          decrement: body.amount,
        },
      },
      select: { currentBalance: true },
    });

    // Create Supplier Ledger Entry (PAYMENT)
    await tx.supplierLedgerEntry.create({
      data: {
        companyId: body.companyId,
        supplierId: body.supplierId,
        entryType: 'PAYMENT',
        amount: new Prisma.Decimal(-body.amount), // Negative to show decrease in due
        runningBalance: updatedSupplier.currentBalance,
        referenceId: payment.id,
        referenceNo: payment.paymentNumber,
        description: `Supplier payment ${payment.paymentNumber} of ${String(body.amount)} via ${body.paymentMethod}`,
      },
    });

    return payment;
  });

  console.warn(`[AUDIT] Supplier Payment Created: ${result.paymentNumber}`);
  return result;
}

export async function listSupplierPayments(query: SupplierPaymentQuery): Promise<{
  payments: MappedSupplierPayment[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  return await findSupplierPayments(query);
}

export async function getSupplierPaymentById(id: string): Promise<MappedSupplierPayment> {
  const sp = await findSupplierPaymentById(id);
  if (!sp) {
    throw new NotFoundError(`Supplier Payment "${id}" not found`);
  }
  return sp;
}
