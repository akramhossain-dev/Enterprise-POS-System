'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplier.service';
import type {
  SupplierFilterParams,
  SupplierLedgerParams,
  SupplierPaymentParams,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  CreateSupplierAddressPayload,
  CreateSupplierPaymentPayload,
} from '@/types/supplier';
import { toast } from 'sonner';

// ── Query Keys ─────────────────────────────────────────────────

export const SUPPLIERS_KEY = ['suppliers'] as const;
export const SUPPLIER_KEY = (id: string) => ['supplier', id] as const;
export const SUPPLIER_BALANCE_KEY = (id: string) => ['supplier-balance', id] as const;
export const SUPPLIER_LEDGER_KEY = (id: string) => ['supplier-ledger', id] as const;
export const SUPPLIER_ADDRESSES_KEY = (id: string) => ['supplier-addresses', id] as const;
export const SUPPLIER_PAYMENTS_KEY = ['supplier-payments'] as const;

// ── List ───────────────────────────────────────────────────────

export function useSuppliers(params?: SupplierFilterParams) {
  return useQuery({
    queryKey: [...SUPPLIERS_KEY, params],
    queryFn: () => supplierService.getSuppliers(params),
    placeholderData: (prev) => prev,
  });
}

// ── Single ─────────────────────────────────────────────────────

export function useSupplier(id: string) {
  return useQuery({
    queryKey: SUPPLIER_KEY(id),
    queryFn: () => supplierService.getSupplier(id),
    enabled: !!id,
  });
}

// ── Balance ────────────────────────────────────────────────────

export function useSupplierBalance(id: string) {
  return useQuery({
    queryKey: SUPPLIER_BALANCE_KEY(id),
    queryFn: () => supplierService.getSupplierBalance(id),
    enabled: !!id,
  });
}

// ── Ledger ─────────────────────────────────────────────────────

export function useSupplierLedger(id: string, params?: SupplierLedgerParams) {
  return useQuery({
    queryKey: [...SUPPLIER_LEDGER_KEY(id), params],
    queryFn: () => supplierService.getSupplierLedger(id, params),
    enabled: !!id,
    placeholderData: (prev) => prev,
  });
}

// ── Addresses ──────────────────────────────────────────────────

export function useSupplierAddresses(id: string) {
  return useQuery({
    queryKey: SUPPLIER_ADDRESSES_KEY(id),
    queryFn: () => supplierService.getSupplierAddresses(id),
    enabled: !!id,
  });
}

// ── Payments ───────────────────────────────────────────────────

export function useSupplierPayments(params?: SupplierPaymentParams) {
  return useQuery({
    queryKey: [...SUPPLIER_PAYMENTS_KEY, params],
    queryFn: () => supplierService.getSupplierPayments(params),
    enabled: !!params?.supplierId,
    placeholderData: (prev) => prev,
  });
}

// ── Create ─────────────────────────────────────────────────────

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => supplierService.createSupplier(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      toast.success('Supplier created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to create supplier');
    },
  });
}

// ── Update ─────────────────────────────────────────────────────

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      supplierService.updateSupplier(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(data.id) });
      toast.success('Supplier updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to update supplier');
    },
  });
}

// ── Delete ─────────────────────────────────────────────────────

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      toast.success('Supplier deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to delete supplier');
    },
  });
}

// ── Archive ────────────────────────────────────────────────────

export function useArchiveSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierService.archiveSupplier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      toast.success('Supplier archived');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to archive supplier');
    },
  });
}

// ── Restore ────────────────────────────────────────────────────

export function useRestoreSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierService.restoreSupplier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      toast.success('Supplier restored');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to restore supplier');
    },
  });
}

// ── Add Address ────────────────────────────────────────────────

export function useAddSupplierAddress(supplierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierAddressPayload) =>
      supplierService.addSupplierAddress(supplierId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_ADDRESSES_KEY(supplierId) });
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_KEY(supplierId) });
      toast.success('Address added');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to add address');
    },
  });
}

// ── Create Payment ─────────────────────────────────────────────

export function useCreateSupplierPayment(supplierId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPaymentPayload) =>
      supplierService.createSupplierPayment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_PAYMENTS_KEY });
      if (supplierId) {
        void queryClient.invalidateQueries({ queryKey: SUPPLIER_BALANCE_KEY(supplierId) });
        void queryClient.invalidateQueries({ queryKey: SUPPLIER_LEDGER_KEY(supplierId) });
      }
      toast.success('Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to record payment');
    },
  });
}
