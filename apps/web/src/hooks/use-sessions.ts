'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';

const SESSIONS_KEY = ['sessions'] as const;

/** Fetch all active sessions for the current user. */
export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => authService.getActiveSessions(),
    staleTime: 30_000,
  });
}

/** Revoke a specific session by ID. */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('Session revoked');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

/** Revoke ALL sessions except the current one. */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.revokeAllSessions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('All other sessions revoked');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
