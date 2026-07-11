import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { Status } from '@prisma/client';
import { BranchQuery, CreateBranchBody, UpdateBranchBody } from './branch.schema';

const BRANCH_SELECT_FIELDS = {
  id: true,
  companyId: true,
  name: true,
  address: true,
  phone: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: { id: true, name: true, currency: true },
  },
};

/**
 * List branches with optional search, sort, and pagination.
 */
export async function listBranches(query: BranchQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const searchFilter = filterBuilder(query.q, ['name', 'email']);

  const where = {
    ...searchFilter,
    status: query.status ?? { not: Status.DELETED },
    ...(query.companyId ? { companyId: query.companyId } : {}),
  };

  const [branches, total] = await prisma.$transaction([
    prisma.branch.findMany({ where, select: BRANCH_SELECT_FIELDS, orderBy, skip, take }),
    prisma.branch.count({ where }),
  ]);

  const meta = buildPaginationMeta(query.page, query.limit, total);
  return { branches, meta };
}

/**
 * Find a single branch by ID (excludes soft-deleted).
 */
export async function findBranchById(id: string) {
  const branch = await prisma.branch.findFirst({
    where: { id, status: { not: Status.DELETED } },
    select: BRANCH_SELECT_FIELDS,
  });

  if (!branch) {
    throw new NotFoundError('Branch not found');
  }

  return branch;
}

/**
 * Create a new branch under the given company.
 */
export async function createBranch(body: CreateBranchBody) {
  // Validate company exists
  const company = await prisma.company.findFirst({
    where: { id: body.companyId, status: { not: Status.DELETED } },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return prisma.branch.create({
    data: {
      companyId: body.companyId,
      name: body.name,
      address: body.address ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      status: Status.ACTIVE,
    },
    select: BRANCH_SELECT_FIELDS,
  });
}

/**
 * Update branch fields.
 */
export async function updateBranch(id: string, body: UpdateBranchBody) {
  await findBranchById(id);

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
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
  if (body.status !== undefined) {
    data.status = body.status;
  }

  return prisma.branch.update({
    where: { id },
    data,
    select: BRANCH_SELECT_FIELDS,
  });
}

/**
 * Soft-delete a branch by setting status to DELETED.
 */
export async function softDeleteBranch(id: string): Promise<void> {
  await findBranchById(id);

  await prisma.branch.update({
    where: { id },
    data: { status: Status.DELETED },
  });
}
