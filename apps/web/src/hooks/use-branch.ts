'use client';

import { useQuery } from '@tanstack/react-query';
import { branchService } from '@/services/branch.service';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.listBranches(),
    staleTime: 60_000,
  });
}
