'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/utils/validators';
import { authService } from '@/services/auth.service';
import { normalizeError } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput, unknown, ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema) as never,
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    try {
      await authService.forgotPassword({ email: data.email });
      setSentTo(data.email);
      setStatus('success');
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
            <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a password reset link to{' '}
              <span className="font-medium text-foreground">{sentTo}</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
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
          {error && <Alert variant="destructive" title="Request failed" description={error} />}

          <Input
            {...register('email')}
            id="email"
            type="email"
            label="Email address"
            placeholder="you@company.com"
            autoComplete="email"
            autoFocus
            required
            leftElement={<Mail className="w-4 h-4 text-muted-foreground" />}
            error={errors.email?.message}
          />

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            Send reset link
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
