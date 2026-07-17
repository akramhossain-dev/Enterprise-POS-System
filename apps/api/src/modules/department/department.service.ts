import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import { CreateDepartmentBody, DepartmentQuery, UpdateDepartmentBody } from './department.schema';

const SELECT = {
  id: true,
  companyId: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listDepartments(query: DepartmentQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['name', 'description']),
    ...(query.companyId && { companyId: query.companyId }),
  };

  const [departments, total] = await prisma.$transaction([
    prisma.department.findMany({ where, select: SELECT, orderBy, skip, take }),
    prisma.department.count({ where }),
  ]);

  return { departments, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findDepartmentById(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!dept) {
    throw new NotFoundError('Department not found');
  }
  return dept;
}

export async function createDepartment(body: CreateDepartmentBody) {
  return prisma.department.create({
    data: {
      companyId: body.companyId,
      name: body.name,
      description: body.description ?? null,
      status: body.status,
    },
    select: SELECT,
  });
}

export async function updateDepartment(id: string, body: UpdateDepartmentBody) {
  await findDepartmentById(id);
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
  return prisma.department.update({ where: { id }, data, select: SELECT });
}

export async function deleteDepartment(id: string) {
  await findDepartmentById(id);
  await prisma.department.delete({ where: { id } });
}
