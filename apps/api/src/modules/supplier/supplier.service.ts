// ─────────────────────────────────────────────
// Supplier Module — Service Layer
// Business rules, duplicate checks, audit stubs
// ─────────────────────────────────────────────

import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import {
  CreateSupplierBody,
  UpdateSupplierBody,
  CreateAddressBody,
  SupplierQuery,
} from './supplier.schema';
import {
  findSuppliers,
  findSupplierById as repoFindById,
  findSupplierByEmail,
  findSupplierByPhone,
  generateSupplierCode,
  createSupplier as repoCreate,
  updateSupplier as repoUpdate,
  softDeleteSupplier as repoSoftDelete,
  addSupplierAddress as repoAddAddress,
  findSupplierAddresses as repoListAddresses,
} from './supplier.repository';
import {
  mapSupplier,
  mapSupplierList,
  mapAddress,
  MappedSupplier,
  MappedSupplierAddress,
} from './supplier.mapper';
import { SupplierAuditPayload } from './supplier.types';

// ── Audit hook stub ────────────────────────────────────────────────────────────

async function emitAuditEvent(payload: SupplierAuditPayload): Promise<void> {
  // TODO: Phase B_AUDIT — wire to AuditLogService.record(payload)
  void payload;
  await Promise.resolve();
}

// ── List ───────────────────────────────────────────────────────────────────────

export async function listSuppliers(query: SupplierQuery): Promise<{
  suppliers: MappedSupplier[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { suppliers, meta } = await findSuppliers(query);
  return { suppliers: mapSupplierList(suppliers), meta };
}

// ── Get by ID ──────────────────────────────────────────────────────────────────

export async function getSupplierById(id: string): Promise<MappedSupplier> {
  const supplier = await repoFindById(id);
  if (!supplier) {
    throw new NotFoundError(`Supplier with ID "${id}" not found`);
  }
  return mapSupplier(supplier);
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createSupplier(
  body: CreateSupplierBody,
  actorId: string,
): Promise<MappedSupplier> {
  // Duplicate guard — phone
  if (body.phone) {
    const dup = await findSupplierByPhone(body.phone);
    if (dup) {
      throw new ConflictError(`A supplier with phone "${body.phone}" already exists`);
    }
  }

  // Duplicate guard — email
  if (body.email) {
    const dup = await findSupplierByEmail(body.email);
    if (dup) {
      throw new ConflictError(`A supplier with email "${body.email}" already exists`);
    }
  }

  const supplierCode = await generateSupplierCode();
  const supplier = await repoCreate(body, supplierCode);

  await emitAuditEvent({
    actorId,
    supplierId: supplier.id,
    supplierCode: supplier.supplierCode,
    action: 'CREATED',
  });

  return mapSupplier(supplier);
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateSupplier(
  id: string,
  body: UpdateSupplierBody,
  actorId: string,
): Promise<MappedSupplier> {
  const existing = await repoFindById(id);
  if (!existing) {
    throw new NotFoundError(`Supplier with ID "${id}" not found`);
  }

  // Duplicate guard — phone
  if (body.phone && body.phone !== existing.phone) {
    const dup = await findSupplierByPhone(body.phone, id);
    if (dup) {
      throw new ConflictError(`A supplier with phone "${body.phone}" already exists`);
    }
  }

  // Duplicate guard — email
  if (body.email && body.email !== existing.email) {
    const dup = await findSupplierByEmail(body.email, id);
    if (dup) {
      throw new ConflictError(`A supplier with email "${body.email}" already exists`);
    }
  }

  const updated = await repoUpdate(id, body);

  await emitAuditEvent({
    actorId,
    supplierId: updated.id,
    supplierCode: updated.supplierCode,
    action: 'UPDATED',
    changes: body,
  });

  return mapSupplier(updated);
}

// ── Soft Delete ────────────────────────────────────────────────────────────────

export async function deleteSupplier(id: string, actorId: string): Promise<void> {
  const existing = await repoFindById(id);
  if (!existing) {
    throw new NotFoundError(`Supplier with ID "${id}" not found`);
  }

  await repoSoftDelete(id);

  await emitAuditEvent({
    actorId,
    supplierId: existing.id,
    supplierCode: existing.supplierCode,
    action: 'DELETED',
  });
}

// ── Address ────────────────────────────────────────────────────────────────────

export async function addAddress(
  supplierId: string,
  data: CreateAddressBody,
): Promise<MappedSupplierAddress> {
  const supplier = await repoFindById(supplierId);
  if (!supplier) {
    throw new NotFoundError(`Supplier with ID "${supplierId}" not found`);
  }
  const address = await repoAddAddress(supplierId, data);
  return mapAddress(address);
}

export async function listSupplierAddresses(supplierId: string): Promise<MappedSupplierAddress[]> {
  const supplier = await repoFindById(supplierId);
  if (!supplier) {
    throw new NotFoundError(`Supplier with ID "${supplierId}" not found`);
  }
  const addresses = await repoListAddresses(supplierId);
  return addresses.map(mapAddress);
}

// ── Future stubs (DO NOT implement) ───────────────────────────────────────────
// getSupplierPurchaseHistory(supplierId)  — Phase: Purchase
// getSupplierLedger(supplierId)           — Phase: Accounting
// getSupplierDue(supplierId)              — Phase: Accounting
// getSupplierPaymentHistory(supplierId)   — Phase: Accounting
// getSupplierStatement(supplierId)        — Phase: Reports
// getSupplierPerformance(supplierId)      — Phase: Analytics
