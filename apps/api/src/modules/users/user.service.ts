import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import { UpdateUserBody, UserQuery } from './user.schema';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { Status } from '@prisma/client';

const USER_SELECT_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  status: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: { id: true, name: true, description: true },
  },
};

/**
 * Fetch list of users with search, sort, and pagination filters.
 */
export async function listUsers(query: UserQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);

  // Build dynamic filter conditions matching name/email search terms
  const searchFilter = filterBuilder(query.q, ['name', 'email']);
  const where = {
    ...searchFilter,
    status: {
      not: Status.DELETED, // Exclude soft-deleted users
    },
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: USER_SELECT_FIELDS,
      orderBy,
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  const meta = buildPaginationMeta(query.page, query.limit, total);

  return { users, meta };
}

/**
 * Fetch a single user profile details by unique identifier.
 */
export async function findUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: {
      id,
      status: { not: Status.DELETED },
    },
    select: USER_SELECT_FIELDS,
  });

  if (!user) {
    throw new NotFoundError('User profile details not found');
  }

  return user;
}

/**
 * Update user fields (name, phone, status, roleId).
 */
export async function modifyUser(id: string, body: UpdateUserBody) {
  // Confirm target user exists
  await findUserById(id);

  if (body.roleId) {
    const roleExists = await prisma.role.findUnique({
      where: { id: body.roleId },
    });
    if (!roleExists) {
      throw new NotFoundError('Target registration role not found');
    }
  }

  const updateData: {
    name?: string;
    phone?: string;
    status?: Status;
    role?: { connect: { id: string } };
  } = {};

  if (body.name !== undefined) {
    updateData.name = body.name;
  }
  if (body.phone !== undefined) {
    updateData.phone = body.phone;
  }
  if (body.status !== undefined) {
    updateData.status = body.status;
  }
  if (body.roleId !== undefined) {
    updateData.role = { connect: { id: body.roleId } };
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: USER_SELECT_FIELDS,
  });

  return updatedUser;
}

/**
 * Soft delete user by setting status property to DELETED.
 */
export async function softDeleteUser(id: string): Promise<void> {
  // Confirm target user exists and is not already deleted
  await findUserById(id);

  await prisma.user.update({
    where: { id },
    data: {
      status: Status.DELETED,
    },
  });
}
