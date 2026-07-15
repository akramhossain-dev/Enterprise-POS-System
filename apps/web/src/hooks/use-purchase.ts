'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderService } from '@/services/purchase-order.service';
import { purchaseRequisitionService } from '@/services/purchase-requisition.service';
import type {
  PurchaseOrderFilterParams,
  PurchaseRequisitionFilterParams,
  PurchaseRequisition,
} from '@/types/purchase';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ---- QUERY KEYS ----
export const PO_KEYS = {
  all: ['purchaseOrders'] as const,
  lists: () => [...PO_KEYS.all, 'list'] as const,
  list: (params: any) => [...PO_KEYS.lists(), params] as const,
  details: () => [...PO_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PO_KEYS.details(), id] as const,
};

export const PR_KEYS = {
  all: ['purchaseRequisitions'] as const,
  lists: () => [...PR_KEYS.all, 'list'] as const,
  list: (params: any) => [...PR_KEYS.lists(), params] as const,
  details: () => [...PR_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PR_KEYS.details(), id] as const,
};

// ── PURCHASE ORDER HOOKS ─────────────────────────────────────────────────────

export function usePurchaseOrders(params?: PurchaseOrderFilterParams) {
  return useQuery({
    queryKey: PO_KEYS.list(params),
    queryFn: () => purchaseOrderService.getPOs(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function usePurchaseOrderDetails(id: string) {
  return useQuery({
    queryKey: PO_KEYS.detail(id),
    queryFn: () => purchaseOrderService.getPO(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      branchId?: string | null;
      warehouseId: string;
      supplierId: string;
      purchaseOrderNumber: string;
      orderDate?: string;
      expectedDate?: string | null;
      remarks?: string | null;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        discount?: number;
        tax?: number;
      }>;
      shippingCost?: number;
      discount?: number;
      tax?: number;
    }) => purchaseOrderService.createPO(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      toast.success(`Purchase Order ${data.purchaseOrderNumber} created successfully`);
      router.push(`/purchase/orders`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        branchId?: string | null;
        warehouseId?: string;
        supplierId?: string;
        expectedDate?: string | null;
        remarks?: string | null;
        items?: Array<{
          productId: string;
          quantity: number;
          unitPrice: number;
          discount?: number;
          tax?: number;
        }>;
        shippingCost?: number;
        discount?: number;
        tax?: number;
      };
    }) => purchaseOrderService.updatePO(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.detail(data.id) });
      toast.success(`Purchase Order ${data.purchaseOrderNumber} updated successfully`);
      router.push(`/purchase/orders/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.submitPO(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.detail(data.id) });
      toast.success(`Purchase Order submitted for approvals`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.approvePO(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.detail(data.id) });
      toast.success(`Purchase Order approved successfully`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.rejectPO(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.detail(data.id) });
      toast.success(`Purchase Order has been rejected`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.cancelPO(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.detail(data.id) });
      toast.success(`Purchase Order cancelled`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.deletePO(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      toast.success(`Purchase Order deleted successfully`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── PURCHASE REQUISITIONS HOOKS ──────────────────────────────────────────────

export function usePurchaseRequisitions(params?: PurchaseRequisitionFilterParams) {
  return useQuery({
    queryKey: PR_KEYS.list(params),
    queryFn: () => purchaseRequisitionService.getRequisitions(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function usePurchaseRequisitionDetails(id: string) {
  return useQuery({
    queryKey: PR_KEYS.detail(id),
    queryFn: () => purchaseRequisitionService.getRequisition(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseRequisition() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (
      payload: Omit<
        PurchaseRequisition,
        'id' | 'status' | 'convertedPoId' | 'createdAt' | 'updatedAt'
      >,
    ) => purchaseRequisitionService.createRequisition(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      toast.success(`Purchase Requisition created successfully`);
      router.push(`/purchase/requisitions`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdatePurchaseRequisition() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<
        Omit<PurchaseRequisition, 'id' | 'convertedPoId' | 'createdAt' | 'updatedAt'>
      >;
    }) => purchaseRequisitionService.updateRequisition(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.detail(data.id) });
      toast.success(`Requisition updated successfully`);
      router.push(`/purchase/requisitions/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useSubmitPurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequisitionService.submitRequisition(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.detail(data.id) });
      toast.success(`Requisition submitted for approval`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useApprovePurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequisitionService.approveRequisition(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.detail(data.id) });
      toast.success(`Requisition approved successfully`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useRejectPurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequisitionService.rejectRequisition(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.detail(data.id) });
      toast.success(`Requisition rejected`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCancelPurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequisitionService.cancelRequisition(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.detail(data.id) });
      toast.success(`Requisition cancelled`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeletePurchaseRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseRequisitionService.deleteRequisition(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      toast.success(`Requisition deleted successfully`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useMarkRequisitionConverted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, poId }: { id: string; poId: string }) =>
      purchaseRequisitionService.markConverted(id, poId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PR_KEYS.detail(data.id) });
    },
  });
}
