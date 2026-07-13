'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { normalizeError } from '@/utils/error';
import { toast } from 'sonner';
import type { UpdateProfilePayload } from '@/types/auth';
import type { ChangePasswordPayload } from '@/types/auth';

const PROFILE_KEY = ['profile'] as const;

/** Fetch the current user's profile. */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => userService.getProfile(),
    staleTime: 5 * 60 * 1_000,
  });
}

/** Update profile details. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success('Profile updated successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

/** Upload avatar image. */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { setUser, user } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: ({ avatarUrl }) => {
      if (user) {
        setUser({ ...user, avatar: avatarUrl });
      }
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success('Avatar updated successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

/** Delete current avatar. */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { setUser, user } = useAuthStore();

  return useMutation({
    mutationFn: () => userService.deleteAvatar(),
    onSuccess: () => {
      if (user) {
        setUser({ ...user, avatar: null });
      }
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success('Avatar removed');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}

/** Change password. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (err: unknown) => {
      toast.error(normalizeError(err).message);
    },
  });
}
