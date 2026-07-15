'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { batchService } from '@/services/batch.service';
import { serialService } from '@/services/serial.service';
import type {
  InventoryFilterParams,
  BatchFilterParams,
  SerialFilterParams,
  StockHistoryFilterParams,
  BatchStatus,
  SerialStatus,
} from '@/types/inventory';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';

// ---- QUERY KEYS ----
export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  lists: () => [...INVENTORY_KEYS.all, 'list'] as const,
  list: (params: any) => [...INVENTORY_KEYS.lists(), params] as const,
  details: () => [...INVENTORY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...INVENTORY_KEYS.details(), id] as const,
  summary: () => [...INVENTORY_KEYS.all, 'summary'] as const,
  alerts: () => [...INVENTORY_KEYS.all, 'alerts'] as const,
  alertsList: (params: any) => [...INVENTORY_KEYS.alerts(), params] as const,
  suggestions: () => [...INVENTORY_KEYS.all, 'suggestions'] as const,
  ledger: () => [...INVENTORY_KEYS.all, 'ledger'] as const,
  ledgerList: (params: any) => [...INVENTORY_KEYS.ledger(), params] as const,
};

export const BATCH_KEYS = {
  all: ['batches'] as const,
  lists: () => [...BATCH_KEYS.all, 'list'] as const,
  list: (params: any) => [...BATCH_KEYS.lists(), params] as const,
  details: () => [...BATCH_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BATCH_KEYS.details(), id] as const,
};

export const SERIAL_KEYS = {
  all: ['serials'] as const,
  lists: () => [...SERIAL_KEYS.all, 'list'] as const,
  list: (params: any) => [...SERIAL_KEYS.lists(), params] as const,
  details: () => [...SERIAL_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SERIAL_KEYS.details(), id] as const,
};

// ---- INVENTORY HOOKS ----
export function useInventoryList(params?: InventoryFilterParams) {
  return useQuery({
    queryKey: INVENTORY_KEYS.list(params),
    queryFn: () => inventoryService.getInventories(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useInventoryRecord(id: string) {
  return useQuery({
    queryKey: INVENTORY_KEYS.detail(id),
    queryFn: () => inventoryService.getInventory(id),
    enabled: !!id,
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: INVENTORY_KEYS.summary(),
    queryFn: () => inventoryService.getInventorySummary(),
    staleTime: 10000,
  });
}

export function useAddOpeningStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      warehouseId: string;
      productId: string;
      quantity: number;
      averageCost: number;
      minimumQuantity: number;
      reorderQuantity: number;
      maximumQuantity?: number;
    }) => inventoryService.addOpeningStock(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success('Opening stock added successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateMinStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      inventoryId: string;
      minimumQuantity: number;
      reorderQuantity?: number;
    }) => inventoryService.updateMinStock(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success('Minimum stock quantities updated');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateReorderLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { inventoryId: string; reorderQuantity: number }) =>
      inventoryService.updateReorderLevel(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success('Reorder level updated');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ---- STOCK ALERTS HOOKS ----
export function useStockAlerts(params?: {
  page?: number;
  limit?: number;
  warehouseId?: string;
  alertType?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: INVENTORY_KEYS.alertsList(params),
    queryFn: () => inventoryService.getStockAlerts(params),
    staleTime: 5000,
  });
}

export function useTriggerAlertScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, warehouseId }: { companyId: string; warehouseId?: string }) =>
      inventoryService.triggerAlertScan(companyId, warehouseId),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success(
        `Scan complete! Generated ${result.created} alerts, resolved ${result.resolved}.`,
      );
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useResolveStockAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryService.resolveStockAlert(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.alerts() });
      toast.success('Stock alert resolved');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useReorderSuggestions(companyId: string, warehouseId?: string) {
  return useQuery({
    queryKey: [...INVENTORY_KEYS.suggestions(), companyId, warehouseId],
    queryFn: () => inventoryService.getReorderSuggestions(companyId, warehouseId),
    enabled: !!companyId,
  });
}

// ---- STOCK MOVEMENT / LEDGER HOOKS ----
export function useInventoryLedger(params?: StockHistoryFilterParams) {
  return useQuery({
    queryKey: INVENTORY_KEYS.ledgerList(params),
    queryFn: () => inventoryService.getLedgerEntries(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useLedgerEntry(id: string) {
  return useQuery({
    queryKey: [...INVENTORY_KEYS.ledger(), 'detail', id],
    queryFn: () => inventoryService.getLedgerEntry(id),
    enabled: !!id,
  });
}

// ---- BATCH HOOKS ----
export function useBatches(params?: BatchFilterParams) {
  return useQuery({
    queryKey: BATCH_KEYS.list(params),
    queryFn: () => batchService.getBatches(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useBatchRecord(id: string) {
  return useQuery({
    queryKey: BATCH_KEYS.detail(id),
    queryFn: () => batchService.getBatch(id),
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      warehouseId: string;
      productId: string;
      batchNumber: string;
      manufacturingDate?: string;
      expiryDate?: string;
      quantity: number;
      remarks?: string;
    }) => batchService.createBatch(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BATCH_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success('Batch registered successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateBatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: BatchStatus; remarks?: string };
    }) => batchService.updateBatchStatus(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: BATCH_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: [...BATCH_KEYS.all, data.id] });
      toast.success(`Batch status updated to ${data.status}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useExpireOldBatches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => batchService.expireOldBatches(),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: BATCH_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success(`Batch expiry job run complete. Expired ${res.count} batches.`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ---- SERIAL HOOKS ----
export function useSerials(params?: SerialFilterParams) {
  return useQuery({
    queryKey: SERIAL_KEYS.list(params),
    queryFn: () => serialService.getSerials(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useSerialRecord(id: string) {
  return useQuery({
    queryKey: SERIAL_KEYS.detail(id),
    queryFn: () => serialService.getSerial(id),
    enabled: !!id,
  });
}

export function useRegisterSerial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      warehouseId: string;
      productId: string;
      serialNumber: string;
      remarks?: string;
    }) => serialService.registerSerial(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERIAL_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success('Serial number registered successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useRegisterSerialBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      companyId: string;
      warehouseId: string;
      productId: string;
      serialNumbers: string[];
      remarks?: string;
    }) => serialService.registerSerialBulk(payload),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: SERIAL_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      toast.success(`Successfully registered ${res.count} serial numbers`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateSerialStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: SerialStatus; remarks?: string };
    }) => serialService.updateSerialStatus(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: SERIAL_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: [...SERIAL_KEYS.all, data.id] });
      toast.success(`Serial status updated to ${data.status}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
