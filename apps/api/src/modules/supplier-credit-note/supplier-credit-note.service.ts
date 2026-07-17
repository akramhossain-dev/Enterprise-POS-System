import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { paginate, sortBuilder, filterBuilder } from '../../common/utils/query';
import { NotFoundError } from '../../common/errors/AppError';
import {
  SupplierCreditNoteQuery,
  CreateSupplierCreditNoteBody,
  UpdateSupplierCreditNoteBody,
} from './supplier-credit-note.schema';

const SELECT = {
  id: true,
  companyId: true,
  creditNoteNumber: true,
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
  creditAmount: true,
  status: true,
  issueDate: true,
  createdAt: true,
  updatedAt: true,
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
function mapCreditNote(cn: any) {
  return {
    ...cn,
    creditAmount: Number(cn.creditAmount),
    issueDate: cn.issueDate.toISOString().split('T')[0],
    createdAt: cn.createdAt.toISOString(),
    updatedAt: cn.updatedAt.toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

export async function listSupplierCreditNotes(query: SupplierCreditNoteQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where: Prisma.SupplierCreditNoteWhereInput = {
    ...filterBuilder(query.q, ['creditNoteNumber', 'referenceReturnNumber']),
  };

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }
  if (query.status && query.status !== 'ALL') {
    where.status = query.status;
  }

  const [items, total] = await Promise.all([
    prisma.supplierCreditNote.findMany({
      where,
      select: SELECT,
      orderBy,
      skip,
      take,
    }),
    prisma.supplierCreditNote.count({ where }),
  ]);

  return {
    creditNotes: items.map(mapCreditNote),
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

export async function getSupplierCreditNoteById(id: string) {
  const cn = await prisma.supplierCreditNote.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!cn) {
    throw new NotFoundError(`Supplier Credit Note with ID "${id}" not found`);
  }
  return mapCreditNote(cn);
}

export async function createSupplierCreditNote(body: CreateSupplierCreditNoteBody) {
  const supplierExists = await prisma.supplier.findUnique({
    where: { id: body.supplierId },
  });
  if (!supplierExists) {
    throw new NotFoundError(`Supplier with ID "${body.supplierId}" not found`);
  }

  const created = await prisma.supplierCreditNote.create({
    data: {
      companyId: body.companyId,
      creditNoteNumber: body.creditNoteNumber,
      supplierId: body.supplierId,
      referenceReturnId: body.referenceReturnId ?? null,
      referenceReturnNumber: body.referenceReturnNumber ?? null,
      creditAmount: new Prisma.Decimal(body.creditAmount),
      status: body.status,
      issueDate: new Date(body.issueDate),
    },
    select: SELECT,
  });

  return mapCreditNote(created);
}

export async function updateSupplierCreditNote(id: string, body: UpdateSupplierCreditNoteBody) {
  const cn = await prisma.supplierCreditNote.findUnique({
    where: { id },
  });
  if (!cn) {
    throw new NotFoundError(`Supplier Credit Note with ID "${id}" not found`);
  }

  const data: Prisma.SupplierCreditNoteUpdateInput = {};
  if (body.creditNoteNumber !== undefined) {
    data.creditNoteNumber = body.creditNoteNumber;
  }
  if (body.referenceReturnId !== undefined) {
    data.referenceReturnId = body.referenceReturnId;
  }
  if (body.referenceReturnNumber !== undefined) {
    data.referenceReturnNumber = body.referenceReturnNumber;
  }
  if (body.creditAmount !== undefined) {
    data.creditAmount = new Prisma.Decimal(body.creditAmount);
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }
  if (body.issueDate !== undefined) {
    data.issueDate = new Date(body.issueDate);
  }

  const updated = await prisma.supplierCreditNote.update({
    where: { id },
    data,
    select: SELECT,
  });

  return mapCreditNote(updated);
}

export async function deleteSupplierCreditNote(id: string) {
  const cn = await prisma.supplierCreditNote.findUnique({
    where: { id },
  });
  if (!cn) {
    throw new NotFoundError(`Supplier Credit Note with ID "${id}" not found`);
  }

  await prisma.supplierCreditNote.delete({
    where: { id },
  });

  return { success: true };
}
