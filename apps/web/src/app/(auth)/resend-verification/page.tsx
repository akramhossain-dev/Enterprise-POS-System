'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { resendVerificationSchema, type ResendVerificationInput } from '@/utils/validators';
import { authService } from '@/services/auth.service';
import { normalizeError } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export default function ResendVerificationPage() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationInput, unknown, ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema) as never,
  });

  const onSubmit = async (data: ResendVerificationInput) => {
    setError(null);
    try {
      await authService.resendVerification({ email: data.email });
      setSentTo(data.email);
      setStatus('success');
    } catch (err) {
      setError(normalizeError(err).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resend verification</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a new verification link.
        </p>
      </div>

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
              <p className="font-medium text-foreground">Verification email sent!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check your inbox at <span className="font-medium">{sentTo}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="flex items-center gap-1.5 mx-auto text-sm text-primary hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Send again
            </button>
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
            {error && <Alert variant="destructive" title="Failed to send" description={error} />}

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
              Send verification email
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
    </div>
  );
}
