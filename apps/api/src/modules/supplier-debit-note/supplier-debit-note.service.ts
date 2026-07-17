import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { paginate, sortBuilder, filterBuilder } from '../../common/utils/query';
import { NotFoundError } from '../../common/errors/AppError';
import {
  SupplierDebitNoteQuery,
  CreateSupplierDebitNoteBody,
  UpdateSupplierDebitNoteBody,
} from './supplier-debit-note.schema';

const SELECT = {
  id: true,
  companyId: true,
  debitNoteNumber: true,
  supplierId: true,
  supplier: {
    select: {
      id: true,
      companyId: true,
      supplierCode: true,
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      status: true,
      alternativePhone: true,
      website: true,
      taxNumber: true,
      creditLimit: true,
      openingBalance: true,
      currentBalance: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  },
  referenceReturnId: true,
  referenceReturnNumber: true,
  amount: true,
  status: true,
  issueDate: true,
  createdAt: true,
  updatedAt: true,
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
function mapDebitNote(dn: any) {
  return {
    ...dn,
    amount: Number(dn.amount),
    issueDate: dn.issueDate.toISOString().split('T')[0],
    createdAt: dn.createdAt.toISOString(),
    updatedAt: dn.updatedAt.toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

export async function listSupplierDebitNotes(query: SupplierDebitNoteQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where: Prisma.SupplierDebitNoteWhereInput = {
    ...filterBuilder(query.q, ['debitNoteNumber', 'referenceReturnNumber']),
  };

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }
  if (query.status && query.status !== 'ALL') {
    where.status = query.status;
  }

  const [items, total] = await Promise.all([
    prisma.supplierDebitNote.findMany({
      where,
      select: SELECT,
      orderBy,
      skip,
      take,
    }),
    prisma.supplierDebitNote.count({ where }),
  ]);

  return {
    debitNotes: items.map(mapDebitNote),
    meta: {
      page: query.page,
      pageSize: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
      hasNextPage: skip + take < total,
      hasPrevPage: query.page > 1,
    },
  };
}

export async function getSupplierDebitNoteById(id: string) {
  const dn = await prisma.supplierDebitNote.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!dn) {
    throw new NotFoundError(`Supplier Debit Note with ID "${id}" not found`);
  }
  return mapDebitNote(dn);
}

export async function createSupplierDebitNote(body: CreateSupplierDebitNoteBody) {
  const supplierExists = await prisma.supplier.findUnique({
    where: { id: body.supplierId },
  });
  if (!supplierExists) {
    throw new NotFoundError(`Supplier with ID "${body.supplierId}" not found`);
  }

  const created = await prisma.supplierDebitNote.create({
    data: {
      companyId: body.companyId,
      debitNoteNumber: body.debitNoteNumber,
      supplierId: body.supplierId,
      referenceReturnId: body.referenceReturnId ?? null,
      referenceReturnNumber: body.referenceReturnNumber ?? null,
      amount: new Prisma.Decimal(body.amount),
      status: body.status,
      issueDate: new Date(body.issueDate),
    },
    select: SELECT,
  });

  return mapDebitNote(created);
}

export async function updateSupplierDebitNote(id: string, body: UpdateSupplierDebitNoteBody) {
  const dn = await prisma.supplierDebitNote.findUnique({
    where: { id },
  });
  if (!dn) {
    throw new NotFoundError(`Supplier Debit Note with ID "${id}" not found`);
  }

  const data: Prisma.SupplierDebitNoteUpdateInput = {};
  if (body.debitNoteNumber !== undefined) {
    data.debitNoteNumber = body.debitNoteNumber;
  }
  if (body.referenceReturnId !== undefined) {
    data.referenceReturnId = body.referenceReturnId;
  }
  if (body.referenceReturnNumber !== undefined) {
    data.referenceReturnNumber = body.referenceReturnNumber;
  }
  if (body.amount !== undefined) {
    data.amount = new Prisma.Decimal(body.amount);
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }
  if (body.issueDate !== undefined) {
    data.issueDate = new Date(body.issueDate);
  }

  const updated = await prisma.supplierDebitNote.update({
    where: { id },
    data,
    select: SELECT,
  });

  return mapDebitNote(updated);
}

export async function deleteSupplierDebitNote(id: string) {
  const dn = await prisma.supplierDebitNote.findUnique({
    where: { id },
  });
  if (!dn) {
    throw new NotFoundError(`Supplier Debit Note with ID "${id}" not found`);
  }

  await prisma.supplierDebitNote.delete({
    where: { id },
  });

  return { success: true };
}
