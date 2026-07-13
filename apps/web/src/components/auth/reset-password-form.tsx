'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema, type ResetPasswordInput } from '@/utils/validators';
import { authService } from '@/services/auth.service';
import { normalizeError } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PasswordInput } from './password-input';
import { PasswordStrengthIndicator } from './password-strength';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput, unknown, ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema) as never,
    defaultValues: { token },
  });

  const newPassword = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);
    try {
      await authService.resetPassword(data);
      setStatus('success');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(normalizeError(err).message);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Password reset!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your password has been updated. Redirecting you to sign in…
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Sign in now
          </Link>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <input type="hidden" {...register('token')} />

          {error && <Alert variant="destructive" title="Reset failed" description={error} />}

          <div className="space-y-2">
            <PasswordInput
              {...register('password')}
              id="password"
              label="New password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              error={errors.password?.message}
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

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            Reset password
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
