import { Status } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { UnitQuery, CreateUnitBody, UpdateUnitBody } from './unit.schema';

const SELECT = {
  id: true,
  companyId: true,
  name: true,
  shortName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listUnits(query: UnitQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['name', 'shortName']),
    status: query.status ?? { not: Status.DELETED },
    ...(query.companyId && { companyId: query.companyId }),
  };
  const [units, total] = await prisma.$transaction([
    prisma.unit.findMany({ where, select: SELECT, orderBy, skip, take }),
    prisma.unit.count({ where }),
  ]);
  return { units, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findUnitById(id: string) {
  const unit = await prisma.unit.findFirst({
    where: { id, status: { not: Status.DELETED } },
    select: SELECT,
  });
  if (!unit) {
    throw new NotFoundError('Unit not found');
  }
  return unit;
}

export async function createUnit(body: CreateUnitBody) {
  const company = await prisma.company.findFirst({
    where: { id: body.companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return prisma.unit.create({
    data: { companyId: body.companyId, name: body.name, shortName: body.shortName },
    select: SELECT,
  });
}

export async function updateUnit(id: string, body: UpdateUnitBody) {
  await findUnitById(id);
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.shortName !== undefined) {
    data.shortName = body.shortName;
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }
  return prisma.unit.update({ where: { id }, data, select: SELECT });
}

export async function softDeleteUnit(id: string): Promise<void> {
  await findUnitById(id);
  await prisma.unit.update({ where: { id }, data: { status: Status.DELETED } });
}
