import { SupplierInvoiceStatus, GoodsReceiveStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import { CreateSupplierInvoiceBody, SupplierInvoiceQuery } from './supplier-invoice.schema';
import { paginate } from '../../common/utils/query';

const SELECT = {
  id: true,
  goodsReceiveId: true,
  supplierId: true,
  invoiceNumber: true,
  invoiceDate: true,
  subtotal: true,
  tax: true,
  discount: true,
  grandTotal: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  goodsReceive: {
    select: {
      id: true,
      grnNumber: true,
      warehouse: { select: { id: true, name: true } },
    },
  },
  supplier: {
    select: {
      id: true,
      companyName: true,
      supplierCode: true,
    },
  },
};

export interface MappedSupplierInvoice {
  id: string;
  goodsReceiveId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: string;
  tax: string;
  discount: string;
  grandTotal: string;
  status: SupplierInvoiceStatus;
  createdAt: string;
  updatedAt: string;
  goodsReceive: {
    id: string;
    grnNumber: string;
    warehouseName: string;
  };
  supplierName: string;
  supplierCode: string;
}

interface DBInvoiceResult {
  id: string;
  goodsReceiveId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  subtotal: import('@prisma/client').Prisma.Decimal;
  tax: import('@prisma/client').Prisma.Decimal;
  discount: import('@prisma/client').Prisma.Decimal;
  grandTotal: import('@prisma/client').Prisma.Decimal;
  status: SupplierInvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  goodsReceive: {
    id: string;
    grnNumber: string;
    warehouse: { id: string; name: string };
  };
  supplier: {
    id: string;
    companyName: string;
    supplierCode: string;
  };
}

function mapInvoice(inv: DBInvoiceResult): MappedSupplierInvoice {
  return {
    id: inv.id,
    goodsReceiveId: inv.goodsReceiveId,
    supplierId: inv.supplierId,
    invoiceNumber: inv.invoiceNumber,
    invoiceDate: inv.invoiceDate.toISOString(),
    subtotal: inv.subtotal.toString(),
    tax: inv.tax.toString(),
    discount: inv.discount.toString(),
    grandTotal: inv.grandTotal.toString(),
    status: inv.status,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
    goodsReceive: {
      id: inv.goodsReceive.id,
      grnNumber: inv.goodsReceive.grnNumber,
      warehouseName: inv.goodsReceive.warehouse.name,
    },
    supplierName: inv.supplier.companyName,
    supplierCode: inv.supplier.supplierCode,
  };
}

export async function createInvoice(
  body: CreateSupplierInvoiceBody,
): Promise<MappedSupplierInvoice> {
  const gr = await prisma.goodsReceive.findUnique({
    where: { id: body.goodsReceiveId },
    include: { invoice: true },
  });

  if (!gr) {
    throw new NotFoundError(`Goods Receive Note "${body.goodsReceiveId}" not found`);
  }
  if (gr.status !== GoodsReceiveStatus.COMPLETED) {
    throw new BadRequestError(
      `Cannot invoice a Goods Receive Note in status ${gr.status}. It must be COMPLETED.`,
    );
  }

  if (gr.invoice) {
    throw new ConflictError(
      `Supplier Invoice already exists for Goods Receive Note "${body.goodsReceiveId}"`,
    );
  }

  // Pre-validate duplicate invoice number for same supplier
  const existingInv = await prisma.supplierInvoice.findUnique({
    where: {
      supplierId_invoiceNumber: {
        supplierId: gr.supplierId,
        invoiceNumber: body.invoiceNumber,
      },
    },
  });
  if (existingInv) {
    throw new ConflictError(
      `Invoice number "${body.invoiceNumber}" already exists for this supplier`,
    );
  }

  const subtotal = body.subtotal ?? Number(gr.subtotal.toString());
  const discount = body.discount ?? Number(gr.discount.toString());
  const tax = body.tax ?? Number(gr.tax.toString());
  const grandTotal = body.grandTotal ?? subtotal - discount + tax;

  const inv = await prisma.$transaction(async (tx) => {
    const invoiceRecord = await tx.supplierInvoice.create({
      data: {
        goodsReceiveId: body.goodsReceiveId,
        supplierId: gr.supplierId,
        invoiceNumber: body.invoiceNumber,
        invoiceDate: new Date(body.invoiceDate),
        subtotal,
        tax,
        discount,
        grandTotal,
        status: SupplierInvoiceStatus.PENDING,
      },
      select: SELECT,
    });

    const updatedSupplier = await tx.supplier.update({
      where: { id: gr.supplierId },
      data: {
        currentBalance: {
          increment: grandTotal,
        },
      },
      select: { currentBalance: true },
    });

    await tx.supplierLedgerEntry.create({
      data: {
        companyId: gr.companyId,
        supplierId: gr.supplierId,
        entryType: 'PURCHASE',
        amount: grandTotal,
        runningBalance: updatedSupplier.currentBalance,
        referenceId: invoiceRecord.id,
        referenceNo: invoiceRecord.invoiceNumber,
        description: `Invoice ${invoiceRecord.invoiceNumber} created for GRN ${gr.grnNumber}`,
      },
    });

    return invoiceRecord;
  });

  console.warn(`[AUDIT] Supplier Invoice Created: ${inv.invoiceNumber}`);
  return mapInvoice(inv);
}

export async function listInvoices(query: SupplierInvoiceQuery): Promise<{
  invoices: MappedSupplierInvoice[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { skip, take } = paginate({ page: query.page, limit: query.limit });

  const where = {
    ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.invoiceNumber
      ? { invoiceNumber: { contains: query.invoiceNumber, mode: 'insensitive' as const } }
      : {}),
  };

  const [invoices, total] = await prisma.$transaction([
    prisma.supplierInvoice.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: query.sortOrder ?? 'desc' },
      skip,
      take,
    }),
    prisma.supplierInvoice.count({ where }),
  ]);

  return {
    invoices: (invoices as unknown as DBInvoiceResult[]).map(mapInvoice),
    meta: buildPaginationMeta(query.page, query.limit, total),
  };
}

export async function getInvoiceById(id: string): Promise<MappedSupplierInvoice> {
  const inv = await prisma.supplierInvoice.findUnique({
    where: { id },
    select: SELECT,
  });
  if (!inv) {
    throw new NotFoundError(`Supplier Invoice "${id}" not found`);
  }
  return mapInvoice(inv);
}
