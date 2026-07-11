import { Status } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { CategoryQuery, CreateCategoryBody, UpdateCategoryBody } from './category.schema';

const SELECT = {
  id: true,
  companyId: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listCategories(query: CategoryQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['name', 'description']),
    status: query.status ?? { not: Status.DELETED },
    ...(query.companyId && { companyId: query.companyId }),
  };
  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({ where, select: SELECT, orderBy, skip, take }),
    prisma.category.count({ where }),
  ]);
  return { categories, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findCategoryById(id: string) {
  const category = await prisma.category.findFirst({
    where: { id, status: { not: Status.DELETED } },
    select: SELECT,
  });
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  return category;
}

export async function createCategory(body: CreateCategoryBody) {
  // Validate company exists
  const company = await prisma.company.findFirst({
    where: { id: body.companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return prisma.category.create({
    data: { companyId: body.companyId, name: body.name, description: body.description ?? null },
    select: SELECT,
  });
}

export async function updateCategory(id: string, body: UpdateCategoryBody) {
  await findCategoryById(id);
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
  return prisma.category.update({ where: { id }, data, select: SELECT });
}

export async function softDeleteCategory(id: string): Promise<void> {
  await findCategoryById(id);
  await prisma.category.update({ where: { id }, data: { status: Status.DELETED } });
}
