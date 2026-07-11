import { Status } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { BrandQuery, CreateBrandBody, UpdateBrandBody } from './brand.schema';

const SELECT = {
  id: true,
  companyId: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listBrands(query: BrandQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['name', 'description']),
    status: query.status ?? { not: Status.DELETED },
    ...(query.companyId && { companyId: query.companyId }),
  };
  const [brands, total] = await prisma.$transaction([
    prisma.brand.findMany({ where, select: SELECT, orderBy, skip, take }),
    prisma.brand.count({ where }),
  ]);
  return { brands, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findBrandById(id: string) {
  const brand = await prisma.brand.findFirst({
    where: { id, status: { not: Status.DELETED } },
    select: SELECT,
  });
  if (!brand) {
    throw new NotFoundError('Brand not found');
  }
  return brand;
}

export async function createBrand(body: CreateBrandBody) {
  const company = await prisma.company.findFirst({
    where: { id: body.companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return prisma.brand.create({
    data: { companyId: body.companyId, name: body.name, description: body.description ?? null },
    select: SELECT,
  });
}

export async function updateBrand(id: string, body: UpdateBrandBody) {
  await findBrandById(id);
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.description !== undefined) {
    data.description = body.description;
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }
  return prisma.brand.update({ where: { id }, data, select: SELECT });
}

export async function softDeleteBrand(id: string): Promise<void> {
  await findBrandById(id);
  await prisma.brand.update({ where: { id }, data: { status: Status.DELETED } });
}
