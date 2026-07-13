'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginInput } from '@/utils/validators';
import { normalizeError } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { PasswordInput } from './password-input';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput, unknown, LoginInput>({
    resolver: zodResolver(loginSchema) as never,
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      const normalized = normalizeError(err);
      setError(normalized.message);
    }
  };

  const isSubmittingForm = isSubmitting || isLoading;

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {error && (
        <Alert
          variant="destructive"
          title="Sign in failed"
          description={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

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

      <div className="space-y-1">
        <PasswordInput
          {...register('password')}
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none group">
        <input
          {...register('rememberMe')}
          type="checkbox"
          id="rememberMe"
          className="w-4 h-4 rounded border-input bg-background accent-primary cursor-pointer"
        />
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          Remember me for 30 days
        </span>
      </label>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmittingForm}
        leftIcon={!isSubmittingForm ? <LogIn className="w-4 h-4" /> : undefined}
      >
        {isSubmittingForm ? 'Signing in…' : 'Sign in'}
      </Button>
    </motion.form>
  );
}
