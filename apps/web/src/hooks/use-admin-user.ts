'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/services/admin-user.service';
import type { AdminUser, UserFilterParams } from '@/types/admin-user';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';

const USERS_KEY = ['admin-users'] as const;
const SESSIONS_KEY = ['admin-user-sessions'] as const;
const LOGS_KEY = ['admin-user-logs'] as const;

export function useAdminUsers(params?: UserFilterParams) {
  return useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () => adminUserService.listUsers(params),
    staleTime: 10_000,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () => adminUserService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      phone?: string;
      roleId: string;
      password?: string;
    }) => adminUserService.createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User account registered successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => adminUserService.updateUser(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
      void queryClient.invalidateQueries({ queryKey: [...USERS_KEY, data.id] });
      toast.success('User profile updated successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUserService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('User account deactivated / soft-deleted');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Sessions & Security Monitoring ─────────────────────

export function useUserSessions(userId: string) {
  return useQuery({
    queryKey: [...SESSIONS_KEY, userId],
    queryFn: () => adminUserService.getUserSessions(userId),
    enabled: !!userId,
  });
}

export function useRevokeUserSession(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => adminUserService.revokeUserSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...SESSIONS_KEY, userId] });
      toast.success('Session terminated successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

export function useRevokeAllUserSessions(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminUserService.revokeAllUserSessions(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...SESSIONS_KEY, userId] });
      toast.success('All other user sessions terminated');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Login History & Audit logs ────────────────────────

export function useLoginHistory(params?: { page?: number; limit?: number; userId?: string }) {
  return useQuery({
    queryKey: [...LOGS_KEY, 'login-history', params],
    queryFn: () => adminUserService.listLoginHistory(params),
    staleTime: 20_000,
  });
}

export function useAuditLogs(params?: { page?: number; limit?: number; userId?: string }) {
  return useQuery({
    queryKey: [...LOGS_KEY, 'audit-logs', params],
    queryFn: () => adminUserService.listAuditLogs(params),
    staleTime: 20_000,
  });
}
