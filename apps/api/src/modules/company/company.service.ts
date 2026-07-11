import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { Status } from '@prisma/client';
import { CompanyQuery, CreateCompanyBody, UpdateCompanyBody } from './company.schema';

const COMPANY_SELECT_FIELDS = {
  id: true,
  name: true,
  logoUrl: true,
  address: true,
  phone: true,
  email: true,
  taxNumber: true,
  currency: true,
  fiscalYearStart: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * List companies with optional search, sort, and pagination.
 */
export async function listCompanies(query: CompanyQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const searchFilter = filterBuilder(query.q, ['name', 'email']);

  const where = {
    ...searchFilter,
    status: query.status ?? { not: Status.DELETED },
  };

  const [companies, total] = await prisma.$transaction([
    prisma.company.findMany({ where, select: COMPANY_SELECT_FIELDS, orderBy, skip, take }),
    prisma.company.count({ where }),
  ]);

  const meta = buildPaginationMeta(query.page, query.limit, total);
  return { companies, meta };
}

/**
 * Find a single company by ID (excludes soft-deleted).
 */
export async function findCompanyById(id: string) {
  const company = await prisma.company.findFirst({
    where: { id, status: { not: Status.DELETED } },
    select: COMPANY_SELECT_FIELDS,
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return company;
}

/**
 * Create a new company.
 */
export async function createCompany(body: CreateCompanyBody) {
  return prisma.company.create({
    data: {
      name: body.name,
      logoUrl: body.logoUrl ?? null,
      address: body.address ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      taxNumber: body.taxNumber ?? null,
      currency: body.currency,
      fiscalYearStart: body.fiscalYearStart ? new Date(body.fiscalYearStart) : null,
      status: Status.ACTIVE,
    },
    select: COMPANY_SELECT_FIELDS,
  });
}

/**
 * Update company fields.
 */
export async function updateCompany(id: string, body: UpdateCompanyBody) {
  await findCompanyById(id);

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.logoUrl !== undefined) {
    data.logoUrl = body.logoUrl;
  }
  if (body.address !== undefined) {
    data.address = body.address;
  }
  if (body.phone !== undefined) {
    data.phone = body.phone;
  }
  if (body.email !== undefined) {
    data.email = body.email;
  }
  if (body.taxNumber !== undefined) {
    data.taxNumber = body.taxNumber;
  }
  if (body.currency !== undefined) {
    data.currency = body.currency;
  }
  if (body.fiscalYearStart !== undefined) {
    data.fiscalYearStart = new Date(body.fiscalYearStart);
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }

  return prisma.company.update({
    where: { id },
    data,
    select: COMPANY_SELECT_FIELDS,
  });
}

/**
 * Soft-delete a company by setting status to DELETED.
 */
export async function softDeleteCompany(id: string): Promise<void> {
  await findCompanyById(id);

  await prisma.company.update({
    where: { id },
    data: { status: Status.DELETED },
  });
}
