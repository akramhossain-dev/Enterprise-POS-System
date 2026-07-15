'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesReturnService } from '@/services/sales-return.service';
import { toast } from 'sonner';

export const ORDERS_QUERY_KEY = ['pos-orders-history'] as const;
export const RETURNS_QUERY_KEY = ['pos-returns-history'] as const;
export const REFUNDS_QUERY_KEY = ['pos-refunds-history'] as const;

export function useOrders(params?: Parameters<typeof salesReturnService.getOrders>[0]) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, params],
    queryFn: () => salesReturnService.getOrders(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrderDetails(id: string) {
  return useQuery({
    queryKey: ['pos-order-details', id],
    queryFn: () => salesReturnService.getOrder(id),
    enabled: !!id,
  });
}

export function useVoidOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      salesReturnService.voidOrder(id, reason),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['pos-order-details', data.id] });
      toast.success(`Order ${data.invoiceNumber} voided successfully.`);
    },
    onError: () => {
      toast.error('Failed to void POS sale.');
    },
  });
}

export function useReturns(params?: Parameters<typeof salesReturnService.getReturns>[0]) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, params],
    queryFn: () => salesReturnService.getReturns(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useReturnDetails(id: string) {
  return useQuery({
    queryKey: ['pos-return-details', id],
    queryFn: () => salesReturnService.getReturn(id),
    enabled: !!id,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => salesReturnService.createReturn(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RETURNS_QUERY_KEY });
      toast.success('Return claim registered successfully.');
    },
    onError: () => {
      toast.error('Failed to create sales return.');
    },
  });
}

export function useApproveReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesReturnService.approveReturn(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RETURNS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['pos-return-details', data.id] });
      void queryClient.invalidateQueries({ queryKey: REFUNDS_QUERY_KEY });
      toast.success(`Return claim ${data.returnNumber} has been APPROVED and refunded.`);
    },
    onError: () => {
      toast.error('Failed to approve return claim.');
    },
  });
}

export function useRefunds(params?: Parameters<typeof salesReturnService.getRefunds>[0]) {
  return useQuery({
    queryKey: [...REFUNDS_QUERY_KEY, params],
    queryFn: () => salesReturnService.getRefunds(params),
    placeholderData: (previousData) => previousData,
  });
}
