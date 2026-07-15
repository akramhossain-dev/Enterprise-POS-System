'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiveService } from '@/services/goods-receive.service';
import { supplierInvoiceService } from '@/services/supplier-invoice.service';
import type { GoodsReceiveFilterParams, SupplierInvoiceFilterParams } from '@/types/goods-receive';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const GRN_KEYS = {
  all: ['goodsReceive'] as const,
  lists: () => [...GRN_KEYS.all, 'list'] as const,
  list: (params: any) => [...GRN_KEYS.lists(), params] as const,
  details: () => [...GRN_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...GRN_KEYS.details(), id] as const,
};

export const INVOICE_KEYS = {
  all: ['supplierInvoices'] as const,
  lists: () => [...INVOICE_KEYS.all, 'list'] as const,
  list: (params: any) => [...INVOICE_KEYS.lists(), params] as const,
  details: () => [...INVOICE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...INVOICE_KEYS.details(), id] as const,
};

// ── GOODS RECEIVE HOOKS ──────────────────────────────────────────────────────

export function useGRNs(params?: GoodsReceiveFilterParams) {
  return useQuery({
    queryKey: GRN_KEYS.list(params),
    queryFn: () => goodsReceiveService.getGRNs(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useGRNDetails(id: string) {
  return useQuery({
    queryKey: GRN_KEYS.detail(id),
    queryFn: () => goodsReceiveService.getGRN(id),
    enabled: !!id,
  });
}

export function useCreateGRN() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: Parameters<typeof goodsReceiveService.createGRN>[0]) =>
      goodsReceiveService.createGRN(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: GRN_KEYS.all });
      toast.success(`Goods Receive Note ${data.grnNumber} created successfully`);
      router.push(`/purchase/receive`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCompleteGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiveService.completeGRN(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: GRN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: GRN_KEYS.detail(data.id) });
      toast.success(`GRN ${data.grnNumber} has been finalized and stock has been committed.`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCancelGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiveService.cancelGRN(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: GRN_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: GRN_KEYS.detail(data.id) });
      toast.success(`GRN ${data.grnNumber} has been cancelled.`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── SUPPLIER INVOICE HOOKS ───────────────────────────────────────────────────

export function useSupplierInvoices(params?: SupplierInvoiceFilterParams) {
  return useQuery({
    queryKey: INVOICE_KEYS.list(params),
    queryFn: () => supplierInvoiceService.getInvoices(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useSupplierInvoiceDetails(id: string) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn: () => supplierInvoiceService.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateSupplierInvoice() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: Parameters<typeof supplierInvoiceService.createInvoice>[0]) =>
      supplierInvoiceService.createInvoice(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: GRN_KEYS.all });
      toast.success(`Supplier Invoice ${data.invoiceNumber} created successfully`);
      router.push(`/purchase/invoices`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
