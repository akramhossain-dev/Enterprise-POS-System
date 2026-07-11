import { ProductStatus, Status } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../lib/prisma';
import { NotFoundError, ConflictError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import {
  ProductQuery,
  ProductSearchQuery,
  CreateProductBody,
  UpdateProductBody,
} from './product.schema';

// ─────────────────────────────────────────────
// Prisma Select Objects
// ─────────────────────────────────────────────

const PRODUCT_SELECT = {
  id: true,
  companyId: true,
  name: true,
  sku: true,
  barcode: true,
  description: true,
  purchasePrice: true,
  sellingPrice: true,
  image: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
  unit: { select: { id: true, name: true, shortName: true } },
  tax: { select: { id: true, name: true, percentage: true } },
  images: { select: { id: true, url: true, altText: true, isPrimary: true } },
} as const;

const PRODUCT_SEARCH_SELECT = {
  id: true,
  name: true,
  sku: true,
  barcode: true,
  sellingPrice: true,
  status: true,
  category: { select: { id: true, name: true } },
  unit: { select: { id: true, name: true, shortName: true } },
} as const;

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/** Validate referenced FK entities exist and are not deleted */
async function validateCatalogFKs(
  companyId: string,
  unitId: string,
  categoryId?: string | null,
  brandId?: string | null,
  taxId?: string | null,
): Promise<void> {
  // Company
  const company = await prisma.company.findFirst({
    where: { id: companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Unit (required)
  const unit = await prisma.unit.findFirst({
    where: { id: unitId, companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!unit) {
    throw new NotFoundError('Unit not found or does not belong to this company');
  }

  // Category (optional)
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, companyId, status: { not: Status.DELETED } },
      select: { id: true },
    });
    if (!category) {
      throw new NotFoundError('Category not found or does not belong to this company');
    }
  }

  // Brand (optional)
  if (brandId) {
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, companyId, status: { not: Status.DELETED } },
      select: { id: true },
    });
    if (!brand) {
      throw new NotFoundError('Brand not found or does not belong to this company');
    }
  }

  // Tax (optional)
  if (taxId) {
    const tax = await prisma.tax.findFirst({
      where: { id: taxId, companyId, status: { not: Status.DELETED } },
      select: { id: true },
    });
    if (!tax) {
      throw new NotFoundError('Tax not found or does not belong to this company');
    }
  }
}

/** Map Prisma unique constraint error to ConflictError */
function handleUniqueConstraint(e: unknown, operation: string): never {
  if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
    const fields: string[] = Array.isArray(e.meta?.target) ? (e.meta.target as string[]) : [];
    if (fields.includes('sku')) {
      throw new ConflictError('A product with this SKU already exists');
    }
    if (fields.includes('barcode')) {
      throw new ConflictError('A product with this barcode already exists');
    }
    throw new ConflictError(`Duplicate value detected during ${operation}`);
  }
  throw e;
}

// ─────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────

export async function listProducts(query: ProductQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const searchFilter = filterBuilder(query.q, ['name', 'sku', 'barcode']);

  const where = {
    ...searchFilter,
    ...(query.status ? { status: query.status } : { status: { not: ProductStatus.DISCONTINUED } }),
    ...(query.companyId && { companyId: query.companyId }),
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.brandId && { brandId: query.brandId }),
    ...(query.unitId && { unitId: query.unitId }),
    ...(query.taxId && { taxId: query.taxId }),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, select: PRODUCT_SELECT, orderBy, skip, take }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: buildPaginationMeta(query.page, query.limit, total) };
}

/**
 * Multi-field product search — searches name, SKU, and barcode simultaneously.
 * Optimized with indexed columns in Postgres.
 */
export async function searchProducts(query: ProductSearchQuery) {
  const { skip, take } = paginate(query);
  const term = query.q.trim();

  const where = {
    status: { not: ProductStatus.DISCONTINUED },
    ...(query.companyId && { companyId: query.companyId }),
    OR: [
      { name: { contains: term, mode: 'insensitive' as const } },
      { sku: { contains: term, mode: 'insensitive' as const } },
      { barcode: { contains: term, mode: 'insensitive' as const } },
    ],
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      select: PRODUCT_SEARCH_SELECT,
      orderBy: { name: 'asc' },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, status: { not: ProductStatus.DISCONTINUED } },
    select: PRODUCT_SELECT,
  });
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return product;
}

export async function createProduct(body: CreateProductBody) {
  await validateCatalogFKs(body.companyId, body.unitId, body.categoryId, body.brandId, body.taxId);

  try {
    return await prisma.product.create({
      data: {
        companyId: body.companyId,
        unitId: body.unitId,
        categoryId: body.categoryId ?? null,
        brandId: body.brandId ?? null,
        taxId: body.taxId ?? null,
        name: body.name,
        sku: body.sku ?? null,
        barcode: body.barcode ?? null,
        description: body.description ?? null,
        purchasePrice: body.purchasePrice,
        sellingPrice: body.sellingPrice,
        image: body.image ?? null,
        status: ProductStatus.ACTIVE,
      },
      select: PRODUCT_SELECT,
    });
  } catch (e) {
    handleUniqueConstraint(e, 'create');
  }
}

export async function updateProduct(id: string, body: UpdateProductBody) {
  const existing = await findProductById(id);

  // Validate FK changes if provided
  if (body.unitId || body.categoryId || body.brandId || body.taxId) {
    await validateCatalogFKs(
      existing.companyId,
      body.unitId ?? existing.unit.id,
      body.categoryId !== undefined ? body.categoryId : existing.category?.id,
      body.brandId !== undefined ? body.brandId : existing.brand?.id,
      body.taxId !== undefined ? body.taxId : existing.tax?.id,
    );
  }

  const data: Record<string, unknown> = {};
  if (body.unitId !== undefined) {
    data.unitId = body.unitId;
  }
  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId;
  }
  if (body.brandId !== undefined) {
    data.brandId = body.brandId;
  }
  if (body.taxId !== undefined) {
    data.taxId = body.taxId;
  }
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.sku !== undefined) {
    data.sku = body.sku;
  }
  if (body.barcode !== undefined) {
    data.barcode = body.barcode;
  }
  if (body.description !== undefined) {
    data.description = body.description;
  }
  if (body.purchasePrice !== undefined) {
    data.purchasePrice = body.purchasePrice;
  }
  if (body.sellingPrice !== undefined) {
    data.sellingPrice = body.sellingPrice;
  }
  if (body.image !== undefined) {
    data.image = body.image;
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }

  try {
    return await prisma.product.update({ where: { id }, data, select: PRODUCT_SELECT });
  } catch (e) {
    handleUniqueConstraint(e, 'update');
  }
}

export async function softDeleteProduct(id: string): Promise<void> {
  await findProductById(id);
  await prisma.product.update({
    where: { id },
    data: { status: ProductStatus.DISCONTINUED },
  });
}
