'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { brandService } from '@/services/brand.service';
import { unitService } from '@/services/unit.service';
import type { Category, Brand, Unit } from '@/types/product';
import { toast } from 'sonner';

export const CATEGORY_LIST_KEY = ['categories-list'] as const;
export const BRAND_LIST_KEY = ['brands-list'] as const;
export const UNIT_LIST_KEY = ['units-list'] as const;

// ─────────────────────────────────────────────
// Category Hooks
// ─────────────────────────────────────────────

export function useCategoriesList(params?: Parameters<typeof categoryService.getCategories>[0]) {
  return useQuery({
    queryKey: [...CATEGORY_LIST_KEY, params],
    queryFn: () => categoryService.getCategories(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | '_count'>) =>
      categoryService.createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_KEY });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create category';
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Category> }) =>
      categoryService.updateCategory(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: ['category', data.id] });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update category';
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_KEY });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete category';
      toast.error(message);
    },
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.archiveCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_KEY });
      toast.success('Category archived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to archive category';
      toast.error(message);
    },
  });
}

export function useRestoreCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.restoreCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_KEY });
      toast.success('Category restored successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to restore category';
      toast.error(message);
    },
  });
}

// ─────────────────────────────────────────────
// Brand Hooks
// ─────────────────────────────────────────────

export function useBrandsList(params?: Parameters<typeof brandService.getBrands>[0]) {
  return useQuery({
    queryKey: [...BRAND_LIST_KEY, params],
    queryFn: () => brandService.getBrands(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => brandService.getBrand(id),
    enabled: !!id,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Brand, 'id' | 'createdAt' | 'updatedAt' | '_count'>) =>
      brandService.createBrand(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRAND_LIST_KEY });
      toast.success('Brand created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create brand';
      toast.error(message);
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Brand> }) =>
      brandService.updateBrand(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: BRAND_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: ['brand', data.id] });
      toast.success('Brand updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update brand';
      toast.error(message);
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRAND_LIST_KEY });
      toast.success('Brand deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete brand';
      toast.error(message);
    },
  });
}

export function useArchiveBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.archiveBrand(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRAND_LIST_KEY });
      toast.success('Brand archived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to archive brand';
      toast.error(message);
    },
  });
}

export function useRestoreBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.restoreBrand(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRAND_LIST_KEY });
      toast.success('Brand restored successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to restore brand';
      toast.error(message);
    },
  });
}

// ─────────────────────────────────────────────
// Unit Hooks
// ─────────────────────────────────────────────

export function useUnitsList(params?: Parameters<typeof unitService.getUnits>[0]) {
  return useQuery({
    queryKey: [...UNIT_LIST_KEY, params],
    queryFn: () => unitService.getUnits(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => unitService.getUnit(id),
    enabled: !!id,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Unit, 'id' | 'createdAt' | 'updatedAt' | '_count'>) =>
      unitService.createUnit(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNIT_LIST_KEY });
      toast.success('Unit created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create unit';
      toast.error(message);
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Unit> }) =>
      unitService.updateUnit(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: UNIT_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: ['unit', data.id] });
      toast.success('Unit updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update unit';
      toast.error(message);
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitService.deleteUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNIT_LIST_KEY });
      toast.success('Unit deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete unit';
      toast.error(message);
    },
  });
}

export function useArchiveUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitService.archiveUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNIT_LIST_KEY });
      toast.success('Unit archived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to archive unit';
      toast.error(message);
    },
  });
}

export function useRestoreUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitService.restoreUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNIT_LIST_KEY });
      toast.success('Unit restored successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to restore unit';
      toast.error(message);
    },
  });
}
