import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError';
import { AccountType, ReceiptType, VoucherType, PaymentMethod, Prisma } from '@prisma/client';
import { CreatePaymentReceiptPayload, CreatePaymentVoucherPayload } from './transaction.schema';
import {
  generateReceiptNumber,
  generateVoucherNumber,
  findReceiptById,
  findVoucherById,
  findReceipts,
  findVouchers,
  mapPaymentReceipt,
  mapPaymentVoucher,
} from './transaction.repository';
import {
  MappedPaymentReceipt,
  MappedPaymentVoucher,
  PaymentReceiptQuery,
  PaymentVoucherQuery,
} from './transaction.types';
import { buildPaginationMeta } from '../../common/utils/query';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new BadRequestError('User is not linked to any company/employee record');
  }
  return employee.companyId;
}

// Helper to adjust ledger account balance according to type conventions
async function adjustAccountBalance(
  accountId: string,
  amount: number,
  type: 'DEBIT' | 'CREDIT',
  tx: Prisma.TransactionClient,
) {
  const account = await tx.account.findUnique({ where: { id: accountId } });
  if (!account) {
    throw new NotFoundError(`Account not found: ${accountId}`);
  }

  const isDebitNormal = account.type === AccountType.ASSET || account.type === AccountType.EXPENSE;
  let change = 0;

  if (type === 'DEBIT') {
    change = isDebitNormal ? amount : -amount;
  } else {
    change = isDebitNormal ? -amount : amount;
  }

  await tx.account.update({
    where: { id: accountId },
    data: {
      currentBalance: { increment: change },
    },
  });
}

export async function createPaymentReceipt(
  payload: CreatePaymentReceiptPayload,
  userId: string,
): Promise<MappedPaymentReceipt> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Validate target ledger account exists
  const targetAccount = await prisma.account.findUnique({
    where: { id: payload.accountId },
  });
  if (targetAccount?.companyId !== companyId) {
    throw new BadRequestError('Target ledger account not found');
  }

  // 2. Validate customer / supplier if provided
  if (payload.customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: payload.customerId } });
    if (customer?.companyId !== companyId) {
      throw new BadRequestError('Customer not found');
    }
  }
  if (payload.supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: payload.supplierId } });
    if (supplier?.companyId !== companyId) {
      throw new BadRequestError('Supplier not found');
    }
  }

  // 3. Resolve the offset Cash/Bank asset account (e.g. Cash 1000, Bank 1100)
  const offsetCode = payload.paymentMethod === PaymentMethod.CASH ? '1000' : '1100';
  const offsetAccount = await prisma.account.findFirst({
    where: { companyId, accountCode: offsetCode },
  });
  if (!offsetAccount) {
    throw new BadRequestError(
      `Offset asset account for code "${offsetCode}" not found. Verify database seeding.`,
    );
  }

  // 4. Process atomically in a transaction
  const created = await prisma.$transaction(async (tx) => {
    const receiptNumber = await generateReceiptNumber(companyId, tx);

    const rct = await tx.paymentReceipt.create({
      data: {
        companyId,
        customerId: payload.customerId ?? null,
        supplierId: payload.supplierId ?? null,
        accountId: payload.accountId,
        receiptNumber,
        type: payload.type,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        reference: payload.reference ?? null,
        description: payload.description ?? null,
        date: payload.date,
        createdBy: userId,
      },
    });

    // Create Balanced Double Entry Journal Posting
    const entryCount = await tx.journalEntry.count({ where: { companyId } });
    const entryNumber = `JE-${String(entryCount + 1).padStart(6, '0')}`;

    const journal = await tx.journalEntry.create({
      data: {
        companyId,
        referenceType: 'PAYMENT',
        referenceId: rct.id,
        entryNumber,
        date: payload.date,
        description: payload.description ?? `Receipt transaction: ${receiptNumber}`,
        createdBy: userId,
      },
    });

    // Determine DEBIT and CREDIT accounts based on receipt type:
    // If it's a customer payment/advance receive/other receipt -> Debit Cash/Bank, Credit target account.
    // If it is a supplier payment/advance payment -> Debit target account, Credit Cash/Bank.
    const isSupplierSide =
      payload.type === ReceiptType.SUPPLIER_PAYMENT || payload.type === ReceiptType.ADVANCE_PAYMENT;

    const debitAccountId = isSupplierSide ? payload.accountId : offsetAccount.id;
    const creditAccountId = isSupplierSide ? offsetAccount.id : payload.accountId;

    // Post Journal Line Items
    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: debitAccountId,
        debit: payload.amount,
        credit: 0,
      },
    });

    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: creditAccountId,
        debit: 0,
        credit: payload.amount,
      },
    });

    // Adjust Ledger Account Balances
    await adjustAccountBalance(debitAccountId, payload.amount, 'DEBIT', tx);
    await adjustAccountBalance(creditAccountId, payload.amount, 'CREDIT', tx);

    // Update Customer Balance and Ledger if customerId is defined
    if (payload.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: payload.customerId } });
      if (customer) {
        const newBalance = Number(customer.currentBalance) - payload.amount;
        await tx.customer.update({
          where: { id: payload.customerId },
          data: { currentBalance: newBalance },
        });

        await tx.customerLedgerEntry.create({
          data: {
            companyId,
            customerId: payload.customerId,
            entryType: 'PAYMENT',
            amount: payload.amount,
            runningBalance: newBalance,
            referenceId: rct.id,
            referenceNo: receiptNumber,
            description: payload.description ?? `Receipt payment: ${receiptNumber}`,
          },
        });
      }
    }

    // Update Supplier Balance and Ledger if supplierId is defined
    if (payload.supplierId) {
      const supplier = await tx.supplier.findUnique({ where: { id: payload.supplierId } });
      if (supplier) {
        const newBalance = Number(supplier.currentBalance) - payload.amount;
        await tx.supplier.update({
          where: { id: payload.supplierId },
          data: { currentBalance: newBalance },
        });

        await tx.supplierLedgerEntry.create({
          data: {
            companyId,
            supplierId: payload.supplierId,
            entryType: 'PAYMENT',
            amount: payload.amount,
            runningBalance: newBalance,
            referenceId: rct.id,
            referenceNo: receiptNumber,
            description: payload.description ?? `Receipt payment: ${receiptNumber}`,
          },
        });
      }
    }

    return rct;
  });

  const fresh = await findReceiptById(created.id);
  if (!fresh) {
    throw new NotFoundError('Failed to fetch created receipt details');
  }

  console.warn(`[AUDIT] Payment Receipt Created: ${fresh.id}`);
  return mapPaymentReceipt(fresh);
}

export async function createPaymentVoucher(
  payload: CreatePaymentVoucherPayload,
  userId: string,
): Promise<MappedPaymentVoucher> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Validate target account
  const targetAccount = await prisma.account.findUnique({
    where: { id: payload.accountId },
  });
  if (targetAccount?.companyId !== companyId) {
    throw new BadRequestError('Target account not found');
  }

  // 2. Resolve offset Cash/Bank account
  const payMethod = payload.paymentMethod ?? PaymentMethod.CASH;
  const offsetCode = payMethod === PaymentMethod.CASH ? '1000' : '1100';
  const offsetAccount = await prisma.account.findFirst({
    where: { companyId, accountCode: offsetCode },
  });
  if (!offsetAccount) {
    throw new BadRequestError(
      `Offset asset account for code "${offsetCode}" not found. Verify database seeding.`,
    );
  }

  // 3. Process atomically in a transaction
  const created = await prisma.$transaction(async (tx) => {
    const voucherNumber = await generateVoucherNumber(companyId, tx);

    const vch = await tx.paymentVoucher.create({
      data: {
        companyId,
        voucherNumber,
        type: payload.type,
        accountId: payload.accountId,
        amount: payload.amount,
        paymentMethod: payMethod,
        description: payload.description ?? null,
        date: payload.date,
        createdBy: userId,
      },
    });

    // Create Balanced Double Entry Journal Posting
    const entryCount = await tx.journalEntry.count({ where: { companyId } });
    const entryNumber = `JE-${String(entryCount + 1).padStart(6, '0')}`;

    const journal = await tx.journalEntry.create({
      data: {
        companyId,
        referenceType: 'PAYMENT',
        referenceId: vch.id,
        entryNumber,
        date: payload.date,
        description: payload.description ?? `Voucher transaction: ${voucherNumber}`,
        createdBy: userId,
      },
    });

    // Determine DEBIT and CREDIT accounts based on voucher type:
    // If it's a PAYMENT -> Debit targetAccount, Credit offset (Cash/Bank).
    // If it's a RECEIPT -> Debit offset (Cash/Bank), Credit targetAccount.
    // If it's a CONTRA -> Debit targetAccount, Credit offset.
    // If it's a JOURNAL -> Debit targetAccount, Credit offset.
    const isCreditOffset =
      payload.type === VoucherType.PAYMENT ||
      payload.type === VoucherType.CONTRA ||
      payload.type === VoucherType.JOURNAL;

    const debitAccountId = isCreditOffset ? payload.accountId : offsetAccount.id;
    const creditAccountId = isCreditOffset ? offsetAccount.id : payload.accountId;

    // Post Journal Line Items
    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: debitAccountId,
        debit: payload.amount,
        credit: 0,
      },
    });

    await tx.journalEntryItem.create({
      data: {
        journalEntryId: journal.id,
        accountId: creditAccountId,
        debit: 0,
        credit: payload.amount,
      },
    });

    // Adjust Ledger Account Balances
    await adjustAccountBalance(debitAccountId, payload.amount, 'DEBIT', tx);
    await adjustAccountBalance(creditAccountId, payload.amount, 'CREDIT', tx);

    return vch;
  });

  const fresh = await findVoucherById(created.id);
  if (!fresh) {
    throw new NotFoundError('Failed to fetch created voucher details');
  }

  console.warn(`[AUDIT] Payment Voucher Created: ${fresh.id}`);
  return mapPaymentVoucher(fresh);
}

export async function listPaymentReceipts(
  userId: string,
  query: PaymentReceiptQuery = {},
): Promise<{ receipts: MappedPaymentReceipt[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const companyId = await getCompanyIdForUser(userId);
  const { receipts, meta } = await findReceipts(companyId, query);
  return { receipts: receipts.map(mapPaymentReceipt), meta };
}

export async function getPaymentReceiptDetails(
  id: string,
  userId: string,
): Promise<MappedPaymentReceipt> {
  const companyId = await getCompanyIdForUser(userId);
  const rct = await findReceiptById(id);
  if (rct?.companyId !== companyId) {
    throw new NotFoundError(`Payment receipt with ID "${id}" not found`);
  }
  return mapPaymentReceipt(rct);
}

export async function listPaymentVouchers(
  userId: string,
  query: PaymentVoucherQuery = {},
): Promise<{ vouchers: MappedPaymentVoucher[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  const companyId = await getCompanyIdForUser(userId);
  const { vouchers, meta } = await findVouchers(companyId, query);
  return { vouchers: vouchers.map(mapPaymentVoucher), meta };
}

export async function getPaymentVoucherDetails(
  id: string,
  userId: string,
): Promise<MappedPaymentVoucher> {
  const companyId = await getCompanyIdForUser(userId);
  const vch = await findVoucherById(id);
  if (vch?.companyId !== companyId) {
    throw new NotFoundError(`Payment voucher with ID "${id}" not found`);
  }
  return mapPaymentVoucher(vch);
}
