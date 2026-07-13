'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import type { Product, ProductFilterParams } from '@/types/product';
import { toast } from 'sonner';

export const PRODUCTS_KEY = ['products'] as const;
export const CATEGORIES_KEY = ['categories'] as const;
export const BRANDS_KEY = ['brands'] as const;
export const UNITS_KEY = ['units'] as const;
export const TAXES_KEY = ['taxes'] as const;

export function useProducts(params?: ProductFilterParams) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, params],
    queryFn: () => productService.getProducts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'companyId'> & {
        companyId: string;
      },
    ) => productService.createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create product';
      toast.error(message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) =>
      productService.updateProduct(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.archiveProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Product archived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to archive product';
      toast.error(message);
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.restoreProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Product restored successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to restore product';
      toast.error(message);
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => productService.getCategories(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: BRANDS_KEY,
    queryFn: () => productService.getBrands(),
  });
}

export function useUnits() {
  return useQuery({
    queryKey: UNITS_KEY,
    queryFn: () => productService.getUnits(),
  });
}

export function useTaxes() {
  return useQuery({
    queryKey: TAXES_KEY,
    queryFn: () => productService.getTaxes(),
  });
}
