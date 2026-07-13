'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginInput } from '@/utils/validators';
import { normalizeError } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput, unknown, LoginInput>({
    resolver: zodResolver(loginSchema) as never,
    defaultValues: { email: '', password: '', rememberMe: false },
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

  return (
    <div className="glass-card rounded-2xl p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Sign In</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access the system</p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          title="Authentication failed"
          description={error}
          dismissible
          onDismiss={() => setError(null)}
          className="mb-5"
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Login form"
        className="space-y-4"
      >
        <Input
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-input accent-primary"
              {...register('rememberMe')}
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <a
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          loading={isLoading}
          rightIcon={<LogIn className="w-4 h-4" />}
          id="login-submit"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
