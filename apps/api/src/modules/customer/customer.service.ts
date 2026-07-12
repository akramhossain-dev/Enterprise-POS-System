// ─────────────────────────────────────────────
// Customer Module — Service Layer
// ─────────────────────────────────────────────

import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import { buildPaginationMeta } from '../../common/utils/query';
import {
  CreateCustomerBody,
  UpdateCustomerBody,
  CreateAddressBody,
  CustomerQuery,
} from './customer.schema';
import {
  findCustomers,
  findCustomerById as repoFindById,
  findCustomerByEmail,
  findCustomerByPhone,
  generateCustomerCode,
  createCustomer as repoCreate,
  updateCustomer as repoUpdate,
  softDeleteCustomer as repoSoftDelete,
  addCustomerAddress as repoAddAddress,
  findCustomerAddresses as repoListAddresses,
} from './customer.repository';
import {
  mapCustomer,
  mapCustomerList,
  mapAddress,
  MappedCustomer,
  MappedCustomerAddress,
} from './customer.mapper';
import { CustomerAuditPayload } from './customer.types';

// ── Audit hook stub ────────────────────────────────────────────────────────────

async function emitAuditEvent(payload: CustomerAuditPayload): Promise<void> {
  // TODO: Phase B_AUDIT — wire to AuditLogService.record(payload)
  void payload;
  await Promise.resolve();
}

// ── List ───────────────────────────────────────────────────────────────────────

export async function listCustomers(query: CustomerQuery): Promise<{
  customers: MappedCustomer[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const { customers, meta } = await findCustomers(query);
  return { customers: mapCustomerList(customers), meta };
}

// ── Get by ID ──────────────────────────────────────────────────────────────────

export async function getCustomerById(id: string): Promise<MappedCustomer> {
  const customer = await repoFindById(id);
  if (!customer) {
    throw new NotFoundError(`Customer with ID "${id}" not found`);
  }
  return mapCustomer(customer);
}

// ── Create ─────────────────────────────────────────────────────────────────────

export async function createCustomer(
  body: CreateCustomerBody,
  actorId: string,
): Promise<MappedCustomer> {
  if (body.phone) {
    const existing = await findCustomerByPhone(body.phone);
    if (existing) {
      throw new ConflictError(`A customer with phone "${body.phone}" already exists`);
    }
  }
  if (body.email) {
    const existing = await findCustomerByEmail(body.email);
    if (existing) {
      throw new ConflictError(`A customer with email "${body.email}" already exists`);
    }
  }

  const customerCode = await generateCustomerCode();
  const customer = await repoCreate(body, customerCode);

  await emitAuditEvent({
    actorId,
    customerId: customer.id,
    customerCode: customer.customerCode,
    action: 'CREATED',
  });

  return mapCustomer(customer);
}

// ── Update ─────────────────────────────────────────────────────────────────────

export async function updateCustomer(
  id: string,
  body: UpdateCustomerBody,
  actorId: string,
): Promise<MappedCustomer> {
  const existing = await repoFindById(id);
  if (!existing) {
    throw new NotFoundError(`Customer with ID "${id}" not found`);
  }

  if (body.phone && body.phone !== existing.phone) {
    const dup = await findCustomerByPhone(body.phone, id);
    if (dup) {
      throw new ConflictError(`A customer with phone "${body.phone}" already exists`);
    }
  }
  if (body.email && body.email !== existing.email) {
    const dup = await findCustomerByEmail(body.email, id);
    if (dup) {
      throw new ConflictError(`A customer with email "${body.email}" already exists`);
    }
  }

  const updated = await repoUpdate(id, body);

  await emitAuditEvent({
    actorId,
    customerId: updated.id,
    customerCode: updated.customerCode,
    action: 'UPDATED',
    changes: body,
  });

  return mapCustomer(updated);
}

// ── Soft Delete ────────────────────────────────────────────────────────────────

export async function deleteCustomer(id: string, actorId: string): Promise<void> {
  const existing = await repoFindById(id);
  if (!existing) {
    throw new NotFoundError(`Customer with ID "${id}" not found`);
  }

  await repoSoftDelete(id);

  await emitAuditEvent({
    actorId,
    customerId: existing.id,
    customerCode: existing.customerCode,
    action: 'DELETED',
  });
}

// ── Address ────────────────────────────────────────────────────────────────────

export async function addAddress(
  customerId: string,
  data: CreateAddressBody,
): Promise<MappedCustomerAddress> {
  const customer = await repoFindById(customerId);
  if (!customer) {
    throw new NotFoundError(`Customer with ID "${customerId}" not found`);
  }
  const address = await repoAddAddress(customerId, data);
  return mapAddress(address);
}

export async function listCustomerAddresses(customerId: string): Promise<MappedCustomerAddress[]> {
  const customer = await repoFindById(customerId);
  if (!customer) {
    throw new NotFoundError(`Customer with ID "${customerId}" not found`);
  }
  const addresses = await repoListAddresses(customerId);
  return addresses.map(mapAddress);
}

// ── Future stubs (DO NOT implement) ───────────────────────────────────────────
// async function getCustomerSalesHistory(customerId: string) { /* Phase: Sales */ }
// async function getCustomerDue(customerId: string) { /* Phase: Accounting */ }
// async function getCustomerPaymentHistory(customerId: string) { /* Phase: Accounting */ }
// async function getCustomerLoyalty(customerId: string) { /* Phase: Loyalty */ }
// async function getCustomerLedger(customerId: string) { /* Phase: Accounting */ }
// async function getCustomerStatement(customerId: string) { /* Phase: Reports */ }
// async function getCustomerNotes(customerId: string) { /* Phase: CRM */ }
