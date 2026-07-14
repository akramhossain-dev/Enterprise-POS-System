'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import type {
  CustomerFilterParams,
  CustomerLedgerParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CreateCustomerAddressPayload,
} from '@/types/customer';
import { toast } from 'sonner';

// ── Query Keys ─────────────────────────────────────────────────

export const CUSTOMERS_KEY = ['customers'] as const;
export const CUSTOMER_KEY = (id: string) => ['customer', id] as const;
export const CUSTOMER_BALANCE_KEY = (id: string) => ['customer-balance', id] as const;
export const CUSTOMER_LEDGER_KEY = (id: string) => ['customer-ledger', id] as const;
export const CUSTOMER_ADDRESSES_KEY = (id: string) => ['customer-addresses', id] as const;

// ── List ───────────────────────────────────────────────────────

export function useCustomers(params?: CustomerFilterParams) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, params],
    queryFn: () => customerService.getCustomers(params),
    placeholderData: (prev) => prev,
  });
}

// ── Single ─────────────────────────────────────────────────────

export function useCustomer(id: string) {
  return useQuery({
    queryKey: CUSTOMER_KEY(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
}

// ── Balance ────────────────────────────────────────────────────

export function useCustomerBalance(id: string) {
  return useQuery({
    queryKey: CUSTOMER_BALANCE_KEY(id),
    queryFn: () => customerService.getCustomerBalance(id),
    enabled: !!id,
  });
}

// ── Ledger ─────────────────────────────────────────────────────

export function useCustomerLedger(id: string, params?: CustomerLedgerParams) {
  return useQuery({
    queryKey: [...CUSTOMER_LEDGER_KEY(id), params],
    queryFn: () => customerService.getCustomerLedger(id, params),
    enabled: !!id,
    placeholderData: (prev) => prev,
  });
}

// ── Addresses ──────────────────────────────────────────────────

export function useCustomerAddresses(id: string) {
  return useQuery({
    queryKey: CUSTOMER_ADDRESSES_KEY(id),
    queryFn: () => customerService.getCustomerAddresses(id),
    enabled: !!id,
  });
}

// ── Create ─────────────────────────────────────────────────────

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customerService.createCustomer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create customer';
      toast.error(message);
    },
  });
}

// ── Update ─────────────────────────────────────────────────────

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      customerService.updateCustomer(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      void queryClient.invalidateQueries({ queryKey: CUSTOMER_KEY(data.id) });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update customer';
      toast.error(message);
    },
  });
}

// ── Delete ─────────────────────────────────────────────────────

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete customer';
      toast.error(message);
    },
  });
}

// ── Archive ────────────────────────────────────────────────────

export function useArchiveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.archiveCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success('Customer archived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to archive customer';
      toast.error(message);
    },
  });
}

// ── Restore ────────────────────────────────────────────────────

export function useRestoreCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.restoreCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success('Customer restored successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to restore customer';
      toast.error(message);
    },
  });
}

// ── Add Address ────────────────────────────────────────────────

export function useAddCustomerAddress(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerAddressPayload) =>
      customerService.addCustomerAddress(customerId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMER_ADDRESSES_KEY(customerId) });
      void queryClient.invalidateQueries({ queryKey: CUSTOMER_KEY(customerId) });
      toast.success('Address added successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to add address';
      toast.error(message);
    },
  });
}
