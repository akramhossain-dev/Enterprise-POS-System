import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';
import {
  paginate,
  buildPaginationMeta,
  sortBuilder,
  filterBuilder,
} from '../../common/utils/query';
import {
  CreatePurchaseRequisitionBody,
  PurchaseRequisitionQuery,
  UpdatePurchaseRequisitionBody,
} from './purchase-requisition.schema';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
function mapRequisition(r: any) {
  return {
    id: r.id,
    companyId: r.companyId,
    title: r.title,
    requestedBy: r.requestedBy,
    department: r.department,
    requiredDate: r.requiredDate.toISOString(),
    priority: r.priority,
    status: r.status,
    supplierId: r.supplierId,
    supplierName: r.supplier.companyName,
    warehouseId: r.warehouseId,
    warehouseName: r.warehouse.name,
    subtotal: Number(r.subtotal),
    notes: r.notes,
    convertedPoId: r.convertedPoId,
    items: r.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku ?? '',
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

export async function listPurchaseRequisitions(query: PurchaseRequisitionQuery) {
  const { skip, take } = paginate(query);
  const orderBy = sortBuilder(query.sortBy, query.sortOrder);
  const where = {
    ...filterBuilder(query.q, ['title', 'requestedBy', 'department', 'notes']),
    ...(query.companyId && { companyId: query.companyId }),
    ...(query.priority && { priority: query.priority }),
    ...(query.status && { status: query.status }),
  };

  const [requisitions, total] = await prisma.$transaction([
    prisma.purchaseRequisition.findMany({
      where,
      include: { supplier: true, warehouse: true, items: { include: { product: true } } },
      orderBy,
      skip,
      take,
    }),
    prisma.purchaseRequisition.count({ where }),
  ]);

  return {
    requisitions: requisitions.map(mapRequisition),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function findPurchaseRequisitionById(id: string) {
  const r = await prisma.purchaseRequisition.findUnique({
    where: { id },
    include: {
      supplier: true,
      warehouse: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  if (!r) {
    throw new NotFoundError('Purchase Requisition not found');
  }
  return mapRequisition(r);
}

export async function createPurchaseRequisition(body: CreatePurchaseRequisitionBody) {
  // Validate warehouse and supplier
  const wh = await prisma.warehouse.findUnique({ where: { id: body.warehouseId } });
  if (!wh) {
    throw new NotFoundError(`Warehouse with ID "${body.warehouseId}" not found`);
  }

  const sup = await prisma.supplier.findUnique({ where: { id: body.supplierId } });
  if (!sup) {
    throw new NotFoundError(`Supplier with ID "${body.supplierId}" not found`);
  }

  let subtotal = new Prisma.Decimal(0);
  const itemsData = body.items.map((it) => {
    const qtyDec = new Prisma.Decimal(it.quantity);
    const priceDec = new Prisma.Decimal(it.unitPrice);
    const itemSub = qtyDec.mul(priceDec);
    subtotal = subtotal.add(itemSub);
    return {
      productId: it.productId,
      quantity: qtyDec,
      unitPrice: priceDec,
      subtotal: itemSub,
    };
  });

  const created = await prisma.$transaction(async (tx) => {
    const pr = await tx.purchaseRequisition.create({
      data: {
        companyId: body.companyId,
        title: body.title,
        requestedBy: body.requestedBy,
        department: body.department,
        requiredDate: new Date(body.requiredDate),
        priority: body.priority,
        status: 'DRAFT',
        supplierId: body.supplierId,
        warehouseId: body.warehouseId,
        subtotal,
        notes: body.notes ?? null,
      },
    });

    await tx.purchaseRequisitionItem.createMany({
      data: itemsData.map((it) => ({
        purchaseRequisitionId: pr.id,
        ...it,
      })),
    });

    return tx.purchaseRequisition.findUniqueOrThrow({
      where: { id: pr.id },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  return mapRequisition(created);
}

export async function updatePurchaseRequisition(id: string, body: UpdatePurchaseRequisitionBody) {
  await findPurchaseRequisitionById(id);

  return prisma.$transaction(async (tx) => {
    let subtotal = undefined;

    if (body.items !== undefined) {
      // Clear old items
      await tx.purchaseRequisitionItem.deleteMany({
        where: { purchaseRequisitionId: id },
      });

      let subtotalDec = new Prisma.Decimal(0);
      const itemsData = body.items.map((it) => {
        const qtyDec = new Prisma.Decimal(it.quantity);
        const priceDec = new Prisma.Decimal(it.unitPrice);
        const itemSub = qtyDec.mul(priceDec);
        subtotalDec = subtotalDec.add(itemSub);
        return {
          purchaseRequisitionId: id,
          productId: it.productId,
          quantity: qtyDec,
          unitPrice: priceDec,
          subtotal: itemSub,
        };
      });

      await tx.purchaseRequisitionItem.createMany({
        data: itemsData,
      });

      subtotal = subtotalDec;
    }

    const data: Prisma.PurchaseRequisitionUncheckedUpdateInput = {};
    if (body.title !== undefined) {
      data.title = body.title;
    }
    if (body.requestedBy !== undefined) {
      data.requestedBy = body.requestedBy;
    }
    if (body.department !== undefined) {
      data.department = body.department;
    }
    if (body.requiredDate !== undefined) {
      data.requiredDate = new Date(body.requiredDate);
    }
    if (body.priority !== undefined) {
      data.priority = body.priority;
    }
    if (body.status !== undefined) {
      data.status = body.status;
    }
    if (body.supplierId !== undefined) {
      data.supplierId = body.supplierId;
    }
    if (body.warehouseId !== undefined) {
      data.warehouseId = body.warehouseId;
    }
    if (body.notes !== undefined) {
      data.notes = body.notes;
    }
    if (subtotal !== undefined) {
      data.subtotal = subtotal;
    }

    const updated = await tx.purchaseRequisition.update({
      where: { id },
      data,
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return mapRequisition(updated);
  });
}

export async function deletePurchaseRequisition(id: string) {
  await findPurchaseRequisitionById(id);
  await prisma.purchaseRequisition.delete({ where: { id } });
}
