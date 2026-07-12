import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { CreateRefundPayload } from './refund.schema';
import { Refund, CustomerLedgerEntryType } from '@prisma/client';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function recordRefund(payload: CreateRefundPayload, userId: string): Promise<Refund> {
  const companyId = await getCompanyIdForUser(userId);

  const sr = await prisma.salesReturn.findUnique({
    where: { id: payload.salesReturnId },
  });
  if (sr?.companyId !== companyId) {
    throw new NotFoundError(`Sales Return with ID "${payload.salesReturnId}" not found`);
  }
  if (sr.status !== 'COMPLETED') {
    throw new BadRequestError('Refunds can only be processed on completed sales returns');
  }

  const remainingRefundable = Number(sr.grandTotal) - Number(sr.refundAmount);
  if (payload.amount > remainingRefundable + 0.001) {
    throw new BadRequestError(
      `Refund amount (${payload.amount.toString()}) exceeds remaining refundable amount (${remainingRefundable.toString()})`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Refund record
    const refund = await tx.refund.create({
      data: {
        salesReturnId: sr.id,
        customerId: sr.customerId ?? '', // Ensure fallback if customerId was null, though credit return needs customer
        amount: payload.amount,
        refundMethod: payload.refundMethod,
        reference: payload.reference ?? null,
        createdBy: userId,
      },
    });

    // 2. Increment SalesReturn refundAmount
    await tx.salesReturn.update({
      where: { id: sr.id },
      data: {
        refundAmount: {
          increment: payload.amount,
        },
      },
    });

    // 3. Update Customer Balance if customerId is present
    if (sr.customerId) {
      const updatedCustomer = await tx.customer.update({
        where: { id: sr.customerId },
        data: {
          currentBalance: {
            increment: payload.amount, // cash refund increases outstanding due back (less credit)
          },
        },
      });

      // 4. Create Ledger Entry
      await tx.customerLedgerEntry.create({
        data: {
          companyId,
          customerId: sr.customerId,
          entryType: CustomerLedgerEntryType.PAYMENT,
          amount: payload.amount, // positive amount increases due
          runningBalance: updatedCustomer.currentBalance,
          referenceId: refund.id,
          referenceNo: sr.returnNumber,
          description: `Cash refund for return: ${sr.returnNumber} via ${payload.refundMethod}`,
        },
      });
    }

    return refund;
  });

  console.warn(`[AUDIT] Refund Created: ${result.id}`);
  if (sr.customerId) {
    console.warn(`[AUDIT] Customer Balance Updated: ${sr.customerId}`);
  }

  return result;
}

export async function getRefundDetails(id: string, userId: string): Promise<Refund> {
  const companyId = await getCompanyIdForUser(userId);
  const refund = await prisma.refund.findUnique({
    where: { id },
    include: {
      salesReturn: true,
    },
  });
  if (!refund || refund.salesReturn?.companyId !== companyId) {
    throw new NotFoundError(`Refund with ID "${id}" not found`);
  }
  return refund;
}
