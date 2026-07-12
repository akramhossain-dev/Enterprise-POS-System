import { BadRequestError, NotFoundError } from '../../common/errors/AppError';
import { prisma } from '../../lib/prisma';
import {
  findActiveSession,
  generatePOSSessionNumber,
  createSession,
  closeSession,
  searchProducts,
  PrismaPOSSessionWithRelations,
} from './pos.repository';
import { MappedPOSSession } from './pos.types';

export function mapPOSSession(session: PrismaPOSSessionWithRelations): MappedPOSSession {
  return {
    id: session.id,
    companyId: session.companyId,
    branchId: session.branchId,
    warehouseId: session.warehouseId,
    warehouseName: session.warehouse.name,
    cashierId: session.cashierId,
    cashierName: session.cashier.name,
    sessionNumber: session.sessionNumber,
    openingCash: session.openingCash.toString(),
    closingCash: session.closingCash ? session.closingCash.toString() : null,
    status: session.status,
    openedAt: session.openedAt.toISOString(),
    closedAt: session.closedAt ? session.closedAt.toISOString() : null,
    createdAt: session.createdAt.toISOString(),
  };
}

export async function openPOSSession(
  companyId: string,
  branchId: string | undefined,
  warehouseId: string,
  cashierId: string,
  openingCash: number,
): Promise<MappedPOSSession> {
  const active = await findActiveSession(cashierId);
  if (active) {
    throw new BadRequestError('Cashier already has an active POS session open');
  }

  const wh = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
  if (!wh) {
    throw new NotFoundError(`Warehouse with ID "${warehouseId}" not found`);
  }

  const session = await prisma.$transaction(async (tx) => {
    const sessionNumber = await generatePOSSessionNumber(companyId, tx);
    return createSession(tx, {
      companyId,
      branchId,
      warehouseId,
      cashierId,
      sessionNumber,
      openingCash,
    });
  });

  console.warn(`[AUDIT] POS Session Opened: ${session.sessionNumber}`);
  return mapPOSSession(session);
}

export async function closePOSSession(
  cashierId: string,
  closingCash: number,
): Promise<MappedPOSSession> {
  const active = await findActiveSession(cashierId);
  if (!active) {
    throw new BadRequestError('No active POS session found to close');
  }

  const session = await prisma.$transaction(async (tx) => {
    return closeSession(tx, active.id, closingCash);
  });

  console.warn(`[AUDIT] POS Session Closed: ${session.sessionNumber}`);
  return mapPOSSession(session);
}

export async function getActivePOSSession(cashierId: string): Promise<MappedPOSSession> {
  const active = await findActiveSession(cashierId);
  if (!active) {
    throw new NotFoundError('No active POS session found for cashier');
  }
  return mapPOSSession(active);
}

export async function searchPOSProducts(q: string, warehouseId: string) {
  return searchProducts(q, warehouseId);
}
