'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutService } from '@/services/checkout.service';
import { cashDrawerService } from '@/services/cash-drawer.service';
import { toast } from 'sonner';

export const TRANSACTIONS_KEY = ['checkout-transactions'] as const;
export const ACTIVE_SHIFT_KEY = ['active-cash-shift'] as const;

export function useTransactions(params?: Parameters<typeof checkoutService.getTransactions>[0]) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, params],
    queryFn: () => checkoutService.getTransactions(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useTransactionDetails(id: string) {
  return useQuery({
    queryKey: ['checkout-transaction', id],
    queryFn: () => checkoutService.getTransaction(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => checkoutService.createTransaction(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACTIVE_SHIFT_KEY });
    },
    onError: () => {
      toast.error('Failed to complete sale transaction.');
    },
  });
}

// Cash Drawer Shift hooks
export function useActiveShift() {
  return useQuery({
    queryKey: ACTIVE_SHIFT_KEY,
    queryFn: () => cashDrawerService.getActiveShift(),
  });
}

export function useOpenShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cashierName,
      openingBalance,
    }: {
      cashierName: string;
      openingBalance: number;
    }) => cashDrawerService.openShift(cashierName, openingBalance),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACTIVE_SHIFT_KEY });
      toast.success('Cash Drawer shift opened successfully.');
    },
    onError: () => {
      toast.error('Failed to open Cash Drawer shift.');
    },
  });
}

export function useCloseShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cashDrawerService.closeShift(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACTIVE_SHIFT_KEY });
      toast.success('Cash Drawer shift closed. Drawer safe balance logged.');
    },
    onError: () => {
      toast.error('Failed to close Cash Drawer shift.');
    },
  });
}

export function useLogCashEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, amount, notes }: { type: 'IN' | 'OUT'; amount: number; notes: string }) =>
      cashDrawerService.logCashEntry(type, amount, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACTIVE_SHIFT_KEY });
      toast.success('Cash ledger log updated.');
    },
    onError: () => {
      toast.error('Failed to log Cash Drawer transaction.');
    },
  });
}
