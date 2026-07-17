import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import {
  CreateDesignationBody,
  DesignationQuery,
  UpdateDesignationBody,
} from './designation.schema';

const SELECT = {
  id: true,
  companyId: true,
  name: true,
  departmentId: true,
  department: {
    select: {
      name: true,
    },
  },
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listDesignations(query: DesignationQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['name', 'description']),
    ...(query.companyId && { companyId: query.companyId }),
    ...(query.departmentId && { departmentId: query.departmentId }),
  };

  const [designations, total] = await prisma.$transaction([
    prisma.designation.findMany({ where, select: SELECT, orderBy, skip, take }),
    prisma.designation.count({ where }),
  ]);

  const mapped = designations.map((d) => ({
    id: d.id,
    companyId: d.companyId,
    name: d.name,
    departmentId: d.departmentId,
    departmentName: d.department.name,
    description: d.description,
    status: d.status,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return { designations: mapped, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function findDesignationById(id: string) {
  const desig = await prisma.designation.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!desig) {
    throw new NotFoundError('Designation not found');
  }
  return {
    id: desig.id,
    companyId: desig.companyId,
    name: desig.name,
    departmentId: desig.departmentId,
    departmentName: desig.department.name,
    description: desig.description,
    status: desig.status,
    createdAt: desig.createdAt,
    updatedAt: desig.updatedAt,
  };
}

export async function createDesignation(body: CreateDesignationBody) {
  const dept = await prisma.department.findUnique({ where: { id: body.departmentId } });
  if (!dept) {
    throw new NotFoundError(`Department with ID "${body.departmentId}" not found`);
  }

  const created = await prisma.designation.create({
    data: {
      companyId: body.companyId,
      name: body.name,
      departmentId: body.departmentId,
      description: body.description ?? null,
      status: body.status,
    },
    select: SELECT,
  });

  return {
    id: created.id,
    companyId: created.companyId,
    name: created.name,
    departmentId: created.departmentId,
    departmentName: created.department.name,
    description: created.description,
    status: created.status,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

export async function updateDesignation(id: string, body: UpdateDesignationBody) {
  await findDesignationById(id);
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.departmentId !== undefined) {
    const dept = await prisma.department.findUnique({ where: { id: body.departmentId } });
    if (!dept) {
      throw new NotFoundError(`Department with ID "${body.departmentId}" not found`);
    }
    data.departmentId = body.departmentId;
  }
  if (body.description !== undefined) {
    data.description = body.description;
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }

  const updated = await prisma.designation.update({ where: { id }, data, select: SELECT });

  return {
    id: updated.id,
    companyId: updated.companyId,
    name: updated.name,
    departmentId: updated.departmentId,
    departmentName: updated.department.name,
    description: updated.description,
    status: updated.status,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function deleteDesignation(id: string) {
  await findDesignationById(id);
  await prisma.designation.delete({ where: { id } });
}
