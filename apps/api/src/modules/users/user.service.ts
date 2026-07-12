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
  const oldUser = await findUserById(id);

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

  const roleId = body.roleId;
  if (roleId) {
    void Promise.resolve().then(async () => {
      try {
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        const employee = await prisma.employee.findFirst({ where: { userId: id } });
        if (role && employee) {
          const { triggerNotificationEvent } = await import('../notification/notification.service');
          await triggerNotificationEvent(employee.companyId, id, 'SECURITY', 'Role Change', {
            roleName: role.name,
          });
        }
      } catch (err) {
        console.error('Failed to trigger role change notification:', err);
      }
    });
  }

  // Record Update Audit Log
  const oldVal = {
    name: oldUser.name,
    phone: oldUser.phone,
    status: oldUser.status,
    roleId: oldUser.roleId,
  };
  const newVal = {
    name: updatedUser.name,
    phone: updatedUser.phone,
    status: updatedUser.status,
    roleId: (updatedUser as { roleId?: string }).roleId,
  };
  void Promise.resolve().then(async () => {
    try {
      const { recordAuditLog } = await import('../audit/audit.service');
      const employee = await prisma.employee.findFirst({ where: { userId: id } });
      await recordAuditLog({
        companyId: employee?.companyId ?? null,
        userId: id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        oldValue: oldVal,
        newValue: newVal,
        description: `Updated user profile details for user ID: ${id}`,
      });
    } catch (err) {
      console.error('Failed to record update audit log:', err);
    }
  });

  return updatedUser;
}

/**
 * Soft delete user by setting status property to DELETED.
 */
export async function softDeleteUser(id: string): Promise<void> {
  const oldUser = await findUserById(id);

  await prisma.user.update({
    where: { id },
    data: {
      status: Status.DELETED,
    },
  });

  void Promise.resolve().then(async () => {
    try {
      const { recordAuditLog } = await import('../audit/audit.service');
      const employee = await prisma.employee.findFirst({ where: { userId: id } });
      await recordAuditLog({
        companyId: employee?.companyId ?? null,
        userId: id,
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        oldValue: { status: oldUser.status },
        newValue: { status: Status.DELETED },
        description: `Soft deleted user profile for ID ${id}`,
      });
    } catch (err) {
      console.error('Failed to log user soft delete:', err);
    }
  });
}
