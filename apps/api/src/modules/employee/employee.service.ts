import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { EmployeeStatus, Status } from '@prisma/client';
import { EmployeeQuery, CreateEmployeeBody, UpdateEmployeeBody } from './employee.schema';

const EMPLOYEE_SELECT_FIELDS = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  hireDate: true,
  status: true,
  companyId: true,
  branchId: true,
  userId: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
  user: { select: { id: true, name: true, email: true } },
};

/**
 * List employees with optional search, sort, and pagination.
 */
export async function listEmployees(query: EmployeeQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const searchFilter = filterBuilder(query.q, ['firstName', 'lastName', 'email']);

  const where = {
    ...searchFilter,
    deletedAt: null, // Exclude soft-deleted employees
    ...(query.status ? { status: query.status } : {}),
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
  };

  const [employees, total] = await prisma.$transaction([
    prisma.employee.findMany({ where, select: EMPLOYEE_SELECT_FIELDS, orderBy, skip, take }),
    prisma.employee.count({ where }),
  ]);

  const meta = buildPaginationMeta(query.page, query.limit, total);
  return { employees, meta };
}

/**
 * Find a single employee by ID (excludes soft-deleted).
 */
export async function findEmployeeById(id: string) {
  const employee = await prisma.employee.findFirst({
    where: { id, deletedAt: null },
    select: EMPLOYEE_SELECT_FIELDS,
  });

  if (!employee) {
    throw new NotFoundError('Employee not found');
  }

  return employee;
}

/**
 * Create a new employee record.
 */
export async function createEmployee(body: CreateEmployeeBody) {
  // Validate company exists
  const company = await prisma.company.findFirst({
    where: { id: body.companyId, status: { not: Status.DELETED } },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Validate branch exists and belongs to this company
  const branch = await prisma.branch.findFirst({
    where: { id: body.branchId, companyId: body.companyId, status: { not: Status.DELETED } },
  });
  if (!branch) {
    throw new NotFoundError('Branch not found or does not belong to the specified company');
  }

  // Validate user exists if provided
  if (body.userId) {
    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) {
      throw new NotFoundError('User account not found');
    }
  }

  return prisma.employee.create({
    data: {
      companyId: body.companyId,
      branchId: body.branchId,
      userId: body.userId ?? null,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone ?? null,
      email: body.email ?? null,
      hireDate: body.hireDate ? new Date(body.hireDate) : null,
      status: EmployeeStatus.ACTIVE,
    },
    select: EMPLOYEE_SELECT_FIELDS,
  });
}

/**
 * Update employee fields.
 */
export async function updateEmployee(id: string, body: UpdateEmployeeBody) {
  await findEmployeeById(id);

  const data: Record<string, unknown> = {};
  if (body.branchId !== undefined) {
    data.branchId = body.branchId;
  }
  if (body.userId !== undefined) {
    data.userId = body.userId;
  } // allow null to unlink
  if (body.firstName !== undefined) {
    data.firstName = body.firstName;
  }
  if (body.lastName !== undefined) {
    data.lastName = body.lastName;
  }
  if (body.phone !== undefined) {
    data.phone = body.phone;
  }
  if (body.email !== undefined) {
    data.email = body.email;
  }
  if (body.hireDate !== undefined) {
    data.hireDate = new Date(body.hireDate);
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }

  return prisma.employee.update({
    where: { id },
    data,
    select: EMPLOYEE_SELECT_FIELDS,
  });
}

/**
 * Soft-delete an employee by setting deletedAt timestamp.
 */
export async function softDeleteEmployee(id: string): Promise<void> {
  await findEmployeeById(id);

  await prisma.employee.update({
    where: { id },
    data: { deletedAt: new Date(), status: EmployeeStatus.TERMINATED },
  });
}
