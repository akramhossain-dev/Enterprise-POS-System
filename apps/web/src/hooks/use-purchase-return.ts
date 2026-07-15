'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseReturnService } from '@/services/purchase-return.service';
import { supplierCreditNoteService } from '@/services/supplier-credit-note.service';
import { supplierDebitNoteService } from '@/services/supplier-debit-note.service';
import type {
  PurchaseReturnFilterParams,
  SupplierCreditNoteFilterParams,
  SupplierDebitNoteFilterParams,
  PurchaseReturn,
  SupplierCreditNote,
  SupplierDebitNote,
} from '@/types/purchase-return';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ---- QUERY KEYS ----
export const RETURN_KEYS = {
  all: ['purchaseReturns'] as const,
  lists: () => [...RETURN_KEYS.all, 'list'] as const,
  list: (params: any) => [...RETURN_KEYS.lists(), params] as const,
  details: () => [...RETURN_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RETURN_KEYS.details(), id] as const,
};

export const CREDIT_KEYS = {
  all: ['supplierCreditNotes'] as const,
  lists: () => [...CREDIT_KEYS.all, 'list'] as const,
  list: (params: any) => [...CREDIT_KEYS.lists(), params] as const,
};

export const DEBIT_KEYS = {
  all: ['supplierDebitNotes'] as const,
  lists: () => [...DEBIT_KEYS.all, 'list'] as const,
  list: (params: any) => [...DEBIT_KEYS.lists(), params] as const,
};

// ── PURCHASE RETURN HOOKS ───────────────────────────────────────────────────

export function usePurchaseReturns(params?: PurchaseReturnFilterParams) {
  return useQuery({
    queryKey: RETURN_KEYS.list(params),
    queryFn: () => purchaseReturnService.getReturns(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function usePurchaseReturnDetails(id: string) {
  return useQuery({
    queryKey: RETURN_KEYS.detail(id),
    queryFn: () => purchaseReturnService.getReturn(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: Parameters<typeof purchaseReturnService.createReturn>[0]) =>
      purchaseReturnService.createReturn(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      toast.success(`Purchase Return ${data.returnNumber} created successfully`);
      router.push(`/purchase/returns`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdatePurchaseReturn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof purchaseReturnService.updateReturn>[1];
    }) => purchaseReturnService.updateReturn(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(data.id) });
      toast.success(`Purchase Return ${data.returnNumber} updated successfully`);
      router.push(`/purchase/returns/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useSubmitPurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseReturnService.submitReturn(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(data.id) });
      toast.success(`Purchase Return submitted for approval`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useApprovePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      purchaseReturnService.approveReturn(id, notes),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(data.id) });
      toast.success(`Purchase Return approved successfully`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useRejectPurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      purchaseReturnService.rejectReturn(id, notes),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(data.id) });
      toast.success(`Purchase Return rejected`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCancelPurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseReturnService.cancelReturn(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(data.id) });
      toast.success(`Purchase Return cancelled`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCompletePurchaseReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseReturnService.completeReturn(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: RETURN_KEYS.detail(data.id) });
      void queryClient.invalidateQueries({ queryKey: CREDIT_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: DEBIT_KEYS.all });
      toast.success(`Purchase Return finalized and completed.`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── SUPPLIER CREDIT NOTE HOOKS ───────────────────────────────────────────────

export function useSupplierCreditNotes(params?: SupplierCreditNoteFilterParams) {
  return useQuery({
    queryKey: CREDIT_KEYS.list(params),
    queryFn: () => supplierCreditNoteService.getCreditNotes(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCreateSupplierCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof supplierCreditNoteService.createCreditNote>[0]) =>
      supplierCreditNoteService.createCreditNote(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CREDIT_KEYS.all });
      toast.success('Supplier Credit Note created successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── SUPPLIER DEBIT NOTE HOOKS ────────────────────────────────────────────────

export function useSupplierDebitNotes(params?: SupplierDebitNoteFilterParams) {
  return useQuery({
    queryKey: DEBIT_KEYS.list(params),
    queryFn: () => supplierDebitNoteService.getDebitNotes(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCreateSupplierDebitNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof supplierDebitNoteService.createDebitNote>[0]) =>
      supplierDebitNoteService.createDebitNote(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEBIT_KEYS.all });
      toast.success('Supplier Debit Note created successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
