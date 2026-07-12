// ─────────────────────────────────────────────
// Customer Module — Mapper
// Maps raw Prisma records to clean API response shapes
// ─────────────────────────────────────────────

import {
  Customer as PrismaCustomer,
  CustomerAddress as PrismaCustomerAddress,
} from '@prisma/client';

export type PrismaCustomerAddressRaw = PrismaCustomerAddress;

export interface MappedCustomerAddress {
  id: string;
  customerId: string;
  label: string;
  country: string | null;
  state: string | null;
  city: string | null;
  area: string | null;
  postalCode: string | null;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapAddress(addr: PrismaCustomerAddressRaw): MappedCustomerAddress {
  return {
    id: addr.id,
    customerId: addr.customerId,
    label: addr.label,
    country: addr.country,
    state: addr.state,
    city: addr.city,
    area: addr.area,
    postalCode: addr.postalCode,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    isDefault: addr.isDefault,
    createdAt: addr.createdAt.toISOString(),
    updatedAt: addr.updatedAt.toISOString(),
  };
}

export type PrismaCustomerWithAddresses = PrismaCustomer & {
  addresses: PrismaCustomerAddressRaw[];
};

export interface MappedCustomer {
  id: string;
  companyId: string;
  branchId: string | null;
  customerCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  alternativePhone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationalId: string | null;
  taxNumber: string | null;
  creditLimit: string;
  openingBalance: string;
  currentBalance: string;
  loyaltyPoints: number;
  status: string;
  notes: string | null;
  addresses: MappedCustomerAddress[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export function mapCustomer(customer: PrismaCustomerWithAddresses): MappedCustomer {
  return {
    id: customer.id,
    companyId: customer.companyId,
    branchId: customer.branchId,
    customerCode: customer.customerCode,
    firstName: customer.firstName,
    lastName: customer.lastName,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    alternativePhone: customer.alternativePhone,
    dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.toISOString() : null,
    gender: customer.gender,
    nationalId: customer.nationalId,
    taxNumber: customer.taxNumber,
    creditLimit: customer.creditLimit.toString(),
    openingBalance: customer.openingBalance.toString(),
    currentBalance: customer.currentBalance.toString(),
    loyaltyPoints: customer.loyaltyPoints,
    status: customer.status,
    notes: customer.notes,
    addresses: customer.addresses.map(mapAddress),
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    deletedAt: customer.deletedAt ? customer.deletedAt.toISOString() : null,
  };
}

export function mapCustomerList(customers: PrismaCustomerWithAddresses[]): MappedCustomer[] {
  return customers.map(mapCustomer);
}
