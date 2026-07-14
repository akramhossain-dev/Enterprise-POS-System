'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '@/services/department.service';
import { designationService } from '@/services/designation.service';
import type { Department, Designation } from '@/types/employee';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';

const DEPTS_KEY = ['departments'] as const;
const DESIGS_KEY = ['designations'] as const;

export function useDepartments(includeInactive = false) {
  return useQuery({
    queryKey: [...DEPTS_KEY, { includeInactive }],
    queryFn: () =>
      includeInactive
        ? departmentService.listAllDepartments()
        : departmentService.listDepartments(),
    staleTime: 30_000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) =>
      departmentService.createDepartment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEPTS_KEY });
      toast.success('Department created successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => departmentService.updateDepartment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEPTS_KEY });
      toast.success('Department updated successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEPTS_KEY });
      toast.success('Department deleted successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Designation Hooks ───────────────────────────────

export function useDesignations(includeInactive = false) {
  return useQuery({
    queryKey: [...DESIGS_KEY, { includeInactive }],
    queryFn: () =>
      includeInactive
        ? designationService.listAllDesignations()
        : designationService.listDesignations(),
    staleTime: 30_000,
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Designation, 'id' | 'createdAt' | 'updatedAt'>) =>
      designationService.createDesignation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DESIGS_KEY });
      toast.success('Designation created successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<Designation, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => designationService.updateDesignation(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DESIGS_KEY });
      toast.success('Designation updated successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => designationService.deleteDesignation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DESIGS_KEY });
      toast.success('Designation deleted successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
