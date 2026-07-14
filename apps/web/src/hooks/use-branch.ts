'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '@/services/branch.service';
import type { Branch, BranchFilterParams, BranchMetadata } from '@/types/warehouse';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const BRANCHES_KEY = ['branches'] as const;

export function useBranches(params?: BranchFilterParams) {
  return useQuery({
    queryKey: [...BRANCHES_KEY, params],
    queryFn: () => branchService.listBranches(params),
    staleTime: 30_000,
  });
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: [...BRANCHES_KEY, id],
    queryFn: () => branchService.getBranch(id),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (
      payload: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'> & { metadata?: BranchMetadata },
    ) => branchService.createBranch(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
      toast.success('Branch location created successfully');
      router.push(`/branches/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>> & {
        metadata?: Partial<BranchMetadata>;
      };
    }) => branchService.updateBranch(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
      void queryClient.invalidateQueries({ queryKey: [...BRANCHES_KEY, data.id] });
      toast.success('Branch details updated successfully');
      router.push(`/branches/${data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => branchService.deleteBranch(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
      toast.success('Branch archived successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
