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

// ----------------------------------------------------
// JOURNAL ENTRIES HOOKS
// ----------------------------------------------------
export const JOURNALS_KEY = ['accounting-journals-list'] as const;

export function useJournals(params?: Parameters<typeof accountingService.getJournals>[0]) {
  return useQuery({
    queryKey: [...JOURNALS_KEY, params],
    queryFn: () => accountingService.getJournals(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useJournalDetails(id: string) {
  return useQuery({
    queryKey: ['journal-details', id],
    queryFn: () => accountingService.getJournal(id),
    enabled: !!id,
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createJournal(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOURNALS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Journal entry created successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create journal entry.');
    },
  });
}

export function useUpdateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      accountingService.updateJournal(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: JOURNALS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['journal-details', data.id] });
      toast.success('Journal entry updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update journal entry.');
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteJournal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOURNALS_KEY });
      toast.success('Journal entry deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete journal entry.');
    },
  });
}

export function usePostJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.postJournal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOURNALS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Journal entry posted to ledgers successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to post journal entry.');
    },
  });
}

export function useApproveJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.approveJournal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOURNALS_KEY });
      toast.success('Journal entry approved successfully.');
    },
    onError: () => {
      toast.error('Failed to approve journal entry.');
    },
  });
}

export function useCancelJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.cancelJournal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOURNALS_KEY });
      toast.success('Journal entry cancelled.');
    },
    onError: () => {
      toast.error('Failed to cancel journal entry.');
    },
  });
}

export function useReverseJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.reverseJournal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JOURNALS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Journal entry reversal posted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to reverse journal entry.');
    },
  });
}

// ----------------------------------------------------
// GENERAL & ACCOUNT LEDGER HOOKS
// ----------------------------------------------------
export const GENERAL_LEDGER_KEY = ['accounting-general-ledger'] as const;
export const ACCOUNT_LEDGER_KEY = ['accounting-account-ledger'] as const;

export function useGeneralLedger(
  params?: Parameters<typeof accountingService.getGeneralLedger>[0],
) {
  return useQuery({
    queryKey: [...GENERAL_LEDGER_KEY, params],
    queryFn: () => accountingService.getGeneralLedger(params),
  });
}

export function useAccountLedger(
  accountId: string,
  params?: Parameters<typeof accountingService.getAccountLedger>[1],
) {
  return useQuery({
    queryKey: [...ACCOUNT_LEDGER_KEY, accountId, params],
    queryFn: () => accountingService.getAccountLedger(accountId, params),
    enabled: !!accountId,
  });
}

// ----------------------------------------------------
// INCOME HOOKS
// ----------------------------------------------------
export const INCOMES_KEY = ['accounting-incomes-list'] as const;

export function useIncomes(params?: Parameters<typeof accountingService.getIncomes>[0]) {
  return useQuery({
    queryKey: [...INCOMES_KEY, params],
    queryFn: () => accountingService.getIncomes(params),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createIncome(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INCOMES_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Income transaction logged successfully.');
    },
    onError: () => {
      toast.error('Failed to log income transaction.');
    },
  });
}

// ----------------------------------------------------
// EXPENSE HOOKS
// ----------------------------------------------------
export const EXPENSES_KEY = ['accounting-expenses-list'] as const;

export function useExpenses(params?: Parameters<typeof accountingService.getExpenses>[0]) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, params],
    queryFn: () => accountingService.getExpenses(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createExpense(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Expense transaction logged successfully.');
    },
    onError: () => {
      toast.error('Failed to log expense transaction.');
    },
  });
}

// ----------------------------------------------------
// CASH & BANK BOOK HOOKS
// ----------------------------------------------------
export const CASH_BOOK_KEY = ['accounting-cash-book'] as const;
export const BANK_BOOK_KEY = ['accounting-bank-book'] as const;

export function useCashBook(params?: Parameters<typeof accountingService.getCashBook>[0]) {
  return useQuery({
    queryKey: [...CASH_BOOK_KEY, params],
    queryFn: () => accountingService.getCashBook(params),
  });
}

export function useBankBook(params?: Parameters<typeof accountingService.getBankBook>[0]) {
  return useQuery({
    queryKey: [...BANK_BOOK_KEY, params],
    queryFn: () => accountingService.getBankBook(params),
  });
}

// ----------------------------------------------------
// VOUCHER HOOKS
// ----------------------------------------------------
export const VOUCHERS_KEY = ['accounting-vouchers-list'] as const;

export function useVouchers(params?: Parameters<typeof accountingService.getVouchers>[0]) {
  return useQuery({
    queryKey: [...VOUCHERS_KEY, params],
    queryFn: () => accountingService.getVouchers(params),
  });
}

export function useCreatePaymentVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createPaymentVoucher(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Payment voucher generated successfully.');
    },
    onError: () => {
      toast.error('Failed to create payment voucher.');
    },
  });
}

export function useCreateReceiptVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => accountingService.createReceiptVoucher(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Receipt voucher generated successfully.');
    },
    onError: () => {
      toast.error('Failed to create receipt voucher.');
    },
  });
}

export function useApproveVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.approveVoucher(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTING_DASHBOARD_KEY });
      toast.success('Voucher approved and processed successfully.');
    },
    onError: () => {
      toast.error('Failed to approve voucher.');
    },
  });
}

export function useCancelVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingService.cancelVoucher(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VOUCHERS_KEY });
      toast.success('Voucher cancelled successfully.');
    },
    onError: () => {
      toast.error('Failed to cancel voucher.');
    },
  });
}
