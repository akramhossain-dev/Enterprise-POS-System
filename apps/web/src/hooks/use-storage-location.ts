'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageLocationService } from '@/services/storage-location.service';
import type { StorageLocation } from '@/types/warehouse';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';

const LOCATIONS_KEY = ['storage-locations'] as const;

export function useStorageLocations(warehouseId?: string) {
  return useQuery({
    queryKey: [...LOCATIONS_KEY, { warehouseId }],
    queryFn: () => storageLocationService.listLocations(warehouseId),
    staleTime: 15_000,
  });
}

export function useCreateStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>) =>
      storageLocationService.createLocation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success('Storage location bin configured');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => storageLocationService.updateLocation(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success('Storage location modified');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageLocationService.deleteLocation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success('Storage location removed');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
