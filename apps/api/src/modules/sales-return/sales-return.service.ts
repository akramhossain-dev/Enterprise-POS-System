import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { CreateSalesReturnPayload, SalesReturnQuery } from './sales-return.schema';
import { MappedSalesReturn } from './sales-return.types';
import { mapSalesReturn, mapSalesReturnsList } from './sales-return.mapper';
import {
  findSalesReturnById,
  findSalesReturns,
  generateReturnNumber,
  getAlreadyReturnedQuantity,
} from './sales-return.repository';
import { applyStockOperation } from '../stock-movement/stock-movement.engine';
import { buildPaginationMeta } from '../../common/utils/query';
import { MovementType, SalesReturnStatus, CustomerLedgerEntryType } from '@prisma/client';
import { Prisma } from '@prisma/client';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function createSalesReturn(
  payload: CreateSalesReturnPayload,
  userId: string,
): Promise<MappedSalesReturn> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Fetch sale
  const sale = await prisma.sale.findUnique({
    where: { id: payload.saleId },
    include: {
      items: true,
    },
  });
  if (sale?.companyId !== companyId) {
    throw new NotFoundError(`Sale with ID "${payload.saleId}" not found`);
  }

  // 2. Validate return items
  let returnSubtotal = 0;
  const itemsToCreate: {
    saleItemId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[] = [];

  for (const returnItem of payload.items) {
    const saleItem = sale.items.find(
      (it) => it.id === returnItem.saleItemId && it.productId === returnItem.productId,
    );
    if (!saleItem) {
      throw new BadRequestError(
        `Product "${returnItem.productId}" was not part of sale item "${returnItem.saleItemId}"`,
      );
    }

    const alreadyReturned = await getAlreadyReturnedQuantity(saleItem.id);
    const totalReturned = alreadyReturned + returnItem.quantity;
    if (totalReturned > Number(saleItem.quantity)) {
      throw new BadRequestError(
        `Return quantity (${returnItem.quantity.toString()}) for product "${saleItem.productId}" exceeds original purchased quantity (${saleItem.quantity.toString()}) minus already returned (${alreadyReturned.toString()})`,
      );
    }

    const itemTotal = returnItem.quantity * Number(saleItem.unitPrice);
    returnSubtotal += itemTotal;

    itemsToCreate.push({
      saleItemId: saleItem.id,
      productId: saleItem.productId,
      quantity: returnItem.quantity,
      unitPrice: Number(saleItem.unitPrice),
      total: itemTotal,
    });
  }

  // Proportional tax and discount calculation
  const saleSubtotal = Number(sale.subtotal);
  const taxRate = saleSubtotal > 0 ? Number(sale.tax) / saleSubtotal : 0;
  const discountRate = saleSubtotal > 0 ? Number(sale.discount) / saleSubtotal : 0;

  const tax = returnSubtotal * taxRate;
  const discount = returnSubtotal * discountRate;
  const grandTotal = returnSubtotal + tax - discount;

  const result = await prisma.$transaction(async (tx) => {
    const returnNumber = await generateReturnNumber(companyId, tx);

    const salesReturn = await tx.salesReturn.create({
      data: {
        companyId,
        branchId: sale.branchId,
        warehouseId: sale.warehouseId,
        customerId: sale.customerId,
        saleId: sale.id,
        returnNumber,
        status: SalesReturnStatus.DRAFT,
        subtotal: returnSubtotal,
        tax,
        discount,
        grandTotal,
        refundAmount: 0,
        reason: payload.reason ?? null,
        createdBy: userId,
      },
    });

    await tx.salesReturnItem.createMany({
      data: itemsToCreate.map((item) => ({
        salesReturnId: salesReturn.id,
        saleItemId: item.saleItemId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    });

    return salesReturn.id;
  });

  const freshSR = await findSalesReturnById(result);
  if (!freshSR) {
    throw new NotFoundError('Failed to retrieve created sales return');
  }

  console.warn(`[AUDIT] Sales Return Created: ${freshSR.id}`);
  return mapSalesReturn(freshSR);
}

export async function approveSalesReturn(id: string, userId: string): Promise<MappedSalesReturn> {
  const companyId = await getCompanyIdForUser(userId);
  const sr = await prisma.salesReturn.findUnique({
    where: { id },
  });
  if (sr?.companyId !== companyId) {
    throw new NotFoundError(`Sales Return with ID "${id}" not found`);
  }
  if (sr.status !== SalesReturnStatus.DRAFT) {
    throw new BadRequestError('Only draft sales returns can be approved');
  }

  await prisma.salesReturn.update({
    where: { id },
    data: { status: SalesReturnStatus.APPROVED },
  });

  const freshSR = await findSalesReturnById(id);
  if (!freshSR) {
    throw new NotFoundError('Failed to retrieve sales return details');
  }

  return mapSalesReturn(freshSR);
}

export async function cancelSalesReturn(id: string, userId: string): Promise<MappedSalesReturn> {
  const companyId = await getCompanyIdForUser(userId);
  const sr = await prisma.salesReturn.findUnique({
    where: { id },
  });
  if (sr?.companyId !== companyId) {
    throw new NotFoundError(`Sales Return with ID "${id}" not found`);
  }
  if (sr.status !== SalesReturnStatus.DRAFT && sr.status !== SalesReturnStatus.APPROVED) {
    throw new BadRequestError('Only draft or approved sales returns can be cancelled');
  }

  await prisma.salesReturn.update({
    where: { id },
    data: { status: SalesReturnStatus.CANCELLED },
  });

  const freshSR = await findSalesReturnById(id);
  if (!freshSR) {
    throw new NotFoundError('Failed to retrieve sales return details');
  }

  return mapSalesReturn(freshSR);
}

export async function completeSalesReturn(id: string, userId: string): Promise<MappedSalesReturn> {
  const companyId = await getCompanyIdForUser(userId);
  const sr = await findSalesReturnById(id);
  if (sr?.companyId !== companyId) {
    throw new NotFoundError(`Sales Return with ID "${id}" not found`);
  }
  if (sr.status !== SalesReturnStatus.APPROVED) {
    throw new BadRequestError('Only approved sales returns can be completed');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Complete status
    await tx.salesReturn.update({
      where: { id },
      data: { status: SalesReturnStatus.COMPLETED },
    });

    // 2. Stock Return (inbound movementType: SALE_RETURN)
    for (const item of sr.items) {
      await applyStockOperation(tx, {
        companyId,
        branchId: sr.branchId ?? undefined,
        warehouseId: sr.warehouseId,
        productId: item.productId,
        movementType: MovementType.SALE_RETURN,
        quantity: Number(item.quantity),
        performedBy: userId,
        referenceType: 'SALES_RETURN',
        referenceId: sr.id,
        remarks: `POS return number: ${sr.returnNumber}`,
      });
    }

    // 3. Customer Due Update (Decrease customer current balance by creditAmount)
    if (sr.customerId) {
      const creditAmount = Number(sr.grandTotal) - Number(sr.refundAmount);
      if (creditAmount > 0) {
        const customer = await tx.customer.findUnique({
          where: { id: sr.customerId },
        });
        if (customer) {
          const updatedCustomer = await tx.customer.update({
            where: { id: sr.customerId },
            data: {
              currentBalance: {
                decrement: creditAmount,
              },
            },
          });

          // 4. Create Ledger Entry
          await tx.customerLedgerEntry.create({
            data: {
              companyId,
              customerId: sr.customerId,
              entryType: CustomerLedgerEntryType.RETURN,
              amount: new Prisma.Decimal(-creditAmount), // Negative amount decrements outstanding due balance
              runningBalance: updatedCustomer.currentBalance,
              referenceId: sr.id,
              referenceNo: sr.returnNumber,
              description: `Credit for return: ${sr.returnNumber}`,
            },
          });
        }
      }
    }
  });

  const freshSR = await findSalesReturnById(id);
  if (!freshSR) {
    throw new NotFoundError('Failed to retrieve sales return details');
  }

  console.warn(`[AUDIT] Sales Return Completed: ${sr.id}`);
  if (sr.customerId) {
    console.warn(`[AUDIT] Customer Balance Updated: ${sr.customerId}`);
  }

  return mapSalesReturn(freshSR);
}

export async function getSalesReturnDetails(
  id: string,
  userId: string,
): Promise<MappedSalesReturn> {
  const companyId = await getCompanyIdForUser(userId);
  const sr = await findSalesReturnById(id);
  if (sr?.companyId !== companyId) {
    throw new NotFoundError(`Sales Return with ID "${id}" not found`);
  }
  return mapSalesReturn(sr);
}

export async function listSalesReturns(
  userId: string,
  query: SalesReturnQuery,
): Promise<{
  returns: MappedSalesReturn[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const companyId = await getCompanyIdForUser(userId);
  const { returns, meta } = await findSalesReturns(companyId, query);
  return { returns: mapSalesReturnsList(returns), meta };
}
