'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordInput } from '@/utils/validators';
import { useChangePassword } from '@/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PasswordInput } from '@/components/auth/password-input';
import { PasswordStrengthIndicator } from '@/components/auth/password-strength';
import { useState } from 'react';

export function ChangePasswordForm() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput, unknown, ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema) as never,
    mode: 'onBlur',
  });

  const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';

  const onSubmit = (data: ChangePasswordInput) => {
    setFormError(null);
    changePassword(data, {
      onSuccess: () => reset(),
      onError: (err: unknown) => {
        const e = err as { message?: string };
        setFormError(e.message ?? 'Failed to change password');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <Alert
          variant="destructive"
          title="Failed to change password"
          description={formError}
          dismissible
          onDismiss={() => setFormError(null)}
        />
      )}

      <PasswordInput
        {...register('currentPassword')}
        id="currentPassword"
        label="Current password"
        placeholder="Your current password"
        autoComplete="current-password"
        required
        error={errors.currentPassword?.message}
      />

      <div className="space-y-2">
        <PasswordInput
          {...register('newPassword')}
          id="newPassword"
          label="New password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          required
          error={errors.newPassword?.message}
        />
        <PasswordStrengthIndicator password={newPassword} />
      </div>

      <PasswordInput
        {...register('confirmPassword')}
        id="confirmPassword"
        label="Confirm new password"
        placeholder="Repeat your new password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={isPending} leftIcon={<KeyRound className="w-4 h-4" />}>
          Update password
        </Button>
      </div>
    </form>
  );
}
