'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustmentService } from '@/services/adjustment.service';
import { transferService } from '@/services/transfer.service';
import { stockTakeService } from '@/services/stocktake.service';
import type {
  StockAdjustmentFilterParams,
  StockTransferFilterParams,
  StockTakeFilterParams,
  ReconciliationFilterParams,
  TransferStatus,
} from '@/types/inventory';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ---- QUERY KEYS ----
export const ADJUSTMENT_KEYS = {
  all: ['adjustments'] as const,
  lists: () => [...ADJUSTMENT_KEYS.all, 'list'] as const,
  list: (params: any) => [...ADJUSTMENT_KEYS.lists(), params] as const,
  details: () => [...ADJUSTMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ADJUSTMENT_KEYS.details(), id] as const,
};

export const TRANSFER_KEYS = {
  all: ['transfers'] as const,
  lists: () => [...TRANSFER_KEYS.all, 'list'] as const,
  list: (params: any) => [...TRANSFER_KEYS.lists(), params] as const,
  details: () => [...TRANSFER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TRANSFER_KEYS.details(), id] as const,
};

export const STOCKTAKE_KEYS = {
  all: ['stockTakes'] as const,
  lists: () => [...STOCKTAKE_KEYS.all, 'list'] as const,
  list: (params: any) => [...STOCKTAKE_KEYS.lists(), params] as const,
  details: () => [...STOCKTAKE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...STOCKTAKE_KEYS.details(), id] as const,
};

export const RECONCILIATION_KEYS = {
  all: ['reconciliations'] as const,
  lists: () => [...RECONCILIATION_KEYS.all, 'list'] as const,
  list: (params: any) => [...RECONCILIATION_KEYS.lists(), params] as const,
  details: () => [...RECONCILIATION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RECONCILIATION_KEYS.details(), id] as const,
};

// ---- STOCK ADJUSTMENT HOOKS ----
export function useAdjustments(params?: StockAdjustmentFilterParams) {
  return useQuery({
    queryKey: ADJUSTMENT_KEYS.list(params),
    queryFn: () => adjustmentService.getAdjustments(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useAdjustmentDetails(id: string) {
  return useQuery({
    queryKey: ADJUSTMENT_KEYS.detail(id),
    queryFn: () => adjustmentService.getAdjustment(id),
    enabled: !!id,
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      warehouseId: string;
      productId: string;
      type: string;
      quantity: number;
      reason: string;
      remarks?: string;
    }) => adjustmentService.createAdjustment(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ADJUSTMENT_KEYS.all });
      toast.success('Stock adjustment created and applied successfully');
      router.push(`/inventory/adjustments`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ---- STOCK TRANSFER HOOKS ----
export function useTransfers(params?: StockTransferFilterParams) {
  return useQuery({
    queryKey: TRANSFER_KEYS.list(params),
    queryFn: () => transferService.getTransfers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useTransferDetails(id: string) {
  return useQuery({
    queryKey: TRANSFER_KEYS.detail(id),
    queryFn: () => transferService.getTransfer(id),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      fromWarehouseId: string;
      toWarehouseId: string;
      remarks?: string;
      items: Array<{ productId: string; quantity: number }>;
    }) => transferService.createTransfer(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success('Stock transfer request registered successfully');
      router.push(`/inventory/transfers`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transferService.approveTransfer(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(data.id) });
      toast.success('Transfer approved successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useRejectTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transferService.rejectTransfer(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(data.id) });
      toast.success('Transfer request rejected');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCompleteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transferService.completeTransfer(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(data.id) });
      toast.success('Transfer items received, quantities successfully adjusted');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ---- STOCK TAKE (CYCLE COUNT) HOOKS ----
export function useStockTakes(params?: StockTakeFilterParams) {
  return useQuery({
    queryKey: STOCKTAKE_KEYS.list(params),
    queryFn: () => stockTakeService.getStockTakes(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useStockTakeDetails(id: string) {
  return useQuery({
    queryKey: STOCKTAKE_KEYS.detail(id),
    queryFn: () => stockTakeService.getStockTake(id),
    enabled: !!id,
  });
}

export function useCreateStockTake() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      warehouseId: string;
      title: string;
      conductedBy?: string;
    }) => stockTakeService.createStockTake(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.all });
      toast.success('Cycle count session initialized');
      router.push(`/inventory/cycle-count/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function usePopulateStockTake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockTakeService.populateStockTake(id),
    onSuccess: (res, id) => {
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(id) });
      toast.success(`Session populated with ${res.count} current inventory items`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateStockTakeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { productId: string; physicalQuantity: number; remarks?: string };
    }) => stockTakeService.addOrUpdateItem(id, payload),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(variables.id) });
      toast.success('Item physical count updated');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useBulkAddStockTakeItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { items: Array<{ productId: string; physicalQuantity: number; remarks?: string }> };
    }) => stockTakeService.bulkAddItems(id, payload),
    onSuccess: (res, variables) => {
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(variables.id) });
      toast.success(`Successfully uploaded counts for ${res.count} items`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useStartStockTake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockTakeService.startStockTake(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(data.id) });
      toast.success('Cycle count session started (IN_PROGRESS)');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCompleteStockTake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockTakeService.completeStockTake(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(data.id) });
      toast.success('Cycle count completed. Verification file locked.');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useCancelStockTake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockTakeService.cancelStockTake(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(data.id) });
      toast.success('Cycle count session cancelled');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ---- RECONCILIATION HOOKS ----
export function useReconciliations(params?: ReconciliationFilterParams) {
  return useQuery({
    queryKey: RECONCILIATION_KEYS.list(params),
    queryFn: () => stockTakeService.getReconciliations(params),
    staleTime: 5000,
  });
}

export function useCreateReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { companyId: string; stockTakeId: string; notes?: string }) =>
      stockTakeService.createReconciliation(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RECONCILIATION_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(data.stockTakeId) });
      toast.success('Stock reconciliation file created successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useApproveReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { notes?: string } }) =>
      stockTakeService.approveReconciliation(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RECONCILIATION_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(data.stockTakeId) });
      toast.success('Reconciliation approved. Physical corrections applied to stock levels.');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useRejectReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { notes?: string } }) =>
      stockTakeService.rejectReconciliation(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: RECONCILIATION_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: STOCKTAKE_KEYS.detail(data.stockTakeId) });
      toast.success('Reconciliation rejected');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
