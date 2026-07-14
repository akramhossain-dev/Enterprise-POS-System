'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '@/services/warehouse.service';
import type { Warehouse, WarehouseFilterParams, WarehouseMetadata } from '@/types/warehouse';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const WAREHOUSES_KEY = ['warehouses'] as const;

export function useWarehouses(params?: WarehouseFilterParams) {
  return useQuery({
    queryKey: [...WAREHOUSES_KEY, params],
    queryFn: () => warehouseService.listWarehouses(params),
    staleTime: 10_000,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: [...WAREHOUSES_KEY, id],
    queryFn: () => warehouseService.getWarehouse(id),
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (
      payload: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'> & { metadata?: WarehouseMetadata },
    ) => warehouseService.createWarehouse(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
      toast.success('Warehouse registered successfully');
      router.push(`/warehouses/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>> & {
        metadata?: Partial<WarehouseMetadata>;
      };
    }) => warehouseService.updateWarehouse(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
      void queryClient.invalidateQueries({ queryKey: [...WAREHOUSES_KEY, data.id] });
      toast.success('Warehouse credentials updated');
      router.push(`/warehouses/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warehouseService.deleteWarehouse(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
      toast.success('Warehouse facility archived');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
