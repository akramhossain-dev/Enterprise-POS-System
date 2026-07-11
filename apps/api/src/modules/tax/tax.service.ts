import { Status } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { TaxQuery, CreateTaxBody, UpdateTaxBody } from './tax.schema';

const SELECT = {
  id: true,
  companyId: true,
  name: true,
  percentage: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listTaxes(query: TaxQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['name']),
    status: query.status ?? { not: Status.DELETED },
    ...(query.companyId && { companyId: query.companyId }),
  };
  const [taxes, total] = await prisma.$transaction([
    prisma.tax.findMany({ where, select: SELECT, orderBy, skip, take }),
    prisma.tax.count({ where }),
  ]);
  return { taxes, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findTaxById(id: string) {
  const tax = await prisma.tax.findFirst({
    where: { id, status: { not: Status.DELETED } },
    select: SELECT,
  });
  if (!tax) {
    throw new NotFoundError('Tax not found');
  }
  return tax;
}

export async function createTax(body: CreateTaxBody) {
  const company = await prisma.company.findFirst({
    where: { id: body.companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return prisma.tax.create({
    data: { companyId: body.companyId, name: body.name, percentage: body.percentage },
    select: SELECT,
  });
}

export async function updateTax(id: string, body: UpdateTaxBody) {
  await findTaxById(id);
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.percentage !== undefined) {
    data.percentage = body.percentage;
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }
  return prisma.tax.update({ where: { id }, data, select: SELECT });
}

export async function softDeleteTax(id: string): Promise<void> {
  await findTaxById(id);
  await prisma.tax.update({ where: { id }, data: { status: Status.DELETED } });
}
