'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRoleService } from '@/services/admin-role.service';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';

const ROLES_KEY = ['admin-roles'] as const;
const PERMISSIONS_KEY = ['admin-permissions'] as const;

export function usePermissions() {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: () => adminRoleService.listPermissions(),
    staleTime: 300_000, // Long cache time for static permission list
  });
}

export function useAdminRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => adminRoleService.listRoles(),
    staleTime: 20_000,
  });
}

export function useAdminRole(id: string) {
  return useQuery({
    queryKey: [...ROLES_KEY, id],
    queryFn: () => adminRoleService.getRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description?: string | null; permissions: string[] }) =>
      adminRoleService.createRole(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Security role created successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; description?: string | null; permissions?: string[] };
    }) => adminRoleService.updateRole(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      void queryClient.invalidateQueries({ queryKey: [...ROLES_KEY, data.id] });
      toast.success('Security role permissions updated');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRoleService.deleteRole(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Custom security role deleted');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
