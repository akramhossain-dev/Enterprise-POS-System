'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountingService } from '@/services/accounting.service';
import { toast } from 'sonner';

export const ACCOUNTING_DASHBOARD_KEY = ['accounting-dashboard-stats'] as const;
export const ACCOUNTS_KEY = ['chart-accounts-list'] as const;
export const GROUPS_KEY = ['account-groups-list'] as const;
export const CATEGORIES_KEY = ['account-categories-list'] as const;

export function useAccountingDashboard() {
  return useQuery({
    queryKey: ACCOUNTING_DASHBOARD_KEY,
    queryFn: () => accountingService.getDashboardStats(),
  });
}

export function useAccounts(params?: Parameters<typeof accountingService.getAccounts>[0]) {
  return useQuery({
    queryKey: [...ACCOUNTS_KEY, params],
    queryFn: () => accountingService.getAccounts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAccountDetails(id: string) {
  return useQuery({
    queryKey: ['account-details', id],
    queryFn: () => accountingService.getAccount(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createAccount(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Chart of Accounts ledger created successfully.');
    },
    onError: () => {
      toast.error('Failed to create account.');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      accountingService.updateAccount(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['account-details', data.id] });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Account updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update account.');
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.archiveAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Account archived successfully.');
    },
    onError: () => {
      toast.error('Failed to archive account.');
    },
  });
}

export function useRestoreAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.restoreAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Account restored successfully.');
    },
    onError: () => {
      toast.error('Failed to restore account.');
    },
  });
}

// Groups hooks
export function useGroups() {
  return useQuery({
    queryKey: GROUPS_KEY,
    queryFn: () => accountingService.getGroups(),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createGroup(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
      toast.success('Account group created.');
    },
    onError: () => {
      toast.error('Failed to create account group.');
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteGroup(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
      toast.success('Account group deleted.');
    },
    onError: () => {
      toast.error('Failed to delete account group.');
    },
  });
}

// Categories hooks
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => accountingService.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Account category created.');
    },
    onError: () => {
      toast.error('Failed to create account category.');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Account category deleted.');
    },
    onError: () => {
      toast.error('Failed to delete account category.');
    },
  });
}
