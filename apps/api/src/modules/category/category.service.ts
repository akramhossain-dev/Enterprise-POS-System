import { Status, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { CategoryQuery, CreateCategoryBody, UpdateCategoryBody } from './category.schema';
import { getOrSetCache, clearCache } from '../analytics/analytics.service';

const SELECT = {
  id: true,
  companyId: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  parentId: true,
  image: true,
  icon: true,
  displayOrder: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      products: true,
    },
  },
};

export async function listCategories(query: CategoryQuery) {
  const cacheKey = `categories:${query.companyId ?? 'all'}:list:${JSON.stringify(query)}`;
  return getOrSetCache(cacheKey, async () => {
    const { skip, take } = paginate(query);
    const orderBy = sortBuilder(query.sortBy, query.sortOrder);
    const where: Prisma.CategoryWhereInput = {
      ...filterBuilder(query.q, ['name', 'description', 'slug']),
      status: query.status ?? { not: Status.DELETED },
      ...(query.companyId && { companyId: query.companyId }),
    };

    if (query.parentId !== undefined) {
      where.parentId = query.parentId === 'null' ? null : query.parentId;
    }

    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({ where, select: SELECT, orderBy, skip, take }),
      prisma.category.count({ where }),
    ]);
    return { categories, meta: buildPaginationMeta(query.page, query.limit, total) };
  });
}

export async function findCategoryById(id: string, includeDeleted = false) {
  const cacheKey = `category:${id}:${includeDeleted ? 'true' : 'false'}`;
  return getOrSetCache(cacheKey, async () => {
    const category = await prisma.category.findFirst({
      where: { id, ...(includeDeleted ? {} : { status: { not: Status.DELETED } }) },
      select: SELECT,
    });
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  });
}

export async function createCategory(body: CreateCategoryBody) {
  const company = await prisma.company.findFirst({
    where: { id: body.companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  const created = await prisma.category.create({
    data: {
      companyId: body.companyId,
      name: body.name,
      slug: body.slug ?? null,
      description: body.description ?? null,
      parentId: body.parentId ?? null,
      image: body.image ?? null,
      icon: body.icon ?? null,
      displayOrder: body.displayOrder,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
    },
    select: SELECT,
  });

  await clearCache(`categories:${body.companyId}:*`);

  return created;
}

export async function updateCategory(id: string, body: UpdateCategoryBody) {
  const includeDeleted = body.status === Status.ACTIVE;
  const existing = await findCategoryById(id, includeDeleted);
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.slug !== undefined) {
    data.slug = body.slug;
  }
  if (body.description !== undefined) {
    data.description = body.description;
  }
  if (body.parentId !== undefined) {
    data.parentId = body.parentId;
  }
  if (body.image !== undefined) {
    data.image = body.image;
  }
  if (body.icon !== undefined) {
    data.icon = body.icon;
  }
  if (body.displayOrder !== undefined) {
    data.displayOrder = body.displayOrder;
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }
  if (body.seoTitle !== undefined) {
    data.seoTitle = body.seoTitle;
  }
  if (body.seoDescription !== undefined) {
    data.seoDescription = body.seoDescription;
  }

  const updated = await prisma.category.update({ where: { id }, data, select: SELECT });

  await clearCache(`categories:${existing.companyId}:*`);
  await clearCache(`category:${id}:*`);

  return updated;
}

export async function softDeleteCategory(id: string): Promise<void> {
  const existing = await findCategoryById(id);
  await prisma.category.update({ where: { id }, data: { status: Status.DELETED } });

  await clearCache(`categories:${existing.companyId}:*`);
  await clearCache(`category:${id}:*`);
}
