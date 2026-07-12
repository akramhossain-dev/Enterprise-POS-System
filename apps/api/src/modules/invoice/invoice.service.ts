import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { findInvoiceBySaleId, updateInvoicePrintCount } from './invoice.repository';
import { Invoice } from '@prisma/client';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function getInvoiceDetails(saleId: string, userId: string): Promise<Invoice> {
  const companyId = await getCompanyIdForUser(userId);
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
  });
  if (sale?.companyId !== companyId) {
    throw new NotFoundError(`Invoice for sale "${saleId}" not found`);
  }

  const invoice = await findInvoiceBySaleId(saleId);
  if (!invoice) {
    throw new NotFoundError(`Invoice record for sale "${saleId}" not found`);
  }

  return invoice;
}

export async function printInvoice(saleId: string, userId: string): Promise<Invoice> {
  const companyId = await getCompanyIdForUser(userId);
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
  });
  if (sale?.companyId !== companyId) {
    throw new NotFoundError(`Invoice for sale "${saleId}" not found`);
  }

  const invoice = await findInvoiceBySaleId(saleId);
  if (!invoice) {
    throw new NotFoundError(`Invoice record for sale "${saleId}" not found`);
  }

  const updated = await updateInvoicePrintCount(invoice.id);
  console.warn(`[AUDIT] Invoice Printed: ${invoice.id} (Printed for sale ${saleId})`);
  return updated;
}
